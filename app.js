const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose');
const cors = require('cors');

// const { json } = require('express');
// const Product = require('./models/product')

require('dotenv/config')

//cors 
app.use(cors());
app.options('*',cors())

//middleware
app.use(express.json())
app.use(morgan('tiny'))


//Routes
const productRouter = require('./routers/products')
const userRouter = require('./routers/users')
const orderRouter = require('./routers/orders')
const categoryRouter = require('./routers/categories')


const api = process.env.API_URL;


app.use(`${api}/products`,productRouter)
app.use(`${api}/users`,userRouter)
app.use(`${api}/orders`,orderRouter)
app.use(`${api}/categories`,categoryRouter)





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