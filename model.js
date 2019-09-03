const mongoose = require('mongoose')

const BSchema = new mongoose.Schema({
    b1: String,
    b2: Number,
    createdBy: String,
    createdAt: Date,
    updatedBy: String,
    updatedAt: Date
})

const B = mongoose.model('B', BSchema)

const ASchema = new mongoose.Schema({
    a: {type: String, required: true},
    b: { type: mongoose.ObjectId, ref: B },
    c: {type: Number},
    author: String,
    createdBy: String,
    createdAt: Date,
    updatedBy: String,
    updatedAt: Date
})
const A = mongoose.model('A', ASchema)

module.exports = {A, B}