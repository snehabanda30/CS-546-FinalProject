import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  suite: { type: String, default: null },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

const Address = mongoose.model("Address", addressSchema);

export { addressSchema, Address };
