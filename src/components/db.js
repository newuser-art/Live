const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://sasi:sasi%4012@projecta2z.rymrf.mongodb.net/';
const DATABASE_NAME = 'ProjectA2Z';

let database;

async function connectDatabase() {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  database = client.db(DATABASE_NAME);
  console.log('Connected to MongoDB');
}

function getDatabase() {
  if (!database) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return database;
}

module.exports = { connectDatabase, getDatabase };
