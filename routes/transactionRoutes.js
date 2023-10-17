import express from "express"
import { addTransaction, transaction } from "../controllers/transactionController.js"

const router = new express.Router()

router.post('/add', addTransaction)
router.get('/data', transaction)