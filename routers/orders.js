const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();
const {OrderItem} = require('../models/order-item');
const { default: mongoose } = require('mongoose');

//API for geting all product details
router.get('/', async (req,res)=>{
    const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});

    if(!orderList){
        res.status(500).json({success:false})
    }

    res.send(orderList);
})

//API for single order details 
router.get('/:id',async (req,res)=>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({
        path:'orderItems', populate:{
            path:'product',populate:'category'}
        }); 

    if(!order)
    return res.status(500).json({success:false, message:'the order not found'})

    res.send(order)
})

//API for  creating an order
router.post('/',async (req,res)=>{
    //creating orderitems for using it in admin section also 
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem = new OrderItem({
            quantity:orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b)=> a+b,0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status:req.body.status,
        totalPrice: totalPrice,
        user:req.body.user
    })
    order = await order.save();

    if(!order)
    return res.status(400).send('the order not created')

    res.send(order);
})

//API for changing the status of order 
router.put('/:id',async (req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status : req.body.status
        },
        {new:true}
    )

    if(!order)
    return res.status(400).json("The order cannot be created")

    res.send(order)
})

//API for deleting an order
router.delete('/:id',async (req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order){
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true, message:'the order is deleted'})
        }else{
            return res.status(400).json({success:false, message:"The order is not deleted"})
        }
    }).catch(err =>{
        return res.status(500).json({success:false, errore:err})
    })
})

//API for geting total sale amount
router.get('/get/totalsales',async (req,res)=>{
    const totalsales = await Order.aggregate([
        {
            $group: {_id:null,totalsales : {$sum:'$totalPrice'}}
        }
    ])

    res.send({totalsales:totalsales.pop().totalsales})
})

//API  for geting total sale items
router.get('/get/count',async (req,res)=>{
    const orderCount = await Order.countDocuments()
     
    if(!orderCount){
        res.status(500).json({success:false})
    }

    res.send({
        orderCount:orderCount
    })
})

//API for user order history 
router.get('/get/userorders/:userid',async (req,res)=>{
    const userOrderList = await Order.find({user:req.params.userid}).populate({
        path:'orderItems',populate:{
            path: 'product',populate:'category'
        }
    }).sort({'dateOrdered': -1})

    if(!userOrderList){
        res.status(500).json({success:false})
    }

    res.send(userOrderList)

})




module.exports = router;