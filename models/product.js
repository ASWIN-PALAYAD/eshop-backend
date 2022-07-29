const mongoose = require('mongoose');


//db schema define
const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    richDiscription:{
        type:String,
        default:''
    },
    image:{
        type:String,
        default:''
    },
    images:[{
        type:String
    }],
    brand:{
        type:String
    },
    price:{
        type:Number,
        default:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    countInStock:{
        type:Number,
        required:true,
        min:0,
        max:255 
    },
    rating:{
        type:Number,
        default:true
    },
    numReviews:{
        type:Number,
        default:false
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }

})

//creating model
exports.Product = mongoose.model('PRODUCT',productSchema)
