const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose');
const { json } = require('express');
const Product = require('./models/product')
require('dotenv/config')
const api = process.env.API_URL;
const productRouter = require('./routers/products')



//middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(`${api}/product`,productRouter )



//mongo atlas connection
mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true
})
.then(()=>{
    console.log('Database connection is ready...');
})
.catch((err)=>{
    console.log(err);
})


//port number
app.listen(3000,()=>{
    console.log("server started at port 3000");
})