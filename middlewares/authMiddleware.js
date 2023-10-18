"use strict"

import { verifyToken } from "../utils/jwtoken.js"

export const auth = async (req, res, next) => {
  const token = req.cookies.finco_token

  try {
    console.log(verifyToken(token))
    const payload = verifyToken(token)
    req.payload = payload
    next()

    // if (token === 'null') return res.status(403).end()

    // if(payload) {
    //   next()
    // } else {
    //   res.status(403).end()
    //   console.log("token expired")
    // }
  } catch (error) {
    console.error(error.message)
    res.status(500).end(error.message)
  }
}