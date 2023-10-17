import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";

import {router as authRouter} from './routes/authRoutes.js'

const port = process.env.PORT;
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter)

app.listen(port, () => console.log("port: ", port));