import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";

const port = process.env.PORT;
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log("port: ", port));