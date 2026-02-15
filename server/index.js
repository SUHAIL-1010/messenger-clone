const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE MODELS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // UPDATED: Contacts is now an array of objects to store 'unread' status
  contacts: [{ 
    name: String, 
    unread: { type: Boolean, default: false } 
  }] 
});
const User = mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
  room: String,
  author: String,
  message: String,
  time: String,
});
const Message = mongoose.model("Message", MessageSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- API ROUTES ---

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, contacts: [] });
    await newUser.save();
    res.status(201).json({ message: "User created!" });
  } catch (err) { res.status(500).json(err); }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // Send back the user's contact list (which now includes unread status)
    res.json({ message: "Login successful", username: user.username, contacts: user.contacts });
  } catch (err) { res.status(500).json(err); }
});

app.post("/addcontact", async (req, res) => {
  const { username, contactName } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if contact already exists
    if (user.contacts.some(c => c.name === contactName)) {
        return res.status(400).json({ message: "Contact already added" });
    }
    
    // Add new contact object
    user.contacts.push({ name: contactName, unread: false });
    await user.save();
    res.json({ message: "Contact added", contacts: user.contacts });
  } catch (err) { res.status(500).json(err); }
});

// NEW: Endpoint to clear the "Red Dot" when you open a chat
app.post("/markread", async (req, res) => {
  const { username, contactName } = req.body;
  try {
    const user = await User.findOne({ username });
    const contact = user.contacts.find(c => c.name === contactName);
    if (contact) {
      contact.unread = false;
      await user.save();
    }
    res.json({ contacts: user.contacts });
  } catch (err) { res.status(500).json(err); }
});

app.get("/messages/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room });
    res.json(messages);
  } catch (err) { res.status(500).json(err); }
});

// --- SOCKET LOGIC (UPDATED FOR ONLINE STATUS) ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Track online users globally
let onlineUsers = new Map(); // Stores { socketId: username }

io.on("connection", (socket) => {
  
  // 1. Listen for user login to track Online Status
  socket.on("user_connected", (username) => {
    onlineUsers.set(socket.id, username);
    // Broadcast list of online usernames to everyone
    io.emit("online_users", Array.from(onlineUsers.values()));
  });

  socket.on("join_room", (room) => { socket.join(room); });

  socket.on("send_message", async (data) => {
    // Save Message
    const newMessage = new Message(data);
    await newMessage.save();
    
    // RED DOT LOGIC: Find the receiver and set 'unread: true' in their DB
    // We assume the Frontend sends 'receiver' in the data
    if (data.receiver) {
      const receiverUser = await User.findOne({ username: data.receiver });
      if (receiverUser) {
        const contactEntry = receiverUser.contacts.find(c => c.name === data.author);
        if (contactEntry) {
           contactEntry.unread = true;
           await receiverUser.save();
        }
      }
    }

    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("online_users", Array.from(onlineUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});