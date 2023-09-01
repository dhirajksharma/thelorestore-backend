const User=require('../models/userModel');
const Order=require("../models/orderModel");
const Product=require("../models/productModel");
const Errorhander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");

//create order
exports.newOrder=catchAsyncError(async(req,res,next)=>{
    
    let order= await Order.create(req.body);
    order.user=req.user.id;
    order.paidAt=Date.now();
    await order.save();
    for(const ord of order.orderItems){
        let product=await Product.findById(ord.productID);
        let sellerArr=[];
        product.sellers.forEach(slr =>{
            let obj=slr;
            if(slr.sellerID.toString()===ord.sellerID.toString()){
                obj.quantity-=ord.quantity;
            }
            sellerArr.push(obj);
        })
        product.sellers=sellerArr;
        await product.save();
    }
    let user=await User.findById(req.user.id);
    user.cart=[];
    await user.save();
    res.status(201).json({
        success:true,
    })
});

//get single order
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");
    
    if(!order){
        return next(new Errorhander("Order not found",404));
    }

    if(order.user._id.toString()!==req.user._id.toString() && req.user.role!=='seller'){
        return next(new Errorhander("You are not authorized to access this page",404));
    }

    res.status(200).json({
        success:true,
        order,
    })
})

//get user's order
exports.myOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user.id}).populate("orderItems.sellerID","name email");

    res.status(200).json({
        success:true,
        orders,
    })
})

//update order status
exports.updateOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order){
        return next(new Errorhander("Order not found",404));
    }

    if(order.orderStatus==="Delivered"){
        return next(new Errorhander("Order delivered already",400));
    }

    order.orderStatus="Delivered";
    order.deliveredDate=Date.now;
    await order.save();
    res.status(200).json({
        success:true,
        order,
    })
})

//delete order
exports.deleteOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order){
        return next(new Errorhander("Order not found",404));
    }

    if(order.orderStatus==="Delivered"){
        return next(new Errorhander("Order cannot be deleted",404));
    }

    for(const ord of order.orderItems){
        let product=await Product.findById(ord.productID);
        let sellerArr=[];
        product.sellers.forEach(slr =>{
            let obj=slr;
            if(slr.sellerID.toString()===ord.sellerID.toString()){
                obj.quantity+=ord.quantity;
            }
            sellerArr.push(obj);
        })
        product.sellers=sellerArr;
        await product.save();
    }

    await order.remove();
    res.status(200).json({
        success:true
    })
})

//get all orders of seller
exports.sellerOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({"orderItems.sellerID":req.user.id});
    let sellerorders=[]
    orders.forEach(ord=>{
        let order={}
        order.shippingInfo=ord.shippingInfo;
        order._id=ord.id;
        order.orderItems=ord.orderItems.filter(item=>
            item.sellerID.toString()===req.user.id.toString())
        
        sellerorders.push(order);
    })
    res.status(200).json({
        success:true,
        sellerorders,
    })
})