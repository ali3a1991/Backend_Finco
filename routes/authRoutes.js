"use strict"

import express from 'express'

import { encrypt } from '../middlewares/authMiddleware.js'
import { register } from '../controllers/authController.js'

export const router = new express.Router()

router.post("/register", encrypt, register)