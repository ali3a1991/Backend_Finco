import { ObjectId } from "bson"
import { getDb } from "../utils/db.js"

export const addTransaction = async (req, res) => {
  const db = await getDb()
  const card = await db.collection("cards").findOne({_id: new ObjectId(req.body.card_id)})
  
  if (!card) {
    res.status(403).end()
  } else {
    req.body.card_id = new ObjectId(req.body.card_id)
    await db.collection("transactions").insertOne(req.body)
    res.end()
  }
}

export const transaction = async (req, res) => {
  const db = await getDb()
  const card = await db.collection("cards").findOne({_id: new ObjectId(req.body.card_id)})

  if (!card) {
    res.status(403).end()
  } else {
    const transactions = await db.collection("transactions").find({ card_id: card._id}).toArray()
    const sortTransactions = transactions.sort((a,b) => b.date - a.date)
    res.json(sortTransactions)
  }
}