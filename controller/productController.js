const User = require("../models/userModel");
const Product=require("../models/productModel");
const Errorhander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");


//Create product --seller
exports.createProduct=catchAsyncError(async(req,res,next)=>{
    
    const isbn=req.body.isbn;
    const currentSeller={...req.body.currentSeller,"sellerID":req.user.id,"sellerName":req.user.name}
    
    let product=await Product.findOne({"isbn": isbn});
    let seller=await User.findById(req.user.id);
    if(!product){
        //create book
        product=await Product.create(req.body);
        product.sellers.push(currentSeller);
        seller.products.push(req.body.isbn);
        await product.save();
        await seller.save();
    }else{
        //book exists now checking seller
        function sellerfinder(product){
            let ans=false;
            product.sellers.forEach( obj => {
                if(obj.sellerID.toString()===req.user.id.toString()){
                    ans=true;
                }
            });
            return ans;
        }
        if(!sellerfinder(product)===true){
            //seller does not exist
            product.sellers.push(currentSeller);
            seller.products.push(req.body.isbn);
            await product.save();
            await seller.save();
        }
        else{
            //seller exists
            return next(new Errorhander("Book already exists in your catalogue",403));
        }
    }
    res.status(201).json({
        success:true
    })
})


// Update Product-- seller
exports.updateProduct=catchAsyncError(async(req,res,next)=>{
    console.log(req.body);
    let product=await Product.findOne({isbn:Number(req.body.isbn)});

    if(!product){
        return next(new Errorhander("Book with given ISBN not found!",404))
    }
    
    function sellerfinder(product){
        let objsend={};
        product.sellers.forEach( obj => {
            if(obj.sellerID.toString()===req.user.id.toString()){
                objsend=obj;
            }
        });
        return objsend;
    }
    let currentSeller=sellerfinder(product);
    //checking and updating seller info
    if(req.body.currentSeller){
        if(req.body.currentSeller.quantity)
            currentSeller.quantity=req.body.currentSeller.quantity;
        if(req.body.currentSeller.sellingPrice)
            currentSeller.sellingPrice=req.body.currentSeller.sellingPrice;
    }
        
    await product.save();
    product= await Product.findOneAndUpdate({isbn:req.body.isbn},req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Product
exports.deleteProduct=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhander("Product not found!",404))
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted succefully"
    })
})

// Get Product Details
exports.getProductDetails=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhander("Product not found!",404))
    }

    res.status(200).json({
        success:true,
        product
    })
})

// Get All products
exports.getAllProducts=catchAsyncError(async(req,res)=>{
    
    const resultPerPage=8;
    const productCount= await Product.countDocuments();
    let apiFeature= new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    
    let products= await apiFeature.query;
    let filteredProductCount=products.length;
    
    apiFeature.pagination(resultPerPage);
    products= await apiFeature.query.clone();

    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        filteredProductCount
    })
})

//Create or Update Reviews
exports.createProductReview=catchAsyncError(async(req,res,next)=>{
    const {rating, comment}=req.body;
    const review={
        userId:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }

    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhander("Product not found",404));
    }

    const isReviewed=product.reviews.find(rev=> rev.userId.toString()===req.user.id.toString());
    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.userId.toString()===req.user.id.toString()){
            rev.rating=rating
            rev.comment=comment}
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews+=1;
    }

    let avg=0;
    product.reviews.forEach(rev=>{
        avg+=rev.rating;
    })
    product.ratings=avg/product.numOfReviews;

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Review
exports.deleteProductReview=catchAsyncError(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    let review=[];
    let flag=0;
    
    product.reviews.forEach(rev=>{
        
        if(rev._id.toString()!==req.params.revid.toString()){
            review.push(rev);
        }
        else{
            flag=1;
        }
    })
    product.reviews=review;
    if(flag===1){
        product.numOfReviews-=1;
        if(product.numOfReviews===0){
            product.ratings=0;
        }else{
            let avg=0;
            product.reviews.forEach(rev=>{
                avg+=rev.rating;
            })
            product.ratings=avg/product.numOfReviews;
        }
    }
    await product.save();
    res.status(200).json({
        success:true,
        product
    })
})