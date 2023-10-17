"use strict"

import express from 'express'

import { encrypt } from '../middlewares/encryptMiddleware.js'
import { getUsers, register } from '../controllers/authController.js'

export const router = new express.Router()

router.post("/register", encrypt, register)


// TESTING
router.get("/", getUsers)