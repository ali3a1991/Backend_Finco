"use strict"

import jwt from "jsonwebtoken"

export const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "30min"})
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}