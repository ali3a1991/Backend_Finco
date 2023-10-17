import { ObjectId } from "bson"
import { getDb } from "../utils/db.js"

export const addCard = async (req, res) => {
  const db = await getDb()
  const user = await db.collection("users").findOne({_id: new ObjectId(req.body.owner)})

  if (!user) {
    res.status(403).end()
  } else {
    req.body.owner = new ObjectId(req.body.owner)
    await db.collection("cards").insertOne(req.body)
    res.end()
  }
}

export const card = async (req, res) => {
  const db = await getDb()
  const user = await db.collection("users").findOne({_id: new ObjectId(req.body.owner)})

  if (!user) {
    res.status(403).end()
  } else {
    const cards = await db.collection("cards").find({ owner: user._id }).toArray()
    res.json(cards)
  }
}
