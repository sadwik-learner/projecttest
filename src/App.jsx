import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // Fake login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: "User" });
    setPage("home");
  };

  // Fake signup handler
  const handleSignup = (e) => {
    e.preventDefault();
    setUser({ name: "New User" });
    setPage("home");
  };

  // Simple Navbar
  const Navbar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <a className="navbar-brand fw-bold" href="#">VNRVJIET Connect</a>
      <div className="collapse navbar-collapse show">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <button onClick={() => setPage("home")} className="nav-link btn btn-link text-white">Home</button>
          </li>
          <li className="nav-item">
            <button onClick={() => setPage("forum")} className="nav-link btn btn-link text-white">Forum</button>
          </li>
          <li className="nav-item">
            <button onClick={() => setPage("skills")} className="nav-link btn btn-link text-white">Skill Hub</button>
          </li>
          <li className="nav-item">
            <button onClick={() => setPage("mentorship")} className="nav-link btn btn-link text-white">Mentorship</button>
          </li>
          <li className="nav-item">
            <button onClick={() => { setUser(null); setPage("login"); }} className="nav-link btn btn-link text-white">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );

  // Home Page
  const Home = () => (
    <div>
      <h2 className="text-primary mb-4">Campus Feed</h2>
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">🎯 Hackathon Announcement</h5>
          <p>Join the 24-hour VNRVJIET hackathon this weekend. Form your teams now!</p>
        </div>
      </div>
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">🎓 Alumni Talk Series</h5>
          <p>Catch up with alumni discussing “Career Opportunities in AI” this Friday.</p>
        </div>
      </div>
    </div>
  );

  // Forum
  const Forum = () => {
    const [posts, setPosts] = useState([
      { id: 1, user: "Student A", text: "When are the mid-sem results releasing?" },
    ]);
    const [newPost, setNewPost] = useState("");

    const addPost = () => {
      if (!newPost.trim()) return;
      setPosts([...posts, { id: posts.length + 1, user: "You", text: newPost }]);
      setNewPost("");
    };

    return (
      <div>
        <h2 className="text-primary mb-4">Forum Discussions</h2>
        {posts.map((p) => (
          <div key={p.id} className="alert alert-secondary">
            <strong>{p.user}</strong>: {p.text}
          </div>
        ))}
        <div className="input-group mt-3">
          <input
            className="form-control"
            placeholder="Write something..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addPost}>Post</button>
        </div>
      </div>
    );
  };

  // Skill Hub
  const SkillHub = () => {
    const skills = [
      { skill: "Python", offer: "Teaching Python basics and OOPs concepts" },
      { skill: "UI Design", offer: "Collaborating on Figma projects" },
      { skill: "ReactJS", offer: "Helping with beginner projects" },
    ];
    return (
      <div>
        <h2 className="text-primary mb-4">Skill Exchange Hub</h2>
        <div className="row">
          {skills.map((s, i) => (
            <div key={i} className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">{s.skill}</h5>
                  <p>{s.offer}</p>
                  <button className="btn btn-outline-primary">Connect</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Mentorship
  const Mentorship = () => {
    const mentors = [
      { name: "Ravi Kumar", domain: "AI / ML", year: "2019 Alumni" },
      { name: "Sneha Rao", domain: "Web Development", year: "2020 Alumni" },
      { name: "Aarav Mehta", domain: "Cybersecurity", year: "2018 Alumni" },
    ];
    return (
      <div>
        <h2 className="text-primary mb-4">Mentorship & Alumni Connect</h2>
        <div className="row">
          {mentors.map((m, i) => (
            <div key={i} className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-primary">{m.name}</h5>
                  <p>{m.domain}</p>
                  <small className="text-muted">{m.year}</small><br />
                  <button className="btn btn-primary mt-2">Request Mentorship</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Login Form
  const Login = () => (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center text-primary mb-3">VNRVJIET Connect</h3>
        <h5 className="text-center mb-3">Login</h5>
        <form onSubmit={handleLogin}>
          <input type="email" className="form-control mb-3" placeholder="Email" required />
          <input type="password" className="form-control mb-3" placeholder="Password" required />
          <button className="btn btn-primary w-100 mb-2">Login</button>
        </form>
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <button className="btn btn-link p-0" onClick={() => setPage("signup")}>Sign up</button>
        </p>
      </div>
    </div>
  );

  // Signup Form
  const Signup = () => (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center text-primary mb-3">VNRVJIET Connect</h3>
        <h5 className="text-center mb-3">Sign Up</h5>
        <form onSubmit={handleSignup}>
          <input type="text" className="form-control mb-3" placeholder="Full Name" required />
          <input type="email" className="form-control mb-3" placeholder="Email" required />
          <input type="password" className="form-control mb-3" placeholder="Password" required />
          <select className="form-select mb-3">
            <option>Student</option>
            <option>Faculty</option>
            <option>Alumni</option>
          </select>
          <button className="btn btn-success w-100 mb-2">Sign Up</button>
        </form>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <button className="btn btn-link p-0" onClick={() => setPage("login")}>Login</button>
        </p>
      </div>
    </div>
  );

  // Page Logic
  if (!user && page === "login") return <Login />;
  if (!user && page === "signup") return <Signup />;

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        {page === "home" && <Home />}
        {page === "forum" && <Forum />}
        {page === "skills" && <SkillHub />}
        {page === "mentorship" && <Mentorship />}
      </div>
    </div>
  );
}
