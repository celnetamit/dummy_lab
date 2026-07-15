"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        alert("Registration successful! You can now log in.");
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleRegister} style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
        <h2>Create an Account</h2>
        {error && <p style={{ color: '#fca5a5', fontSize: '0.9rem', margin: 0 }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Choose a Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          style={{ padding: '10px', borderRadius: '5px', border: 'none', color: 'black' }} 
          required
        />
        <input 
          type="password" 
          placeholder="Choose a Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ padding: '10px', borderRadius: '5px', border: 'none', color: 'black' }} 
          required
        />
        <button type="submit" style={{ padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
          Register Now
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
}
