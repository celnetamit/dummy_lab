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
    isSubscribed = subs.some(s => s.productId === 'project_1');
  } catch (e) {}

  return (
    <>
      <nav className="app-nav">
        <div className="logo">✓ TaskMaster Pro</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b' }}>{session.user.email}</span>
          <LogoutButton />
          <a href="http://localhost:5173" className="back-btn">← Back to Hub</a>
        </div>
      </nav>
      
      {!isSubscribed ? (
        <div style={{ maxWidth: '800px', margin: '100px auto', textAlign: 'center' }}>
          <h2>Access Restricted</h2>
          <p style={{ color: '#64748b' }}>You do not have an active subscription to TaskMaster Pro.</p>
          <SubscribeButton username={session.user.name} productId="project_1" isSubscribed={isSubscribed} />
        </div>
      ) : (
        <div className="hero">
          <h1>Organize your work, <br/>finally.</h1>
          <p>The only task manager you'll ever need. Built for speed and focus.</p>
          <div className="mockup">
            <div className="dots">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
            Interactive Dashboard Mockup (Next.js)
          </div>
        </div>
      )}
    </>
  )
}
