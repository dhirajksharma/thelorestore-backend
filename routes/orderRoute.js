const express=require("express");
const { newOrder, getSingleOrder, myOrders, deleteOrder, updateOrder, sellerOrders } = require("../controller/orderController");
const router=express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/order/new")
    .post(isAuthenticatedUser, newOrder);

router.route("/me/orders")
    .get(isAuthenticatedUser, myOrders);

router.route("/order/my")
    .get(isAuthenticatedUser,authorizeRoles("seller"), sellerOrders);

router.route("/order/:id")
    .get(isAuthenticatedUser, getSingleOrder)
    .patch(isAuthenticatedUser, authorizeRoles("seller"), updateOrder)
    .delete(isAuthenticatedUser, deleteOrder);
module.exports=router;