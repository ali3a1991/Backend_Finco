import express from "express"
import {
  addTransaction,
  transaction,
} from "../controllers/transactionController.js"

export const router = new express.Router()

router.post("/add", addTransaction)
router.post("/data", transaction)
