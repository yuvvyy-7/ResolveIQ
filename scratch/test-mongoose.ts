import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI!;
  console.log('URI:', uri);
  await mongoose.connect(uri, { dbName: 'resolveiq' });
  console.log('DB Name after explicit dbName:', mongoose.connection.db?.databaseName);
  
  const Ticket = mongoose.model('Ticket', new mongoose.Schema({ ticketId: String }));
  console.log('Count with explicit dbName:', await Ticket.countDocuments());
  
  process.exit(0);
}
run();
