"use strict"

import { getDb } from "../utils/db.js"
import { createToken } from "../utils/jwtoken.js"

const COL = "users"

export const register = async (req, res) => {
  console.log(req.body)
  try {
    const db = await getDb()
    const response = await db.collection(COL).insertOne({
      "username": req.body.name,
      "email": req.body.email,
      "password":req.body.password,
      "cloudinary_image_id": "",
      "profile_image_url": "",
    })
    if(response) {
      console.log("OK")
      console.log(response)

      // register, login
      const token = createToken({user: response.insertedId}) 
      // const token = createToken({user: response._id}) 

      res.cookie("finco-token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/"
      }).end()

      // res.send(token).end()
    }
    else {
      console.error("Register in DB failed")
      res.status(500).end()
    }
  } catch (error) {
    console.error(error.message)
  }
}



// TESTING
export const getUsers = async (req, res) => {
  const db = await getDb()
  const response = await db.collection(COL).find().toArray()
  console.log(response)
  res.status(205).end()
}