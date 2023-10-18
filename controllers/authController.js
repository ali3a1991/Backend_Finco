"use strict"

import { getDb } from "../utils/db.js"
import { ObjectId } from "mongodb"
import { createToken } from "../utils/jwtoken.js"
import { uploadImage } from "../utils/imageService.js"

export const register = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()

    const userExisting = await db.collection("users").findOne({$or: [{username: req.body.username}, {email: req.body.email}]})
    if (userExisting) {
      res.status(405).json({ "error": "username or email already used" })
    } else {
      const responseUsers = await db.collection("users").insertOne({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cloudinary_image_id: "",
        profile_image_url: "",
      })
      const user_id = responseUsers.insertedId
  
      const responseCards = await db.collection("cards").insertOne({
        owner: new ObjectId(user_id),
        expiration_date: "",
        card_number: "",
      })
  
      if (responseUsers && responseCards) {
        const token = createToken({ user: user_id })
  
        res.cookie("finco-token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        })
  
        res.json({ _id: user_id })
      } else {
        console.error("Register in DB failed")
        res.status(500).end()
      }
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end()
  }
}

export const updateProfile = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.body._id) })
    if (user) {
      if (req.file && req.file.mimetype.startsWith("image/")) {
        const { public_id, secure_url } = await uploadImage(req.file.buffer)
        const response = await db.collection("users").updateOne(
          { _id: new ObjectId(req.body._id) },
          {
            $set: {
              profile_image_url: secure_url,
              cloudinary_image_id: public_id,
            },
          }
        )
        if (!response) res.status(500).end()
      }

      if (req.body.card_number) {
        const response = await db.collection("cards").updateOne(
          { owner: new ObjectId(req.body._id) },
          {
            $set: {
              card_number: req.body.card_number,
              expiration_date: req.body.expiration_date,
            },
          }
        )
        if (!response) res.status(500).end()
      }

      res.status(205).end()
    } else {
      console.log("User not found")
      res.status(404).end()
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end()
  }
}

// TESTING
export const getUsers = async (req, res) => {
  const db = await getDb()
  const response = await db.collection("users").find().toArray()
  console.log(response)
  res.status(205).end()
}
