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

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [profile, setProfile] = useState(null);

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

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const q = query(collection(db, "profiles"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setProfile(snap.docs[0].data());
    };
    fetchProfile();
  }, [user]);

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  // -------------------- LOGIN --------------------
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

  // -------------------- SIGNUP --------------------
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

  // -------------------- MAIN APP --------------------
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
       {view === "home" && (
  <div className="container mt-4">
    <div className="text-center mb-4">
      <h2 className="fw-bold text-primary">Welcome to VNRVJIET Connect 🎓</h2>
      <p className="text-muted">
        Stay connected, collaborate, and grow with your peers, faculty, and alumni.
      </p>
    </div>

    {/* --- Events & Announcements --- */}
    <div className="row g-4 mb-5">
      <div className="col-md-6">
        <div className="card border-0 shadow-sm p-4 h-100 bg-light">
          <h4 className="text-primary mb-3">Upcoming Events 📅</h4>
          <ul className="list-unstyled">
            <li className="mb-3">
              <strong>Hackathon 2025</strong><br />
              <small>24–26 March • CSE Dept</small><br />
              <span className="badge bg-success mt-1">Register Open</span>
            </li>
            <li className="mb-3">
              <strong>AI Workshop</strong><br />
              <small>2 April • Seminar Hall</small>
            </li>
            <li>
              <strong>Alumni Talk: Career in Product Design</strong><br />
              <small>10 April • Auditorium</small>
            </li>
          </ul>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card border-0 shadow-sm p-4 h-100 bg-light">
          <h4 className="text-primary mb-3">College News 📰</h4>
          <div className="news-item mb-3">
            <strong>VNRVJIET ranked among Top 10 private colleges</strong>
            <p className="small text-muted mb-0">
              Recognized by NIRF 2025 for excellence in innovation & research.
            </p>
          </div>
          <div className="news-item mb-3">
            <strong>New Center for Robotics launched</strong>
            <p className="small text-muted mb-0">
              Collaboration with IIT Hyderabad to boost automation learning.
            </p>
          </div>
          <div className="news-item">
            <strong>Admissions 2025 opening soon</strong>
            <p className="small text-muted mb-0">
              Stay tuned for official circulars and registration updates.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* --- Forum Preview --- */}
    <div className="card shadow-sm p-4 mb-5 bg-white">
      <h4 className="text-primary mb-3">Recent Discussions 💬</h4>
      {posts.length === 0 ? (
        <p className="text-muted">
          No discussions yet. <span className="link-primary" onClick={() => setView("forum")}>Start one in the Forum!</span>
        </p>
      ) : (
        posts.slice(0, 3).map((p) => (
          <div key={p.id} className="border-bottom pb-2 mb-3">
            <strong>{p.userName}</strong>
            <p className="mb-1">{p.text}</p>
            <small className="text-muted">
              {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : ""}
            </small>
          </div>
        ))
      )}
    </div>

    {/* --- Skill Exchange / Barter --- */}
    <div className="card shadow-sm p-4 bg-light">
      <h4 className="text-primary mb-3">Skill Exchange 🤝</h4>
      <p className="text-muted mb-3">
        Share your skills or learn from others in the VNRVJIET community. 
        Connect with peers through collaboration and mentorship.
      </p>
      <div className="d-flex flex-wrap gap-3">
        <div className="p-3 border rounded bg-white shadow-sm flex-fill text-center">
          <h6 className="fw-bold mb-1">Python & Data Science</h6>
          <small>Offered by: Harika (CSE)</small>
        </div>
        <div className="p-3 border rounded bg-white shadow-sm flex-fill text-center">
          <h6 className="fw-bold mb-1">UI/UX Design</h6>
          <small>Looking to Learn</small>
        </div>
        <div className="p-3 border rounded bg-white shadow-sm flex-fill text-center">
          <h6 className="fw-bold mb-1">Machine Learning Basics</h6>
          <small>Offered by: Arjun (AI)</small>
        </div>
      </div>
    </div>
  </div>
)}


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
