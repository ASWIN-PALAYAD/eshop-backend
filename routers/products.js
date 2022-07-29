const {Product} = require('../models/product')
const express = require('express');
const router = express.Router();
const {Category} = require('../models/category')

router.get(`/`, async(req,res)=>{
    const productList = await Product.find();

    if(!productList){
        res.status (500).json({success:false})
    } 
    
    res.send(productList)
})

router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id)

    if(!product){
        return res.status(500).send("The product not find")
        // res.status(500).json({success:false}) editted check while any problem
    }  

    res.send(product)

})



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

module.exports = router;