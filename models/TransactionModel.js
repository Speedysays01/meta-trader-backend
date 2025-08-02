// models/TransactionsModel.js
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // stock name
  mode: { type: String, enum: ["BUY", "SELL"], required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true }, // price at which order was placed
  pl: { type: Number, default: 0 },        // only for SELL mode
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Transaction", TransactionSchema);
