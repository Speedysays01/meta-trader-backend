import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PositionsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
});

const PositionsModel = model("Position", PositionsSchema);

export default PositionsModel;
