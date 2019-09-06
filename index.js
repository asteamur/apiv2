var express = require('express')
var bodyParser = require('body-parser')
const jwt = require('express-jwt')
const mongoose = require('mongoose')
const { createApi } = require('./restify')
const { A } = require('./model')
//const { Schema } = require('querymen')
const { Memorandum } = require('./models/memorandum')

const uri = 'mongodb://localhost:27017/test'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api/protected', jwt({secret: 'secret' /*process.env.SECRET*/, requestProperty: 'token'}))

const router = express.Router();

/*const querySchema = new Schema({
    a: {
      type: RegExp//String,
    }
})
*/

const querySchema = {
    a: {
        type: RegExp//String,
      }
}

function auth(req, res, next){
    req.restify.authResult = {}
    if(!req.token){
        return next()
    }
    if(req.token.role === 'coordinadora'){
        req.restify.authResult = {sede: req.token.sede}
    }
    next()
}

createApi({
    router,
    auth,
    path: '/api/a',
    Model: A,
    preWrite: (req) => {
        req.body.c = 54321
        req.body.author = req.restify.userId
    },
    querySchema,
    injection: function(method){
        return {path: 'user:memorandum:' + method}
    }
})


const queryMemorandumSchema = {
    dateInit: {
        type: Date,
        paths: ['date'],
        operator: '$gte'
    },
    dateEnd: {
        type: Date,
        paths: ['date'],
        operator: '$lte'
    }
}

createApi({
    router,
    auth,
    path: '/api/protected/memorandum',
    Model: Memorandum,
    preWrite: (req) => {
        req.body.author = req.restify.userId
    },
    querySchema: queryMemorandumSchema,
    injection: function(method){
        return {path: 'user:memorandum:' + method}
    }
})

app.use(router);

app.use(function(err, req, res, next){
    console.log(err)
    res.json({error: err})
})
// ##

mongoose.set('debug', true) 
mongoose.connect(uri, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('we are connected!')

  app.listen(3000, function() {
      console.log("Express server listening on port 3000");
  })
  
})

