"use client";
import { useEffect, useState } from 'react'
import { signOut } from "next-auth/react";

export function GlowEffect() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return <div id="glow" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>;
}

export function LogoutButton() {
  return <button onClick={() => signOut()} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', zIndex: 1000, position: 'relative' }}>Logout</button>;
}

export function SubscribeButton({ username, productId, isSubscribed }) {
  const handleSubscribe = async () => {
    try {
      const res = await fetch('http://localhost:5173/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, productId })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isSubscribed) return null;

  return (
    <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', borderRadius: '12px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong>You need a subscription to access premium features.</strong>
      <button onClick={handleSubscribe} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Subscribe Now</button>
    </div>
  );
}
