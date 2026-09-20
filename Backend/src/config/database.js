const mongoose = require("mongoose")

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDB() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
            console.log("Connected to Database")
            return mongooseInstance
        }).catch((err) => {
            cached.promise = null
            console.error("Database connection error:", err)
            throw err
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

module.exports = connectToDB