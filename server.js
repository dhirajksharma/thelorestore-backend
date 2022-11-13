const app=require("./app");
const dotenv=require("dotenv");
dotenv.config();
const connectDatabase=require("./config/database");

//Handling uncaught exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server");
    process.exit(1);

})

//connecting to database [NOTE: connecting after config file to make sure it gets those variables]
connectDatabase()

const PORT=process.env.PORT||4000

const server=app.listen(PORT,()=>{
    console.log(`Server is working on https://localhost:${PORT}`);
})

const stripe=require('stripe')(process.env.STRIPE_SK)

app.post("/create-checkout-session",async (req,res)=>{
    try{
        
        const session=await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            mode:'payment',
            line_items:req.body.cart.map(obj=>{
                return{
                    price_data:{
                        currency:'inr',
                        product_data:{
                            name:obj.name,
                        },
                        unit_amount:obj.price*100
                    },
                    quantity:obj.quantity
                }
            }),
            success_url:process.env.STRIPE_SUCCESS_URL,
            cancel_url:process.env.STRIPE_FAIL_URL
        })
        res.json({url:session.url})
    }catch(e){
        res.status(500).json({error:e.message})
    }
})


// Unhandled promise rejection

process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server");
    
    server.close(()=>{
        process.exit(1);
    });
})