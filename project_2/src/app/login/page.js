"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", { username, password, redirect: false });
    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("Invalid credentials! Use admin / password");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <h2>Artify Studio Login</h2>
        <input type="text" placeholder="Username (artist)" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', color: 'black' }} />
        <input type="password" placeholder="Password (artify)" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', color: 'black' }} />
        <button type="submit" style={{ padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
}
