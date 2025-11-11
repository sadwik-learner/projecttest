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
  const [view, setView] = useState("signup"); // default view → signup
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Forum states
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  // Skill barter system
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setView(u ? "home" : "signup");
    });
    return () => unsubAuth();
  }, []);

  // Fetch forum posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch skills
  useEffect(() => {
    const q = query(collection(db, "skills"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const q = query(collection(db, "profiles"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setProfile(snap.docs[0].data());
    };
    fetchProfile();
  }, [user]);

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

  const handleCreatePost = async () => {
    if (!postText.trim()) {
      alert("Please enter something before posting!");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        text: postText.trim(),
        userName: anonymous
          ? "Anonymous"
          : user?.displayName || user?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setPostText("");
      setAnonymous(false);
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Error creating post: " + error.message);
    }
  };

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

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  // -------------------- SIGNUP PAGE --------------------
  if (!user && view === "signup")
  return (
    <div className="d-flex flex-column flex-lg-row min-vh-100 bg-light">
      {/* ---------- Left Panel ---------- */}
      <div
        className="d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #0059ff, #003366)",
        }}
      >
        <img
          src="https://th.bing.com/th/id/R.4a5a50149b3328a690a8474f4ca9af37?rik=YrjMjynl81m0Iw&riu=http%3a%2f%2fvnrvjietcsi.com%2fassets%2fvnr_logo-um4qrAXU.png&ehk=s5AzPWR8AsUaLMuX5Flcn8NZgG72nr9%2bbgTKK2yx1CU%3d&risl=&pid=ImgRaw&r=0"
          alt="VNRVJIET Logo"
          style={{
            width: "320px",
            marginBottom: "25px",
            filter:
              "brightness(1.3) contrast(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.5))",
          }}
        />
        <h2 className="fw-bold text-center mb-3">
          VNRVJIET Connect
        </h2>
        <p
          className="text-center"
          style={{
            maxWidth: "340px",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          Collaborate, Learn, and Grow Together — <br /> A digital
          community for Students, Faculty & Alumni.
        </p>
      </div>

      {/* ---------- Right Panel (Signup Form) ---------- */}
      <div
        className="d-flex flex-column justify-content-center align-items-center p-4 p-md-5"
        style={{ flex: 1.2, backgroundColor: "#f8f9fa" }}
      >
        <div
          className="card shadow-lg p-4 p-md-5"
          style={{
            width: "100%",
            maxWidth: "480px",
            borderRadius: "15px",
            backgroundColor: "#ffffff",
          }}
        >
          <h3 className="text-center text-primary fw-bold mb-3">
            Create Your Profile
          </h3>

          <form onSubmit={signup}>
            <input
              name="name"
              className="form-control mb-3"
              placeholder="Full Name"
              required
            />
            <input
              name="email"
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              required
            />
            <input
              name="password"
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              required
            />

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
    </div>
  );


  // -------------------- LOGIN PAGE --------------------
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
            <button className="btn btn-link p-0 text-primary fw-semibold" onClick={() => setView("signup")}>
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

      <div className="container mt-4">
        {/* ---------- HOME ---------- */}
        {view === "home" && (
          <div className="container mt-4">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-primary">Welcome to VNRVJIET Connect 🎓</h2>
              <p className="text-muted">
                Stay updated with campus happenings, collaborate with peers, and discover new opportunities.
              </p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm p-4 h-100 bg-light">
                  <h4 className="text-primary mb-3">📅 Upcoming Events</h4>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <strong>Hackathon 2025</strong><br />
                      <small>March 24–26 • CSE Dept</small><br />
                      <span className="badge bg-success mt-1">Registrations Open</span>
                    </li>
                    <li className="mb-3">
                      <strong>AI Workshop</strong><br />
                      <small>April 2 • Seminar Hall</small>
                    </li>
                    <li>
                      <strong>Alumni Talk: Product Design Careers</strong><br />
                      <small>April 10 • Main Auditorium</small>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 shadow-sm p-4 h-100 bg-light">
                  <h4 className="text-primary mb-3">📰 College News</h4>
                  <div className="news-item mb-3">
                    <strong>VNRVJIET ranks in Top 10 Private Engineering Colleges</strong>
                    <p className="small text-muted mb-0">
                      Recognized by NIRF 2025 for academic excellence and innovation.
                    </p>
                  </div>
                  <div className="news-item mb-3">
                    <strong>New Robotics Research Center Launched</strong>
                    <p className="small text-muted mb-0">
                      Collaboration with IIT Hyderabad to promote AI & Automation research.
                    </p>
                  </div>
                  <div className="news-item">
                    <strong>Admissions 2025 Opening Soon</strong>
                    <p className="small text-muted mb-0">
                      Stay tuned for official circulars and registration schedules.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm p-4 mb-5 bg-white">
              <h4 className="text-primary mb-3">💬 Recent Discussions</h4>
              {posts.length === 0 ? (
                <p className="text-muted">
                  No discussions yet.{" "}
                  <span
                    className="text-primary fw-semibold"
                    style={{ cursor: "pointer" }}
                    onClick={() => setView("forum")}
                  >
                    Start one in the Forum!
                  </span>
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

            <div className="card shadow-sm p-4 bg-light">
              <h4 className="text-primary mb-3">🤝 Skill Exchange Highlights</h4>
              <p className="text-muted mb-3">
                Share your skills or learn from others in the VNRVJIET community.
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

        {/* ---------- FORUM ---------- */}
        {view === "forum" && (
          <div className="container mt-4">
            <h2 className="text-center fw-bold text-primary mb-4">VNRVJIET Forum 💬</h2>
            <p className="text-muted text-center mb-4">
              Ask questions, share ideas, and collaborate with your peers!
            </p>

            <div className="card shadow-sm p-4 mb-4 bg-light">
              <h5 className="text-secondary fw-semibold mb-3">Create a New Discussion</h5>
              <textarea
                className="form-control mb-3"
                placeholder="Type your question, idea, or topic..."
                rows="3"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              ></textarea>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="anonymousCheck"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="anonymousCheck">
                  Post as Anonymous
                </label>
              </div>

              <button className="btn btn-primary px-4" onClick={handleCreatePost}>
                Post
              </button>
            </div>

            <div className="forum-feed">
              {posts.length === 0 ? (
                <div className="text-center text-muted mt-5">
                  <h5>No discussions yet 🚀</h5>
                  <p>Start the first one above!</p>
                </div>
              ) : (
                posts.map((p) => (
                  <div key={p.id} className="card mb-3 p-3 shadow-sm">
                    <strong>{p.userName}</strong>
                    <p className="mb-1">{p.text}</p>
                    <small className="text-muted">
                      {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : ""}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---------- SKILL BARTER ---------- */}
        {view === "skills" && (
          <div className="container mt-4">
            <h2 className="text-center text-primary fw-bold mb-3">
              Skill-Sharing & Barter System 🤝
            </h2>
            <p className="text-muted text-center mb-4">
              Offer your skills or request help from others. Let’s learn and grow together!
            </p>

            <div className="card shadow-sm p-4 mb-4 bg-light">
              <h5 className="text-secondary fw-semibold mb-3">Share Your Skill</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Skill title (e.g., Web Development, Data Analysis)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <textarea
                className="form-control mb-3"
                rows="3"
                placeholder="Describe what you can teach or what you’d like to learn..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              ></textarea>
              <button className="btn btn-success" onClick={handleAddSkill}>
                Post Skill
              </button>
            </div>

            <div className="row">
              {!skills || skills.length === 0 ? (
                <div className="text-center text-muted mt-5">
                  <h5>No skills shared yet 🚀</h5>
                  <p>Be the first to start collaborating!</p>
                </div>
              ) : (
                skills.map((skill) => (
                  <div key={skill.id} className="col-md-6 mb-4">
                    <div className="card shadow-sm p-3 border-0 h-100">
                      <h5 className="text-primary">{skill.title}</h5>
                      <p className="mb-2">{skill.description}</p>
                      <small className="text-muted">
                        Posted by: {skill.userName || "Anonymous"}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---------- PROFILE ---------- */}
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
