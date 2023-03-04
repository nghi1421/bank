const express = require('express')
const compression = require("compression");
const mongoose = require('mongoose')
const helmet = require("helmet");
const bodyParser = require('body-parser');

const app = express()

app.use(helmet());

app.use(bodyParser.json())
// app.use(express.json())
// mongodb+srv://test_db:<password>@cluster0.ci7dems.mongodb.net/?retryWrites=true&w=majority

mongoose.connect('mongodb+srv://cluster0.ci7dems.mongodb.net/',
 {
    dbName: 'RestAPI',
    user: 'test_db',
    pass: "thanhnghi123123",
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() =>{
        console.log('Mongodb connected')
    })


app.all('/api/test', (req, res) =>{
    console.log(req.body)
    res.send(req.body)
})



const bankAccount = require('./routes/bank_account.route')
app.use('/api/bank-accounts', bankAccount)

app.use((req, res, next) => {
    const err = new Error("Not found")
    err.status = 404
    next(err)
    // res.status(404);
    // res.send({
    //     error: "Not found"
    // })
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server run on PORT: ${PORT}`))