import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { LogoutButton, SubscribeButton } from "./ClientComponents"

export default async function App() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let isSubscribed = false;
  try {
    const res = await fetch(`http://localhost:5173/api/subscriptions?username=${session.user.name}`, { cache: 'no-store' });
    const subs = await res.json();
    isSubscribed = subs.some(s => s.productId === 'project_2');
  } catch (e) {}

  return (
    <>
      <nav className="app-nav">
        <div className="logo">✧ Artify<span>AI</span></div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#a1a1aa' }}>{session.user.email}</span>
          <LogoutButton />
          <a href="http://localhost:5173" className="back-btn">← Back to Hub</a>
        </div>
      </nav>
      
      {!isSubscribed ? (
        <div style={{ maxWidth: '800px', margin: '100px auto', textAlign: 'center', zIndex: 10, position: 'relative' }}>
          <h2>Access Restricted</h2>
          <p style={{ color: '#a1a1aa' }}>You do not have an active subscription to Artify AI.</p>
          <SubscribeButton username={session.user.name} productId="project_2" isSubscribed={isSubscribed} />
        </div>
      ) : (
        <div className="hero">
          <div className="blob"></div>
          <div className="content">
            <h1>Imagine. <br/>Create. Inspire.</h1>
            <p style={{ fontSize: '1.2rem', color: '#a1a1aa' }}>Transform your words into breathtaking digital art instantly.</p>
            <div className="input-group">
              <input type="text" placeholder="Describe your imagination..." />
              <button>Generate Art</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
