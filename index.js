import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import HoldingsModel from './models/HoldingsModel.js';
import PositionsModel from './models/PositionsModel.js';
import OrdersModel from './models/OrdersModel.js';
import AuthRoute from './AuthRoute.js';
import UserModel from './models/UserModel.js';
import TransactionsModel from './models/TransactionModel.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS setup (allow all origins for development only)
app.use(
  cors({
    origin: true, // reflects origin from request
    credentials: true,
  })
);

// Optional: set response header explicitly
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

// ROUTES
app.use('/auth', AuthRoute);

// HOLDINGS
app.get('/allHoldings', async (req, res) => {
  try {
    const holdings = await HoldingsModel.find();
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching holdings' });
  }
});

app.get('/holdings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const holdings = await HoldingsModel.find({ user: userId });
    res.status(200).json(holdings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.post('/newOrder', async (req, res) => {
  let { name, qty, price, mode, user } = req.body;
  qty = Number(qty);
  price = Number(price);

  if (!user || !name || !mode || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Invalid or missing input fields" });
  }

  try {
    const userDoc = await UserModel.findById(user);
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const existing = await HoldingsModel.findOne({ name, user });
    const totalAmount = qty * price;

    if (mode === "BUY") {
      if (userDoc.funds < totalAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      userDoc.funds -= totalAmount;
      await userDoc.save();

      if (existing) {
        const totalQty = existing.qty + qty;
        const newAvg = (existing.qty * existing.avg + qty * price) / totalQty;
        existing.qty = totalQty;
        existing.avg = newAvg;
        existing.price = price;
        await existing.save();
      } else {
        await HoldingsModel.create({ name, qty, avg: price, price, user });
      }

      await TransactionsModel.create({ name, qty, price, mode, user, pl: 0 });

    } else if (mode === "SELL") {
      if (!existing || existing.qty < qty) {
        return res.status(400).json({ error: "Insufficient quantity to sell" });
      }

      const pl = (price - existing.avg) * qty;
      userDoc.funds += totalAmount;
      await userDoc.save();

      existing.qty -= qty;
      if (existing.qty === 0) {
        await HoldingsModel.deleteOne({ _id: existing._id });
      } else {
        await existing.save();
      }

      await TransactionsModel.create({ name, qty, price, mode, user, pl });
    }

    await OrdersModel.create({ name, qty, price, mode, user });
    res.status(200).json({ message: `${mode} order placed successfully` });

  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Error placing order" });
  }
});

app.get('/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await TransactionsModel.find({ user: userId }).sort({ _id: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "Logged out" });
});

app.post('/funds', async (req, res) => {
  const { userId, amount, type } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (type === "add") {
      user.funds += amount;
    } else if (type === "withdraw") {
      if (user.funds < amount) {
        return res.status(400).json({ error: "Insufficient funds to withdraw" });
      }
      user.funds -= amount;
    } else {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    await user.save();
    res.status(200).json({ message: "Transaction successful", funds: user.funds });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// CONNECT TO DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });















// import dotenv from 'dotenv';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import  HoldingsModel  from './models/HoldingsModel.js';
// import  PositionsModel  from './models/PositionsModel.js';
// import OrdersModel  from './models/OrdersModel.js';
// import AuthRoute from './AuthRoute.js'; 
// import UserModel from './models/UserModel.js';
// import TransactionsModel from "./models/TransactionModel.js"; 


// dotenv.config();


// // If you used: `export const router = express.Router()` then do `import { router as AuthRoute } from './AuthRoute.js'`

// const app = express();
// const port = process.env.PORT || 3001;

// const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

// app.use(
//   cors({
//     origin: true, // reflects the request origin (recommended for dev)
//     credentials: true,
//   })
// );
// //cors 
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(express.json());

// // AUTH ROUTES
// app.use('/auth', AuthRoute);
// //routes for login and signup

// // HOLDINGS
// app.get('/allHoldings', async (req, res) => {
//   try {
//     const holdings = await HoldingsModel.find();
//     res.json(holdings);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching holdings' });
//   }
// });
// //fetches allexisting holdings... will be useful for admin dasboard and overview




// app.get('/holdings/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const holdings = await HoldingsModel.find({ user: userId });

//     res.status(200).json(holdings);
//   } catch (error) {
//     console.error("Error fetching holdings:", error);
//     res.status(500).json({ error: "Failed to fetch holdings" });
//   }
// });
// //fetches holdings for the specific user

// app.get('/user/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const user = await UserModel.findById(id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.status(200).json(user);
//   } catch (err) {
//     console.error("User fetch error:", err);
//     res.status(500).json({ error: "Error fetching user" });
//   }
// });
// //gets user data




// app.post('/newOrder', async (req, res) => {
//   let { name, qty, price, mode, user } = req.body;

//   qty = Number(qty);
//   price = Number(price);

//   if (!user || !name || !mode || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
//     return res.status(400).json({ error: "Invalid or missing input fields" });
//   }

//   console.log(`Received order: ${mode} ${qty} x ${name} @ ₹${price} by user ${user}`);

//   try {
//     const userDoc = await UserModel.findById(user);
//     if (!userDoc) return res.status(404).json({ error: "User not found" });

//     const existing = await HoldingsModel.findOne({ name, user });
//     const totalAmount = qty * price;

//     // BUY logic
//     if (mode === "BUY") {
//       if (userDoc.funds < totalAmount) {
//         return res.status(400).json({ error: "Insufficient funds" });
//       }

//       // Deduct funds
//       userDoc.funds -= totalAmount;
//       await userDoc.save();

//       if (existing) {
//         const totalQty = existing.qty + qty;
//         const newAvg = (existing.qty * existing.avg + qty * price) / totalQty;

//         existing.qty = totalQty;
//         existing.avg = newAvg;
//         existing.price = price;
//         await existing.save();
//       } else {
//         await HoldingsModel.create({ name, qty, avg: price, price, user });
//       }

//       // Log BUY transaction (P/L = 0)
//       await TransactionsModel.create({ name, qty, price, mode, user, pl: 0 });
//     }

//     // SELL logic
//     else if (mode === "SELL") {
//       if (!existing || existing.qty < qty) {
//         return res.status(400).json({ error: "Insufficient quantity to sell" });
//       }

//       const pl = (price - existing.avg) * qty;

//       // Add funds after sell
//       userDoc.funds += totalAmount;
//       await userDoc.save();

//       existing.qty -= qty;

//       if (existing.qty === 0) {
//         await HoldingsModel.deleteOne({ _id: existing._id });
//       } else {
//         await existing.save();
//       }

//       // Log SELL transaction with P/L
//       await TransactionsModel.create({ name, qty, price, mode, user, pl });
//     }

//     // Log order (after validations and changes)
//     await OrdersModel.create({ name, qty, price, mode, user });

//     res.status(200).json({ message: `${mode} order placed successfully` });

//   } catch (error) {
//     console.error("Order error:", error);
//     res.status(500).json({ error: "Error placing order" });
//   }
// });
// //creates a new order for buy or sell, updates holdings, user funds, and logs the transaction





// app.get('/transactions/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const transactions = await TransactionsModel.find({ user: userId }).sort({ _id: -1 });
//     res.status(200).json(transactions);
//   } catch (err) {
//     console.error("Transaction fetch error:", err);
//     res.status(500).json({ error: "Error fetching transactions" });
//   }
// });
// //fetches trasacions for a specific user, sorted by most recent first





// app.post('/logout', (req, res) => {
//   res.clearCookie('token'); // If token is in cookie
//   res.status(200).json({ message: "Logged out" });
// });
// //function to log out




// app.post('/funds', async (req, res) => {
//   const { userId, amount, type } = req.body;

//   try {
//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     if (type === "add") {
//       user.funds += amount;
//     } else if (type === "withdraw") {
//       if (user.funds < amount) {
//         return res.status(400).json({ error: "Insufficient funds to withdraw" });
//       }
//       user.funds -= amount;
//     } else {
//       return res.status(400).json({ error: "Invalid transaction type" });
//     }

//     await user.save();
//     res.status(200).json({ message: "Transaction successful", funds: user.funds });
//   } catch (err) {
//     console.error("Funds transaction error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// //handles adding or withdrawing funds for a user, updating their balance accordingly



// // CONNECT TO MONGODB AND START SERVER
// mongoose.connect(process.env.MONGODB_URI)
// .then(() => {
//   console.log('Connected to MongoDB');
//   app.listen(port, () => console.log(`Server running on port ${port}`));
// }).catch(err => {
//   console.error('Failed to connect to MongoDB', err);
// });

  
  