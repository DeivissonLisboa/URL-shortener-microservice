require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const app = express()
const MONGO_URI = process.env["MONGO_URI"]

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.once("open", () => console.log("Connected to MongoDB"))

const shortUrlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
})

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema)

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

// Your first API endpoint
// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
