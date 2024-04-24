import express from "express"
import "dotenv/config"

import authRoutes from "../backend/routes/auth.route.js"
import connectMongoDB from "./db/dbConnect.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use("/api/auth", authRoutes)

app.listen(PORT, (err) => {
  if (err) console.error(err)

  console.log("Server Running on port", PORT)
  connectMongoDB()
})
