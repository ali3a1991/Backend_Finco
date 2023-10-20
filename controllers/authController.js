"use strict"

import { getDb } from "../utils/db.js"
import { ObjectId } from "mongodb"
import { createToken } from "../utils/jwtoken.js"
import { uploadImage } from "../utils/imageService.js"

export const register = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()

    const userExisting = await db.collection("users").findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    })
    if (userExisting) {
      res.status(405).json({ error: "username or email already used" })
    } else {
      const responseUsers = await db.collection("users").insertOne({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cloudinary_image_id: "",
        profile_image_url: "",
        spending_limit: 3000,
      })
      const user_id = responseUsers.insertedId

      const responseCards = await db.collection("cards").insertOne({
        owner: new ObjectId(user_id),
        expiration_date: "",
        card_number: "",
      })

      if (responseUsers && responseCards) {
        const token = createToken({ user: user_id })

        res.cookie("finco_token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        })

        res.json({
          _id: user_id,
          username: responseUsers.username,
          profile_image_url: responseUsers.profile_image_url,
          spending_limit: responseUsers.spending_limit,
          expiration_date: responseCards.expiration_date,
          card_number: responseCards.card_number,
        })
      } else {
        console.error("Register in DB failed")
        res.status(500).end(error.message)
      }
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end(error.message)
  }
}


export const login = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()
    const responseUsers = await db.collection("users").findOne({
      email: req.body.email,
      password: req.body.password,
    })
    if (responseUsers) {
      const user_id = responseUsers._id

      const responseCards = await db.collection("cards").findOne({
        owner: new ObjectId(user_id),
      })

      if (responseUsers && responseCards) {
        const token = createToken({ user: user_id })

        res.cookie("finco_token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        })

        res.json({
          _id: user_id,
          username: responseUsers.username,
          profile_image_url: responseUsers.profile_image_url,
          spending_limit: responseUsers.spending_limit,
          expiration_date: responseCards.expiration_date,
          card_number: responseCards.card_number,
        })
      }
    } else {
      console.log("user not found")
      res.status(403).end()
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end(error.message)
  }
}


export const validateToken = async (_, res) => {
  res.end()
}


export const updateProfile = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()
    const selectedUser = await db.collection("users").findOne({ 
      _id: new ObjectId(req.body._id) 
    })
    if (selectedUser) {
      if (req.file && req.file.mimetype.startsWith("image/")) {
        const { public_id, secure_url } = await uploadImage(req.file.buffer)
        const responseUsers = await db.collection("users").updateOne(
          { _id: new ObjectId(req.body._id) },
          {
            $set: {
              profile_image_url: secure_url,
              cloudinary_image_id: public_id,
            },
          }
        )
        if (!responseUsers) res.status(500).end()

        // spending limit ändern: if (req.body.spending_limit) const responseUsersSpending
      }

      if (req.body.card_number) {
        const responseCards = await db.collection("cards").updateOne(
          { owner: new ObjectId(req.body._id) },
          {
            $set: {
              card_number: req.body.card_number,
              expiration_date: req.body.expiration_date,
            },
          }
        )
        if (!responseCards) res.status(500).end()
      }

      // weil db.updateOne() nicht den geänderten Datensatz selbst zurück gibt muss response content extra ziehen
      const updatedSelectedUser = await db.collection("users").findOne({
        _id: new ObjectId(req.body._id)
      })

      res.json({
        _id: updatedSelectedUser._id,
        username: updatedSelectedUser.username,
        profile_image_url: updatedSelectedUser.profile_image_url,
        spending_limit: updatedSelectedUser.spending_limit,
        expiration_date: updatedSelectedUser.expiration_date,
        card_number: updatedSelectedUser.card_number,
      })
    } else {
      console.log("User not found")
      res.status(404).end()
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end(error.message)
  }
}