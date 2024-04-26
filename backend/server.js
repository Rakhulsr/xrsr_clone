import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRoutes from "../backend/routes/auth.route.js";
import connectMongoDB from "./db/dbConnect.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, (err) => {
  if (err) console.error(err);

  console.log("Server Running on port", PORT);
  connectMongoDB();
});
