import { getDb } from "../utils/db.js"

export const card = async (req, res) => {
  const db = await getDb()
  const user = await db.collection("users").findOne(req.body)

  if (!user) {
    res.status(403).end()
  } else {
    const cards = await db.collection("cards").find({ owner: user._id })
    res.json(cards)
  }
}