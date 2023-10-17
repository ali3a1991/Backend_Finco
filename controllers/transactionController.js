import { ObjectId } from "bson"
import { getDb } from "../utils/db.js"

export const addTransaction = async (req, res) => {
  console.log(req.body.owner)
  const db = await getDb()
  const card = await db.collection("cards").findOne({_id: new ObjectId(req.body.owner)})
  
  if (!card) {
    res.status(403).end()
  } else {
    req.body.owner = new ObjectId(req.body.owner)
    await db.collection("transactions").insertOne(req.body)
    res.end()
  }
}

export const transaction = async (req, res) => {
  const db = await getDb()
  const card = await db.collection("cards").findOne({_id: new ObjectId(req.body._id)})

  if (!card) {
    res.status(403).end()
  } else {
    const transactions = await db.collection("transactions").find({ owner: card._id}).toArray()
    res.json(transactions)
  }
}