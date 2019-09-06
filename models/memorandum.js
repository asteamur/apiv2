const mongoose = require('mongoose')

const MemorandumSchema = new mongoose.Schema({
    text: {type: String, required: true},
    //tea_id: { type: mongoose.ObjectId, ref: TEA },
    date: Date,
    author: String,
    sede: String,
    createdBy: String,
    createdAt: Date,
    updatedBy: String,
    updatedAt: Date
})
const Memorandum = mongoose.model('Memorandum', MemorandumSchema)

module.exports = { Memorandum }