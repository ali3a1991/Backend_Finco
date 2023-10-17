import express from "express"
import { card } from "../controllers/cardController.js"

export const router = new express.Router()

router.get("/data", card)