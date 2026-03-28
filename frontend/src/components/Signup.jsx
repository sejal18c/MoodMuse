import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async () => {
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const res = await fetch("http://localhost:8000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.detail);

    alert("Signup successful! Please login.");
  };

  return (
    <div className="auth-box">
      <h2>Create Account</h2>
      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/>
      {error && <p className="error">{error}</p>}
      <button onClick={submit}>Sign Up</button>
    </div>
  );
}
