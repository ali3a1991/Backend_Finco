import "dotenv/config"
import express from "express"
import multer from "multer"
import cors from "cors"

import { router as authRouter } from "./routes/authRoutes.js"
import { router as userRouter } from "./routes/userRoutes.js"
import { router as cardRouter } from "./routes/cardRoutes.js"
import { router as transactionRouter } from "./routes/transactionRoutes.js"
import { encrypt } from "./middlewares/authMiddleware.js"

const port = process.env.PORT
const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/cards",encrypt ,cardRouter)
app.use("/api/transactions", transactionRouter)

app.listen(port, () => console.log("port: ", port))