const Errorhander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");
const { send } = require("process");
const dotenv=require("dotenv");
const Product=require("../models/productModel");

dotenv.config();

//Register a user
exports.registerUser=catchAsyncError(async(req,res,next)=>{
    const {name, email, password, role}=req.body;
    const checkuser=await User.findOne({email:email})
    if(checkuser){
        return next(new Errorhander("Given Email ID already belongs to a user",404));
    }
    const user=await User.create({name, email, password, role});
    sendToken(user,201,res);
});

//Login a user
exports.loginUser=catchAsyncError(async(req,res,next)=>{

    const {email,password}=req.body;
    //checking if user has given password and email both
    if(!email || !password){
        return next(new Errorhander("Please Enter Email and password",400))
    }

    const user= await User.findOne({email}).select("+password");
    if(!user){
        return next(new Errorhander("Invalid email or password",401));
    }

    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new Errorhander("Invalid email or password",401));
    }
    
    sendToken(user,201,res);
})

//Logout a user
exports.logout=catchAsyncError(async(req,res,next)=>{

    
    res.cookie("token",null,{
        maxAge:1,
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message:"Logout successful",
    })
});

//Forgot password
exports.forgotPassword=catchAsyncError(async(req,res,next)=>{

    const user= await User.findOne({email:req.body.email});
    if(!user){
        return next(new Errorhander("No user found with given Email ID",404));
    }

    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    //const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    const resetPasswordUrl=`${process.env.FRONTEND}/password/reset/${resetToken}`
    const message=`Your password reset link is\n\n${resetPasswordUrl}\nIf you have not requested a password reset, kindly ignore this message.`;

    try{

        await sendEmail({
            email:user.email,
            subject: `Account Password Recovery`,
            message:message
        });

        res.status(200).json({
            success:true,
            message:`Password Reset Link sent to ${user.email}`,
        })

    }catch(error){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});
        return next(new Errorhander(error.message, 500));
    }
})

//Reset Password
exports.resetPassword=catchAsyncError(async(req,res,next)=>{
    
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user=await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}})
    if(!user){
        return next(new Errorhander("Reset password token is invalid or has expired", 400));
    }

    if(req.body.password!==req.body.confirmpassword){
        return next(new Errorhander("Both passwords do not match", 400));
    }

    user.password=req.body.password;
    user.resetPasswordExpire=undefined;
    user.resetPasswordToken=undefined;

    await user.save();

    sendToken(user,200,res);
})

//Get user Details
exports.getUserDetails=catchAsyncError(async(req,res,next)=>{
    
    let user=await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    })
})

//Update Password
exports.updatePassword=catchAsyncError(async(req,res,next)=>{
    
    let user=await User.findById(req.user.id).select("+password");

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);
    
    if(!isPasswordMatched){
        return next(new Errorhander("Old password is incorrect",400));
    }

    if(req.body.newPassword!== req.body.confirmPassword){
        return next(new Errorhander("New Passwords do not match",400));
    }

    user.password=req.body.newPassword;
    await user.save();

    sendToken(user,200,res);
})

exports.updateProfile=catchAsyncError(async(req,res,next)=>{
    
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
        phone:req.body.phone,
        address:req.body.address
    }

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false,
    });

    res.status(200).json({
        success:true,
        user
    })
})


exports.addToCart=catchAsyncError(async(req,res,next)=>{
    let user=await User.findById(req.user.id);
    const item={
        productID:req.body.productID,
        name:req.body.name,
        image:req.body.image,
        price:req.body.price,
        sellerID:req.body.sellerID,
        sellerName:req.body.sellerName,
        quantity:req.body.quantity,
    }
    user.cart.push(item);
    await user.save();

    res.status(200).json({
        success:true,
    })
})

exports.getSellerProducts=catchAsyncError(async(req,res,next)=>{
    let seller=await User.findById(req.user.id);
    let products=[]
    function sellerfinder(product){
        let objsend={};
        product.sellers.forEach( obj => {
            if(obj.sellerID.toString()===req.user.id.toString()){
                objsend=obj;
            }
        });
        return objsend;
    }
    for (let index = 0; index < seller.products.length; index++) {
        let prd=await Product.findOne({isbn:seller.products[index]});
        let currentSeller=sellerfinder(prd);
        prd.sellers=[]
        prd.sellers.push(currentSeller);
        products.push(prd);
    }

    res.status(200).json({
        success:true,
        products
    })
})