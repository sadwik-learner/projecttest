import React, { useState, useEffect } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import ForumPost from "./ForumPost.jsx";

export default function App() {
  // 🔹 Core states
  const [user, setUser] = useState(null);

  // 🟢 CHANGE 1 — Start with the signup view
  const [view, setView] = useState("signup");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // 🔹 Forum & posts
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");

  // 🔹 Skill Barter system
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // ---------- Auth Listener ----------
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      // 🟢 CHANGE 2 — Default to "signup" when not logged in
      setView(u ? "home" : "signup");
    });
    return () => unsubAuth();
  }, []);

  // ---------- Fetch Posts ----------
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ---------- Fetch Skills ----------
  useEffect(() => {
    const q = query(collection(db, "skills"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ---------- Fetch Profile ----------
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const q = query(collection(db, "profiles"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setProfile(snap.docs[0].data());
    };
    fetchProfile();
  }, [user]);

  // ---------- Auth Handlers ----------
  const signup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;
    const branch = e.target.branch.value;
    const bio = e.target.bio.value;
    const skillsInput = e.target.skills.value;
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
        skills: skillsInput,
        interests,
        contact,
        createdAt: serverTimestamp(),
      });
      setView("home");
    } catch (err) {
      alert(err.message);
    }
  };

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

  const logout = async () => {
    await signOut(auth);
  };

  // ---------- Post creation ----------
  const handleCreatePost = async () => {
    if (!postText.trim()) {
      alert("Please enter something before posting!");
      return;
    }
    try {
      await addDoc(collection(db, "posts"), {
        text: postText.trim(),
        userName: user?.displayName || user?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setPostText("");
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  // ---------- Skill creation ----------
  const handleAddSkill = async () => {
    if (!newSkill.trim() || !newDescription.trim()) {
      alert("Please fill out both fields before posting.");
      return;
    }
    try {
      await addDoc(collection(db, "skills"), {
        title: newSkill.trim(),
        description: newDescription.trim(),
        userName: user?.displayName || user?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewSkill("");
      setNewDescription("");
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  // -------------------- Loading --------------------
  if (loading) return <div className="p-5 text-center">Loading...</div>;

  // -------------------- 🟢 SIGNUP (Now default first page) --------------------
  if (!user && view === "signup")
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="card shadow-lg p-4" style={{ width: "480px", borderRadius: "15px" }}>
          <h3 className="text-center text-primary fw-bold mb-3">VNRVJIET Connect</h3>
          <h5 className="text-center mb-4 text-secondary">Create Your Profile</h5>

          <form onSubmit={signup}>
            <input name="name" className="form-control mb-3" placeholder="Full Name" required />
            <input name="email" type="email" className="form-control mb-3" placeholder="Email" required />
            <input name="password" type="password" className="form-control mb-3" placeholder="Password" required />

            <label className="form-label fw-semibold">Role</label>
            <select name="role" className="form-select mb-3" required>
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
            </select>

            <label className="form-label fw-semibold">Branch</label>
            <select name="branch" className="form-select mb-3">
              <option value="">Select Branch</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>

            <textarea
              name="bio"
              className="form-control mb-3"
              rows="2"
              placeholder="Short bio about you"
            ></textarea>

            <input
              name="skills"
              className="form-control mb-3"
              placeholder="Skills (e.g., Python, React, SQL)"
            />
            <input
              name="interests"
              className="form-control mb-3"
              placeholder="Interests (e.g., AI, Robotics, Design)"
            />
            <input
              name="contact"
              className="form-control mb-4"
              placeholder="Contact info (Email / LinkedIn)"
            />

            <button
              type="submit"
              className="btn btn-success w-100 py-2 fw-semibold"
              style={{ borderRadius: "8px" }}
            >
              Sign Up
            </button>
          </form>

          {/* 🟢 CHANGE 3 — Added "Already have an account?" under signup */}
          <p className="text-center mt-3 mb-0">
            Already have an account?{" "}
            <button
              className="btn btn-link p-0 text-primary fw-semibold"
              onClick={() => setView("login")}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    );

  // -------------------- 🟡 LOGIN --------------------
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

          {/* 🟢 CHANGE 4 — Added "Don’t have an account?" to go back */}
          <p className="text-center mt-3">
            Don’t have an account?{" "}
            <button
              className="btn btn-link p-0 text-primary fw-semibold"
              onClick={() => setView("signup")}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    );

  // -------------------- MAIN APP --------------------
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">VNRVJIET Connect</span>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("home")}>Home</button>
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("forum")}>Forum</button>
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("skills")}>Skill Barter</button>
          <button className="btn btn-sm btn-outline-light" onClick={() => setView("profile")}>Profile</button>
          <button className="btn btn-sm btn-danger" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* 🏠 HOME PAGE */}
      {view === "home" && (
        <div className="container mt-4 text-center">
          <h2 className="fw-bold text-primary mb-3">Welcome to VNRVJIET Connect 🎓</h2>
          <p className="text-muted">Your digital campus for learning, collaboration, and interaction.</p>
          <div className="mt-4">
            <h4 className="text-primary mb-3">📅 Upcoming Events</h4>
            <ul className="list-unstyled">
              <li><strong>Hackathon 2025:</strong> March 24–26 (CSE Dept)</li>
              <li><strong>AI Workshop:</strong> April 2 (Seminar Hall)</li>
              <li><strong>Alumni Talk:</strong> April 10 (Auditorium)</li>
            </ul>
          </div>
        </div>
      )}

      {/* 💬 FORUM */}
      {view === "forum" && (
        <div className="container mt-4">
          {db && user ? <ForumPost db={db} user={user} /> : <div className="text-center text-muted mt-5">Loading forum...</div>}
        </div>
      )}

      {/* 🤝 SKILL BARTER */}
      {view === "skills" && (
        <div className="container mt-4">
          <h2 className="text-center text-primary fw-bold mb-3">Skill Barter System 🤝</h2>
          <p className="text-muted text-center mb-4">Share your skills and learn from peers!</p>
          <div className="card shadow-sm p-4 mb-4 bg-light">
            <h5 className="text-secondary fw-semibold mb-3">Share Your Skill</h5>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Skill title (e.g., Web Development)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Describe your skill or request..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            ></textarea>
            <button className="btn btn-success" onClick={handleAddSkill}>Post Skill</button>
          </div>
          <div className="row">
            {skills.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <h5>No skills shared yet 🚀</h5>
              </div>
            ) : (
              skills.map((skill) => (
                <div key={skill.id} className="col-md-6 mb-4">
                  <div className="card shadow-sm p-3 border-0 h-100">
                    <h5 className="text-primary">{skill.title}</h5>
                    <p className="mb-2">{skill.description}</p>
                    <small className="text-muted">Posted by: {skill.userName || "Anonymous"}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 👤 PROFILE */}
      {view === "profile" && (
        profile ? (
          <div className="card shadow p-4 m-4">
            <h3 className="text-primary">{profile.name}</h3>
            <h6 className="text-muted mb-3">
              {profile.role?.toUpperCase()} • {profile.branch || "N/A"}
            </h6>
            <p><strong>Bio:</strong> {profile.bio || "Not provided"}</p>
            <p><strong>Skills:</strong> {profile.skills || "Not specified"}</p>
            <p><strong>Interests:</strong> {profile.interests || "Not specified"}</p>
            <p><strong>Contact:</strong> {profile.contact || "N/A"}</p>
          </div>
        ) : (
          <div className="text-center text-muted mt-5">No profile data found.</div>
        )
      )}
    </div>
  );
}
