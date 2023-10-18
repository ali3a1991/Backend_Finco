import "dotenv/config"
import express from "express"
import multer from "multer"
import cors from "cors"
import cookieParser from "cookie-parser"

import { router as authRouter } from "./routes/authRoutes.js"
import { router as cardRouter } from "./routes/cardRoutes.js"
import { router as transactionRouter } from "./routes/transactionRoutes.js"

const port = process.env.PORT
const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors({
    credentials: true,
    origin: true,
  })
)
app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", upload.single("img"), authRouter)
app.use("/api/cards", cardRouter)
app.use("/api/transactions", upload.none(), transactionRouter)

app.listen(port, () => console.log("port: ", port))
