const { MongoClient } = require("mongodb")
require("dotenv").config()

const mongo = new MongoClient(`${process.env.mongoDB}`)
mongo.connect().then(() => {
    console.log('[MONGO] >>> Connected to Database')
})

const db = mongo.db("Brigify-TESTING")
// const db = mongo.db("bridgify")

module.exports = { db }
