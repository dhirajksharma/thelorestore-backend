const mongoose=require("mongoose");
const productSchema=new mongoose.Schema({
    title:{
        type:String,
        required: [true,"Please enter Book title"],
        trim: true
    },
    image:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    description:{
        type:String,
        required: [true,"Please enter Book description"]
    },
    author:{
        type:String,
        required: [true,"Please enter Author name"]
    },
    genre:{
        type:String,
        required: [true,"Please enter Book genre"]
    },
    maxprice:{
        type:Number,
        required: [true,"Please enter Book price"],
        max:[999999,"Price cannot exceed 6 figures"],
        min:[0,"Price cannot be negetive"]
    },
    publisher:{
        type:String,
        required: [true,"Please enter Publisher name"]
    },
    year:{
        type:Number,
        required: [true,"Please enter publishing year"]
    },
    ratings:{
        type:Number,
        default:0
    },
    isbn:{
        type:Number,
        unique:true,
        required:[true,"Please enter ISBN number"],
        unique:true
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            userId:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                
            }
        }
    ],
    sellers:[
        {
            sellerID:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
            },
            sellerName:{
                type:String,
            },
            sellingPrice:{
                type:Number,
            },
            quantity:{
                type:Number,
            }
        }
    ]
})

module.exports=mongoose.model("Product",productSchema);