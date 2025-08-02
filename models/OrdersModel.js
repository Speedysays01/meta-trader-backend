import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Make sure this matches your user model's name
    required: true,
  },
});

// Ensure combination of name + mode is unique


const OrdersModel = model("Order", OrdersSchema);

export default OrdersModel;
