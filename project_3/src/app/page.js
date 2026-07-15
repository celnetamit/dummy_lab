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
    isSubscribed = subs.some(s => s.productId === 'project_3');
  } catch (e) {}

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">$ FinTrack</div>
        <nav>
          <a href="#" className="menu-item active">Dashboard</a>
          <a href="#" className="menu-item">Transactions</a>
          <a href="#" className="menu-item">Analytics</a>
          <a href="#" className="menu-item">Settings</a>
        </nav>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Overview</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#a7f3d0' }}>{session.user.name}</span>
            <LogoutButton />
            <a href="http://localhost:5173" className="back-btn">Exit to Hub</a>
          </div>
        </div>
        
        {!isSubscribed ? (
          <div style={{ maxWidth: '800px', margin: '100px auto', textAlign: 'center' }}>
            <h2>Access Restricted</h2>
            <p style={{ color: '#a7f3d0' }}>You do not have an active subscription to FinTrack.</p>
            <SubscribeButton username={session.user.name} productId="project_3" isSubscribed={isSubscribed} />
          </div>
        ) : (
          <div>
            <div className="balance-card">
              <h2>Total Balance</h2>
              <div className="amount">$24,562.00</div>
              <div>+12.5% from last month</div>
            </div>
            <div className="stats">
              <div className="stat-box">
                <h3>Income</h3>
                <p style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 700, marginTop: '10px' }}>$8,240</p>
              </div>
              <div className="stat-box">
                <h3>Expenses</h3>
                <p style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 700, marginTop: '10px' }}>$3,410</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
