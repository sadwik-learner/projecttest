import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, serverTimestamp, orderBy, query } from "firebase/firestore";

export default function ForumPost({ db, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages from Firestore (real-time)
  useEffect(() => {
    const q = query(collection(db, "forumMessages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db]);

  // Add new message
  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
     await addDoc(collection(db, "forumMessages"), {
  text: input.trim(),
  userName: anonymous
    ? "Anonymous"
    : user?.displayName || "Anonymous",
  userEmail: anonymous
    ? "Hidden"
    : user?.email || "No email",
  createdAt: serverTimestamp(),
});


      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message: " + err.message);
    }
  };

  return (
    <div className="forum-container">
      <h3 className="forum-title">💬 VNRVJIET Forum Chat</h3>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`chat-message ${
              msg.userName === (user?.displayName || user?.email) ? "chat-right" : "chat-left"
            }`}
          >
            <div className="chat-bubble">
              <strong className="chat-username">{msg.userName}</strong>
              <p>{msg.text}</p>
              <small className="chat-time">
                {msg.createdAt?.toDate
                  ? msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </small>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
