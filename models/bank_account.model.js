const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bankAccountSchema =  new Schema({
    bank_account_number: {
        type: String,
        unique: true,
        minLength: 12,
        maxLength: 20,

    },
    name: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        minLength: 10,
        maxLength: 15,
        unique: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    balance: {
        type: mongoose.Types.Decimal128,
        required: true,
        min: 0,
    },
    type: {
        type: String,
    }
})

const bankAccount  = mongoose.model('bank_account', bankAccountSchema)

module.exports = bankAccount