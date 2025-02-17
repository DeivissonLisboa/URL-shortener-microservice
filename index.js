require("dotenv").config()
const express = require("express")
const cors = require("cors")
const URL = require("url").URL
const dns = require("dns")
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

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

function validateUrl(url) {
  try {
    let hostname = new URL(url).hostname
    dns.lookup(hostname, (err, address) => {
      if (err) return false
    })
    return true
  } catch (err) {
    return false
  }
}

app.post("/api/shorturl", (req, res) => {
  let original_url = new URL(req.body.url)

  dns.lookup(original_url.hostname, async (err) => {
    if (err) {
      res.json({
        error: "invalid url",
      })
    } else {
      let short_url = (await ShortUrl.countDocuments()) + 1

      let data = {
        original_url,
        short_url,
      }

      try {
        await ShortUrl.create(data)
      } catch (err) {
        console.error(err)
        res.sendStatus(500)
      }

      res.json(data)
    }
  })
})

app.get("/api/shorturl/:short_url", async (req, res) => {
  let short_url = req.params.short_url

  try {
    let { original_url } = await ShortUrl.findOne({ short_url })
    res.redirect(original_url)
  } catch (err) {
    res.sendStatus(404)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
})
