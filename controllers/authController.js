"use strict"

import { getDb } from "../utils/db.js"
import { ObjectId } from "mongodb"
import { createToken } from "../utils/jwtoken.js"
import { uploadImage } from "../utils/imageService.js"

export const register = async (req, res) => {
  console.log(req.body)

  try {
    const db = await getDb()

    // check if user already exists

    const response = await db.collection("users").insertOne({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    })
    if (response) {
      // register, login
      const token = createToken({ user: response.insertedId })
      // const token = createToken({user: response._id})

      res.cookie("finco-token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      })

      res.json({ _id: response.insertedId }).end()
    } else {
      console.error("Register in DB failed")
      res.status(500).end()
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).end()
  }
}

export const updateProfile = async (req, res) => {
  console.log(req.body)

  const { public_id, secure_url } = await uploadImage(req.body.buffer)

  try {
    const db = await getDb()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.body._id) })
    if (user) {
      if (req.body.profile_image_url) {
        const response = await db.collection("users").updateOne(
          { _id: new ObjectId(req.body._id) },
          {
            $set: {
              // profile_image_url: req.body.profile_image_url,
              profile_image_url: secure_url,
              cloudinary_image_id: public_id,
            },
          }
        )
        if (!response) res.status(500).end()
        if (response) console.log("image updates OK")
      }

      // if (req.body.card_number) {
      //   const response = await db.collection("cards").updateOne(
      //     { _id: new ObjectId(req.body.id) },
      //     {
      //       $set: {
      //         card_number: req.body.card_number,
      //         //expiration date
      //       },
      //     }
      //   )
      //   if (!response) res.status(500).end()
      //   if (response) console.log("card_number update OK")
      // }

      // owner = user_id


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