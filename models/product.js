const mongoose = require('mongoose');


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
exports.Product = mongoose.model('PRODUCT',productSchema)
