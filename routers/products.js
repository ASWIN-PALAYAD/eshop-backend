const {Product} = require('../models/product')
const express = require('express');
const router = express.Router();
const {Category} = require('../models/category')
const mongoose = require('mongoose')


//API for get all product list with details or category wise

router.get(`/`, async(req,res)=>{
    //if request comes in the model of localhost:3000/api/v1/product?categories=447,497
    let filter = {};
    if(req.query.categories)
    {
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category')

    if(!productList){
        res.status (500).json({success:false})
    } 
    
    res.send(productList)
})

//API specially for getting name and image without id 

router.get('/getProductName',async (req,res)=>{
    const productName = await Product.find().select('name image -_id')

    if(!productName){
        res.status(500).json({success:false})
    }

    res.send(productName)
})

//API for get individual product detail with id

router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category')

    if(!product){
        return res.status(500).send("The product not find")
        // res.status(500).json({success:false}) editted check while any problem
    }  

    res.send(product)

})

//API for adding new product

router.post(`/`, async (req,res)=>{
    const category = await Category.findById(req.body.category)
    if(!category)
    return res.status(400).send('Invalid Category')

    const product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDiscription:req.body.richDiscription,
        image:req.body.image,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    })
    //product = await product.save();
    product.save()
    
    if(!product)
    return res.status(500).send("The product cannot be created")

    res.send(product);

})

//API for editing the product 

router.put('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            richDiscription:req.body.richDiscription,
            image:req.body.image,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured

        },
        {new:true} 
    )
    if(!product)
    return res.status(500).send('the product cannot be update')

    res.send(product)

})

//API for deleting a product 

router.delete('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id')
    }
     const product = await Product.findByIdAndDelete(req.params.id)
     if(!product)
     return res.status(400).json({success:false,message:"the product is not deleted"})

     res.status(200).json({success:true,message:"the product is deleted"})
})

//API for total product count 

router.get('/get/count',async (req,res)=>{
    const productCount = await Product.countDocuments()

    if(!productCount){
        res.status(500).json({success:false})
    }

    res.send({
        productCount : productCount
    })
})

//API for featured products

router.get('/get/featured/:count',async (req,res)=>{
    const count = req.params.count ? req.params.count : 0
    const product = await Product.find({isFeatured:true}).limit(+count)

    if(!product){
        res.status(500).json({success:false})
    }

    res.send(product)
})

module.exports = router;