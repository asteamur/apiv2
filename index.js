var express = require('express')
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { createApi } = require('./restify')
const { A } = require('./model')
const { Schema } = require('querymen')

const uri = 'mongodb://localhost:27017/test'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const router = express.Router();

const querySchema = new Schema({
    a: {
      type: String,
    }
})

function auth(req, res, next){
    next()
}

createApi({
    router,
    auth,
    path: '/api/a',
    Model: A,
    populateArg = ['b'],
    querySchema,
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

