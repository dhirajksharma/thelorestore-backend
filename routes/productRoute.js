const express=require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, deleteProductReview } = require("../controller/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router=express.Router();

router.route("/books")
    .get(getAllProducts);

router.route("/books/new")
    .post(isAuthenticatedUser, authorizeRoles("seller"), createProduct);

router.route("/books/:id")
    .delete(isAuthenticatedUser, authorizeRoles("seller"), deleteProduct)
    .get(getProductDetails)
    .post(isAuthenticatedUser, createProductReview)
    router.route("/deletereview/:id/:revid")
    .delete(isAuthenticatedUser, deleteProductReview)


router.route("/books/update")
    .put(isAuthenticatedUser, authorizeRoles("seller"), updateProduct)
module.exports=router;