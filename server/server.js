const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const validator = require('validator');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://sasi:sasi12@projecta2z.rymrf.mongodb.net/?retryWrites=true&w=majority&appName=ProjectA2Z';
const DATABASE_NAME = 'ProjectA2Z';

let database = null;

// MongoDB Connection Function
async function connectDatabase() {
  try {
    const client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true, // Enables TLS/SSL automatically
      serverSelectionTimeoutMS: 10000, 
      connectTimeoutMS: 20000, 
      retryWrites: true,
    });

    await client.connect();
    database = client.db(DATABASE_NAME);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1); // Exit if DB connection fails
  }
}

// Ensure database is connected before processing any request
app.use((req, res, next) => {
  if (!database) {
    return res.status(500).json({ error: 'Database not initialized' });
  }
  next();
});

// Fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await database.collection('UserData').find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
async function getData() {
  if (!database) {
    await connectDatabase();
  }
  const collection = database.collection('Data');
  const data = await collection.find().toArray();
  return data;
}
// User Login
app.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Missing credentials.' });
    }

    const isEmail = validator.isEmail(emailOrUsername);
    const query = isEmail ? { email: emailOrUsername } : { username: emailOrUsername };
    const user = await database.collection('UserData').findOne(query);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    res.json({ message: 'Login successful', username: user.username, userid: user.userid });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// User Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await database.collection('UserData').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const nanoId = nanoid(10);
    const newUser = { userid: nanoId, name, email, username, password };
    await database.collection('UserData').insertOne(newUser);
    await database.collection('UserWatchlist').insertOne({ userid: nanoId, watchlist: [] });

    res.status(201).json({ message: 'User created successfully', userId: nanoId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function insertUserToDatabase(user) {
  if (!database) {
    await connectDatabase();
  }
  const collection = database.collection('UserData');
  return await collection.insertOne(user); // Return the result of the insertion
}

async function insertIntoUserWatchlist(entry) {
  const db = await getDatabase();  // Your database connection
  return db.collection("UserWatchlist").insertOne(entry);
}

app.post("/api/watchlist", async (req, res) => {
  try {
    const { userid, itemId } = req.body;

    if (!userid || !itemId) {
      return res.status(400).json({ error: "Missing userid or itemId" });
    }

    const watchlistCollection = database.collection("UserWatchlist");

    // Find user's watchlist
    const userWatchlist = await watchlistCollection.findOne({ userid });

    if (!userWatchlist) {
      // Create new watchlist if not exists
      await watchlistCollection.insertOne({ userid, watchlist: [itemId] });
      return res.status(201).json({ message: "Item added to watchlist" });
    }

    // Check if item is already in watchlist
    const isInWatchlist = userWatchlist.watchlist.includes(itemId);

    if (isInWatchlist) {
      // Remove item
      await watchlistCollection.updateOne(
        { userid },
        { $pull: { watchlist: itemId } }
      );
      return res.status(200).json({ message: "Item removed from watchlist" });
    } else {
      // Add item
      await watchlistCollection.updateOne(
        { userid },
        { $push: { watchlist: itemId } }
      );
      return res.status(200).json({ message: "Item added to watchlist" });
    }
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const { userid } = req.query;

    if (!userid) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const watchlistCollection = database.collection('UserWatchlist');
    const dataCollection = database.collection('Data'); // Your main items collection

    // Find user's watchlist
    const userWatchlist = await watchlistCollection.findOne({ userid });

    if (!userWatchlist || !userWatchlist.watchlist.length) {
      return res.status(200).json({ watchlist: [] }); // Return empty if no items
    }

    // Convert valid ObjectId values
    const itemIds = userWatchlist.watchlist
      .filter(id => ObjectId.isValid(id))
      .map(id => new ObjectId(id));

    // Fetch item details using their IDs
    const watchlistItems = await dataCollection.find({ _id: { $in: itemIds } }).toArray();

    return res.status(200).json({ watchlist: watchlistItems });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await getData(); // Fetch data using the function
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// API endpoint to get a specific item by ID

// Get Item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const item = await database.collection('Data').findOne({ _id: new ObjectId(itemId) });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch user details from MongoDB
    const user = await database.collection('UserData').findOne({ userid: id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Exclude sensitive fields like password
    const { password, ...userData } = user;

    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update User Profile
app.put('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;

    if (!name || !email || !username) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const result = await database.collection('UserData').updateOne({ userid: id }, { $set: { name, email, username } });

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change User Password
app.put('/api/user/change-password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await database.collection('UserData').findOne({ userid: id });
    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    await database.collection('UserData').updateOne({ userid: id }, { $set: { password: newPassword } });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server After DB Connection
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
});
