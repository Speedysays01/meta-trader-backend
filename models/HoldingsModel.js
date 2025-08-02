import mongoose from "mongoose";

const { Schema, model } = mongoose;

const HoldingsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,

    user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Make sure this matches your user model's name
    required: true,
  },
});

const HoldingsModel = model("Holding", HoldingsSchema);

export default HoldingsModel;
