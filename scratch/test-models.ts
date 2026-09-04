import { connectDB } from "../src/lib/db/connection";
import { Customer, Order, Payment, Ticket, Policy } from "../src/lib/db/models";
import mongoose from "mongoose";

async function testModels() {
  console.log("Connecting...");
  await connectDB();
  console.log("Registered models:", Object.keys(mongoose.models));
  console.log("Customer model name:", Customer.modelName);
  console.log("Registered models after access:", Object.keys(mongoose.models));
  
  const customerModelsCount = Object.keys(mongoose.models).filter(m => m === "Customer").length;
  console.log("Customer model registered times:", customerModelsCount);

  await mongoose.disconnect();
  console.log("Done.");
}

testModels();
