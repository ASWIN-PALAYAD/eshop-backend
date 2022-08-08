const {Product} = require('../models/product')
const express = require('express');
const router = express.Router();
const {Category} = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')

//image extension validation
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}

//image name specification
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if(isValid){
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })


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

router.post(`/`, uploadOptions.single('image'), async (req,res)=>{
    const category = await Category.findById(req.body.category)
    if(!category)
    return res.status(400).send('Invalid Category')

    const file = req.file;
    if(!file) return res.status(400).send('No imaage in the request')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    const product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDiscription:req.body.richDiscription,
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    })
    //product = await product.save(); check const and replace it with let then code wil run
    product.save()
    
    if(!product)
    return res.status(500).send("The product cannot be created")

    res.send(product);

})

//API for editing the product 

router.put('/:id',uploadOptions.single('image'),async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid product');

    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`
    }else{
        imagepath = product.image
    }
    console.log(imagepath);

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            richDiscription:req.body.richDiscription,
            image:imagepath,
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
    if(!updatedProduct)
    return res.status(500).send('the product cannot be update')

    res.send(updatedProduct)

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

//API for uploading product images
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images',10),
    async (req,res)=>{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).send('Invalid product Id')
        }

        const files = req.files
        let imagePath = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

        if(files){
            files.map(file =>{
                imagePath.push(`${basePath}${file.filename}`);
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images : imagePath
            },
            {new:true} 
            
        )

        if(!product)
        return res.status(500).send('the product cannot be uploaded')

        res.send(product)

    })

module.exports = router;