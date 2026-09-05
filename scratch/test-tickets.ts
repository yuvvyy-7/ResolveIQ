import mongoose from 'mongoose';
import { connectDB } from '../src/lib/db/connection';
import { Ticket } from '../src/lib/db/models';
async function run() {
  await connectDB();
  console.log('Database Name:', mongoose.connection.db?.databaseName);
  console.log('Ticket Collection Name:', Ticket.collection.name);
  const count = await Ticket.countDocuments();
  console.log('Count:', count);
  process.exit(0);
}
run();
