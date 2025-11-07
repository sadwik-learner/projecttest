import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

export default function ForumPost({ post, db, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // --- Listen for real-time comment updates ---
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "posts", post.id, "comments"),
      (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, [db, post.id]);

  // --- Add Comment ---
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: newComment,
      userName: currentUser.displayName || "Anonymous",
      createdAt: new Date(),
    });
    setNewComment("");
  };

  // --- Handle Likes ---
  const handleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likes: increment(1),
    });
  };

  return (
    <div className="card mb-3 shadow-sm border-0 p-3 forum-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-circle bg-primary text-white fw-bold">
            {post.userName ? post.userName.charAt(0).toUpperCase() : "U"}
          </div>
          <strong>{post.userName || "Anonymous"}</strong>
        </div>
        <small className="text-muted">
          {post.createdAt?.toDate
            ? post.createdAt.toDate().toLocaleString()
            : ""}
        </small>
      </div>

      <p className="mb-2">{post.text}</p>

      <div className="d-flex gap-3 align-items-center mb-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleLike}
        >
          👍 Like {post.likes || 0}
        </button>
      </div>

      {/* --- Comments --- */}
      <div className="comment-section mt-3">
        <h6 className="text-muted mb-2">Comments ({comments.length})</h6>
        <div className="comment-list mb-2">
          {comments.map((c) => (
            <div key={c.id} className="mb-2">
              <strong>{c.userName}</strong>
              <p className="mb-0 small">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={handleAddComment}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
