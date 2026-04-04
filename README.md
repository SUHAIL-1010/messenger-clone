# 💬 Messenger Clone

A real-time chat application built with **React**, **Node.js**, **Socket.io**, and **MongoDB**. Features include user authentication, contact management, real-time messaging, online status indicators, and unread message notifications.

---

## ✨ Features

- 🔐 **User Authentication** — Register & Login with hashed passwords (bcrypt)
- 👥 **Contact Management** — Add friends and manage your contact list
- 💬 **Real-Time Messaging** — Instant messaging powered by Socket.io
- 🟢 **Online Status** — See which contacts are currently online
- 🔴 **Unread Indicators** — Red dot notifications for new messages
- 🔒 **Private Rooms** — Each conversation gets a unique, private room

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, Axios, Socket.io-client      |
| Backend    | Node.js, Express, Socket.io         |
| Database   | MongoDB (Mongoose)                  |
| Auth       | bcryptjs                            |
| Deployment | Vercel (client) + Render (server)   |

---

## 📁 Project Structure

```
messenger-clone/
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js        # Main app component
│   │   ├── App.css       # Styles
│   │   └── index.js      # Entry point
│   ├── package.json
│   └── vercel.json       # Vercel deployment config
├── server/               # Express backend
│   ├── index.js          # Server entry point (API + Socket.io)
│   ├── package.json
│   └── .env.example      # Environment variable template
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/SUHAIL-1010/messenger-clone.git
cd messenger-clone
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
PORT=3001
```

Start the server:

```bash
npm start
```

### 3. Setup the Client

```bash
cd client
npm install
```

> **Note:** Update the `BACKEND_URL` in `client/src/App.js` to point to your server (e.g., `http://localhost:3001` for local development).

Start the client:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deployment

### Client → Vercel

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Set the **Root Directory** to `client`
4. Deploy!

### Server → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Set the **Root Directory** to `server`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add environment variable `MONGO_URI` in the Render dashboard

---

## 📸 Screenshots

> Add screenshots of your app here!

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mohamed Suhail**

---

⭐ Star this repo if you found it useful!
