const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose');
const { json } = require('express');
require('dotenv/config')
const api = process.env.API_URL;

//middleware
app.use(express.json())
app.use(morgan('tiny'))

//db schema define
const productSchema = mongoose.Schema({
    name:String,
    image:String,
    countInStock:{
        type:Number,
        required:true
    }
})

//creating model
const Product = mongoose.model('PRODUCT',productSchema)


app.get(`${api}/product`, async(req,res)=>{
    const productList = await Product.find();

    if(!productList){
        res.send(500).json({success:false})
    }
    
    res.send(productList)
})

app.post(`${api}/product`, (req,res)=>{
    const product = new Product({
        name:req.body.name,
        image:req.body.image,
        countInStock:req.body.countInStock
    })
    product.save()
    .then((createdProduct=>{
        res.status(201).json(createdProduct)
    }))
    .catch((err)=>{
        res.status(500),json({
            err:err,
            success:false
        })
    })

})


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

app.listen(3000,()=>{
    console.log("server started at port 3000");
})