"use strict"

import express from 'express'

import { encrypt } from '../middlewares/encryptMiddleware.js'
import { register, login, validateToken, updateProfile, logout, getUser } from '../controllers/authController.js'
import { auth } from '../middlewares/authMiddleware.js'

export const router = new express.Router()

router.post("/register", encrypt, register)
router.post("/login", encrypt, login)
router.get("/validate", auth, validateToken)
router.post("/profile", auth, updateProfile)
router.get("/logout", auth, logout)
router.get("/get", auth, getUser)