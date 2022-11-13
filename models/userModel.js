const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");
const crypto=require("crypto");
dotenv.config({path:"./config/config.env"});

const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:[true, "Please enter user name"],
        minLength:[3, "Please enter full name"]
    },
    email:{
        type:String,
        required:[true,"Please enter email"],
        unique:true,
        validate:[validator.isEmail, "Please enter valid email"]
    },
    phone:{
        type:Number,
    },
    address:{
        localaddress:
        {
            type:String,
            required:false,
        },
        pincode:{
            type:Number,
            required:false,
        },
        city:{
            type:String,
            required:false,
        },
        state:{
            type:String,
            required:false,
        }
    },
    password:{
        type:String,
        required:[true, "Please enter password"],
        minLength:[6,"Password cannot have less than 6 characters"],
        select:false,
    },
    role:{
        type:String,
        default:"user",
    },
    products:[
        {
            type:Number
        }
    ],
    order:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Userorders",
        }
    ],
    cart:[
        {
            productID:{
                type:mongoose.Schema.ObjectId,
            },
            name:{
                type:String,
            },
            image:{
                type:String,
            },
            price:{
                type:Number,
            },
            sellerID:{
                type:mongoose.Schema.ObjectId,
            },
            sellerName:{
                type:String,
            },
            quantity:{
                type:Number,
            }

        },
    ],

    resetPasswordToken:String,
    resetPasswordExpire:Date,
});


userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

//JWT Token
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//Compare passwords
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//Generating password reset token
userSchema.methods.getResetPasswordToken=function(){
    const resetToken=crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=Date.now()+15*60*1000;

    return resetToken;
}

module.exports=mongoose.model("User",userSchema);