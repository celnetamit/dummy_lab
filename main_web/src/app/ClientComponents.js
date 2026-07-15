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

export function SubscribeButton({ username, productId, subStatus }) {
  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, productId })
      });
      if (res.ok) window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/subscriptions?username=${username}&productId=${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  if (subStatus === 'active') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div className="visit-btn" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', flex: 1, textAlign: 'center' }}>✓ Subscribed (Launch)</div>
        <div onClick={handleUnsubscribe} className="visit-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', cursor: 'pointer', textAlign: 'center' }}>Unsubscribe</div>
      </div>
    );
  }

  if (subStatus === 'pending') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div className="visit-btn" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', flex: 1, textAlign: 'center' }}>⏳ Pending Admin Approval</div>
        <div onClick={handleUnsubscribe} className="visit-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', cursor: 'pointer', textAlign: 'center' }}>Cancel</div>
      </div>
    );
  }

  if (subStatus === 'revoked') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div className="visit-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', flex: 1, textAlign: 'center' }}>❌ Access Revoked by Admin</div>
      </div>
    );
  }

  return (
    <div onClick={handleSubscribe} className="visit-btn" style={{ background: '#3b82f6', marginTop: '1rem', textAlign: 'center', cursor: 'pointer' }}>
      Subscribe Now
    </div>
  );
}
