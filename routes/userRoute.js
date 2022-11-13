const express=require("express");
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, addToCart, getSellerProducts } = require("../controller/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router=express.Router();

router.route("/register")
    .post(registerUser);
router.route("/login")
    .post(loginUser);
router.route("/password/forgot")
    .post(forgotPassword);
router.route("/password/reset/:token")
    .put(resetPassword);
router.route("/logout")
    .get(isAuthenticatedUser ,logout);

router.route("/me")
    .get(isAuthenticatedUser, getUserDetails);
router.route("/password/update")
    .put(isAuthenticatedUser, updatePassword);
router.route("/me/update")
    .put(isAuthenticatedUser, updateProfile);

router.route('/me/cart')
    .put(isAuthenticatedUser,addToCart);

router.route('/me/books')
    .get(isAuthenticatedUser, authorizeRoles('seller'), getSellerProducts);

module.exports=router;