"use strict"

import express from 'express'

import { encrypt } from '../middlewares/encryptMiddleware.js'
import { getUsers, register, updateProfile } from '../controllers/authController.js'

export const router = new express.Router()

router.post("/register", encrypt, register)
router.post("/profile", updateProfile)


// TESTING
router.get("/", getUsers)