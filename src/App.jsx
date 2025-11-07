import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  // Firestore listeners
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setView(u ? "home" : "login");
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ✅ Signup
  const signup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;
    const branch = e.target.branch.value;
    const bio = e.target.bio.value;
    const skills = e.target.skills.value;
    const interests = e.target.interests.value;
    const contact = e.target.contact.value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await addDoc(collection(db, "profiles"), {
        uid: cred.user.uid,
        name,
        email,
        role,
        branch,
        bio,
        skills,
        interests,
        contact,
        createdAt: serverTimestamp(),
      });

      setView("home");
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Login
  const login = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
  };

  // ✅ Post
  const postMessage = async () => {
    if (!newPost.trim()) return;
    await addDoc(collection(db, "posts"), {
      text: newPost.trim(),
      userName: anonymous ? "Anonymous" : user.displayName,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setNewPost("");
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  // ---------------------------- LOGIN ----------------------------
  if (!user && view === "login")
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: 400 }}>
          <h3 className="text-center text-primary mb-3">VNRVJIET Connect</h3>
          <h5 className="text-center mb-3">Login</h5>
          <form onSubmit={login}>
            <input name="email" type="email" className="form-control mb-3" placeholder="Email" required />
            <input name="password" type="password" className="form-control mb-3" placeholder="Password" required />
            <button className="btn btn-primary w-100">Login</button>
          </form>
          <p className="text-center mt-3">
            Don’t have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setView("signup")}>Sign Up</button>
          </p>
        </div>
      </div>
    );

  // ---------------------------- SIGNUP ----------------------------
  if (!user && view === "signup")
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: 460 }}>
          <h3 className="text-center text-primary mb-3">VNRVJIET Connect</h3>
          <h5 className="text-center mb-3">Create Your Profile</h5>
          <form onSubmit={signup}>
            <input name="name" className="form-control mb-3" placeholder="Full name" required />
            <input name="email" className="form-control mb-3" placeholder="Email" required />
            <input name="password" type="password" className="form-control mb-3" placeholder="Password" required />

            <select name="role" className="form-select mb-3" required>
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
            </select>

            <select name="branch" className="form-select mb-3">
              <option value="">Select Branch</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>

            <textarea name="bio" className="form-control mb-3" rows="2" placeholder="Short bio about you"></textarea>
            <input name="skills" className="form-control mb-3" placeholder="Skills (e.g., Python, React, SQL)" />
            <input name="interests" className="form-control mb-3" placeholder="Interests (e.g., AI, Robotics, Design)" />
            <input name="contact" className="form-control mb-3" placeholder="Contact info (Email / LinkedIn)" />

            <button className="btn btn-success w-100">Sign Up</button>
          </form>
          <p className="text-center mt-3">
            Already have an account?{" "}
            <button className="btn btn-link p-0" onClick={() => setView("login")}>Login</button>
          </p>
        </div>
      </div>
    );

  // ---------------------------- PROFILE COMPONENT ----------------------------
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const q = query(collection(db, "profiles"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setProfile(snap.docs[0].data());
    };
    fetchProfile();
  }, [user]);

  // ---------------------------- MAIN APP ----------------------------
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">VNRVJIET Connect</span>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("home")}>Home</button>
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("forum")}>Forum</button>
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("profile")}>Profile</button>
          <button className="btn btn-sm btn-danger" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-4">
        {/* HOME */}
        {view === "home" && (
          <div className="text-center mt-5">
            <h2 className="text-primary">Welcome to VNRVJIET Connect</h2>
            <p className="lead">Stay connected with peers, alumni, and mentors.</p>
          </div>
        )}

        {/* FORUM */}
        {view === "forum" && (
          <div>
            <h3 className="text-primary mb-3">Discussion Forum</h3>
            <div className="card p-3 mb-3">
              <textarea
                className="form-control mb-2"
                rows="3"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write something..."
              ></textarea>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <label className="form-check-label">Post anonymously</label>
              </div>
              <button className="btn btn-primary" onClick={postMessage}>Post</button>
            </div>

            {posts.map((p) => (
              <div key={p.id} className="border rounded p-3 mb-2">
                <strong>{p.userName}</strong>
                <p className="mb-1">{p.text}</p>
                <small className="text-muted">
                  {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : ""}
                </small>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && profile && (
          <div className="card shadow p-4">
            <h3 className="text-primary">{profile.name}</h3>
            <h6 className="text-muted mb-3">
              {profile.role?.toUpperCase()} • {profile.branch || "N/A"}
            </h6>
            <p><strong>Bio:</strong> {profile.bio || "Not provided"}</p>
            <p><strong>Skills:</strong> {profile.skills || "Not specified"}</p>
            <p><strong>Interests:</strong> {profile.interests || "Not specified"}</p>
            <p><strong>Contact:</strong> {profile.contact || "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

