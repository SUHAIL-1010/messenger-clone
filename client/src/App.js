import io from "socket.io-client";
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// ⚠️ YOUR RENDER BACKEND URL
const BACKEND_URL = "https://messenger-clone-ywy4.onrender.com";
const socket = io.connect(BACKEND_URL);

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Contacts is now a list of objects: { name: "Alex", unread: true }
  const [contacts, setContacts] = useState([]); 
  const [onlineUsers, setOnlineUsers] = useState([]); // List of online usernames

  const [screen, setScreen] = useState("login"); 
  const [isRegistering, setIsRegistering] = useState(false);

  // Chat State
  const [room, setRoom] = useState("");
  const [friendName, setFriendName] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [newContact, setNewContact] = useState("");

  // --- 1. LOGIN & SETUP ---
  const handleAuth = async () => {
    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const response = await axios.post(`${BACKEND_URL}${endpoint}`, { username, password });
      
      if (isRegistering) {
        alert("Registration Successful! Please Login.");
        setIsRegistering(false);
      } else {
        // Login Success
        setContacts(response.data.contacts || []);
        setScreen("dashboard");
        
        // Tell Server we are online
        socket.emit("user_connected", response.data.username);
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  // --- 2. ADD CONTACT ---
  const addContact = async () => {
    if (!newContact) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/addcontact`, { 
        username, 
        contactName: newContact 
      });
      setContacts(response.data.contacts);
      setNewContact("");
    } catch (err) {
      alert("Error adding contact");
    }
  };

  // --- 3. START CHAT & CLEAR RED DOT ---
  const startChat = async (friend) => {
    setFriendName(friend);
    const secretRoomId = [username, friend].sort().join("");
    setRoom(secretRoomId);
    
    // Call API to remove red dot (unread: false)
    const response = await axios.post(`${BACKEND_URL}/markread`, { username, contactName: friend });
    setContacts(response.data.contacts);

    socket.emit("join_room", secretRoomId);
    loadMessages(secretRoomId);
    setScreen("chat");
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/messages/${roomId}`);
      setMessageList(response.data);
    } catch (err) { console.log(err); }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room, 
        author: username, 
        receiver: friendName, // Important for Backend "Unread" logic
        message: currentMessage,
        time: new Date().getHours() + ":" + new Date().getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      // If we are IN the chat, add to list
      if (screen === "chat" && (data.author === friendName || data.author === username)) {
         setMessageList((list) => [...list, data]);
      } 
      // Note: If we are on Dashboard, the "unread" status is updated in DB
    });

    // Listen for Online Status Updates
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
    };
  }, [socket, screen, friendName, username]);

  return (
    <div className="App">
      
      {screen === "login" && (
        <div className="joinChatContainer">
          <h3>Messenger Login</h3>
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleAuth}>{isRegistering ? "Sign Up" : "Login"}</button>
          <p style={{cursor: "pointer", textDecoration: "underline"}} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Back to Login" : "Register New Account"}
          </p>
        </div>
      )}

      {screen === "dashboard" && (
        <div className="joinChatContainer">
          <h3>Welcome, {username}!</h3>
          
          <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
             <input type="text" placeholder="Add friend..." value={newContact} onChange={(e) => setNewContact(e.target.value)} />
             <button onClick={addContact} style={{width: "80px"}}>+</button>
          </div>

          <h4>Your Contacts:</h4>
          <div className="contacts-list">
             {contacts.length === 0 ? <p>No friends yet.</p> : contacts.map((contactObj, index) => {
                const isOnline = onlineUsers.includes(contactObj.name);
                return (
                <button 
                  key={index} 
                  onClick={() => startChat(contactObj.name)} 
                  style={{marginTop: "10px", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}
                >
                  {/* Name and Red Dot */}
                  <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    {contactObj.name}
                    {contactObj.unread && (
                      <span style={{height: "10px", width: "10px", backgroundColor: "red", borderRadius: "50%", display: "inline-block"}}></span>
                    )}
                  </div>

                  {/* Online Green Dot */}
                  {isOnline && (
                     <span style={{height: "10px", width: "10px", backgroundColor: "#00e676", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 5px #00e676"}}></span>
                  )}
                </button>
             )})}
          </div>
        </div>
      )}

      {screen === "chat" && (
        <div className="chat-window">
          <div className="chat-header">
            <button onClick={() => setScreen("dashboard")} style={{float: "left", fontSize: "12px"}}>← Back</button>
            <p>Chat with {friendName}</p>
          </div>
          <div className="chat-body">
            {messageList.map((msg, idx) => (
              <div key={idx} className="message" id={username === msg.author ? "you" : "other"}>
                <div>
                   <div className="message-content"><p>{msg.message}</p></div>
                   <div className="message-meta"><p>{msg.time}</p><p>{msg.author}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-footer">
            <input type="text" value={currentMessage} placeholder="Hey..." 
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()} />
            <button onClick={sendMessage}>►</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;