require("dotenv").config()
const express = require("express")
const app =  express()
const cookieParser = require("cookie-parser")
const cors = require("cors")


app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /\.vercel\.app$/
]

const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, ""))
    : []

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser (no origin) requests
        if (!origin) {
            return callback(null, true)
        }

        // allow explicit frontend URL(s) from env
        if (frontendUrls.includes(origin)) {
            return callback(null, true)
        }

        // allow localhost and any Vercel deployment (preview or production)
        if (allowedOrigins.some((allowedOrigin) => allowedOrigin.test(origin))) {
            return callback(null, true)
        }

        // Return false instead of Error to avoid triggering Express 500
        return callback(null, false)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

const connectToDB = require("./config/database")

// Ensure DB connection for serverless invocations
app.use(async (req, res, next) => {
    try {
        await connectToDB()
        next()
    } catch (err) {
        console.error("Database connection middleware error:", err)
        res.status(500).json({ message: "Database connection failed", error: err.message })
    }
})

// require all the routes here
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
app.use("/api/auth",authRouter) // using all the routes here , url for router
app.use("/api/interview",interviewRouter)

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err)
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

module.exports = app
