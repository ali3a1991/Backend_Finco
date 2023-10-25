"use strict"

import { getDb } from "../utils/db.js"
import { ObjectId } from "mongodb"
import { createToken } from "../utils/jwtoken.js"
import { uploadImage } from "../utils/imageService.js"
import { validateCardNbr } from "../utils/validateCardNbr.js"

export const register = async (req, res) => {
  // console.log(req.body)

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
        default_card_number: "",
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
          // expires: new Date("2024"),
        })

        res.json({
          _id: user_id,
          username: responseUsers.username,
          profile_image_url: responseUsers.profile_image_url,
          spending_limit: responseUsers.spending_limit,
          default_card_number: responseUsers.default_card_number,
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
  // console.log(req.body)

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
          // expires: new Date("2024"),
        })

        const userAllCards = await db
          .collection("cards")
          .find({ owner: user_id })
          .toArray()

        const transactions = await db
          .collection("transactions")
          .find({ card_id: userAllCards[0]._id })
          .toArray()
        const sortTransactions = transactions.sort((a, b) => b.date - a.date)

        res.json({
          _id: user_id,
          username: responseUsers.username,
          profile_image_url: responseUsers.profile_image_url,
          spending_limit: responseUsers.spending_limit,
          default_card_number: responseUsers.default_card_number,
          expiration_date: responseCards.expiration_date,
          card_number: responseCards.card_number,
          userAllCards: userAllCards,
          transactions_default_card: sortTransactions,
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
  // console.log(req.body)

  try {
    const db = await getDb()
    const selectedUser = await db.collection("users").findOne({
      _id: new ObjectId(req.body._id),
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
              default_card_number: req.body.card_number,
            },
          }
        )
        if (!responseUsers) res.status(500).end()

        // spending limit ändern: if (req.body.spending_limit) const responseUsersSpending
      }

      if (req.body.card_number) {
        // check if card_number is valid
        const num = req.body.card_number
        const numArr = num
          .split("")
          .filter((char) => char !== " ")
          .map(Number)
        if (validateCardNbr(numArr)) {
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
        } else {
          res.status(403).send({ message: "invalid card number" })
          return
        }
      }

      // weil db.updateOne() nicht den geänderten Datensatz selbst zurück gibt muss response content extra ziehen
      const updatedSelectedUser = await db.collection("users").findOne({
        _id: new ObjectId(req.body._id),
      })

      const userAllCards = await db
        .collection("cards")
        .find({ owner: req.body._id })
        .toArray()

      res.json({
        _id: updatedSelectedUser._id,
        username: updatedSelectedUser.username,
        profile_image_url: updatedSelectedUser.profile_image_url,
        spending_limit: updatedSelectedUser.spending_limit,
        default_card_number: updatedSelectedUser.default_card_number,
        expiration_date: updatedSelectedUser.expiration_date,
        card_number: updatedSelectedUser.card_number,
        userAllCards: userAllCards,
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

export const logout = async (_, res) => {
  // res.clearCookie("finco_token", {
  //   domain: "finco-server-m2c1.onrender.com",
  //   path: "/",
  //   sameSite: "none",
  //   secure: true,
  //   expires: new Date(0),
  // })
  // res.cookie("finco_token", "", { expires: new Date() })
  // res.send({ message : "Logout successful" })
  try {
    const token = createToken({ user: "12345546848948" })

    res.cookie("finco_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    })
    res.status(200).end()
  } catch {
    res.status(404).end()
  }
}

export const getUser = async (req, res) => {
  console.log(req.payload)
  const db = await getDb()
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(req.payload.user) })
  if (user) {
    const userAllCards = await db
      .collection("cards")
      .find({ owner: user._id })
      .toArray()
    res.json({
      _id: user._id,
      username: user.username,
      profile_image_url: user.profile_image_url,
      spending_limit: user.spending_limit,
      default_card_number: user.default_card_number,
      expiration_date: user.expiration_date,
      card_number: user.card_number,
      userAllCards: userAllCards,
    })
  } else {
    console.log("User not found")
    res.status(404).end()
  }
}
