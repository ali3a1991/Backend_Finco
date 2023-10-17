"use strict"

export const register = async (req, res) => {
  console.log(req.body)
  res.status(205).end()
}