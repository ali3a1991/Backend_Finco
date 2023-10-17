import express from "express"
import { addCard, card } from "../controllers/cardController.js"

export const router = new express.Router()

router.post("/data", card)
router.post("/data", addCard)