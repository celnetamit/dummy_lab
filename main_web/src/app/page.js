import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { GlowEffect, LogoutButton, SubscribeButton } from "./ClientComponents"
import { prisma } from "@/lib/prisma"

export default async function HubPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === 'admin';
  
  let userSubs = [];
  let allSubs = [];
  if (!isAdmin) {
    userSubs = await prisma.subscription.findMany({
      where: { username: session.user.name }
    });
  } else {
    allSubs = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  const getSubStatus = (productId) => {
    const sub = userSubs.find(s => s.productId === productId);
    return sub ? sub.status : null; // 'active', 'pending', 'revoked', or null
  };

  const c1Status = getSubStatus('project_1');
  const c2Status = getSubStatus('project_2');
  const c3Status = getSubStatus('project_3');

  return (
    <>
      <GlowEffect />
      <nav className="navbar">
        <div className="nav-brand">STM Journals</div>
        <div className="nav-controls">
          <div className="nav-user">
            <span className="nav-name">{session.user.name}</span>
            <span className="nav-role">{session.user.role === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <LogoutButton />
        </div>
      </nav>
      
      {isAdmin ? (
        // ADMIN DASHBOARD
        <>
          <header className="hub-header">
            <h1 style={{ background: 'linear-gradient(to right, #ef4444, #f97316)', WebkitBackgroundClip: 'text' }}>Admin Control Center</h1>
            <p className="subtitle">Verify and manage course subscriptions across the platform.</p>
          </header>
          <div className="hub-container" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
            <div className="product-card" style={{ borderColor: '#ef4444' }}>
              <div className="product-icon" style={{ color: '#ef4444' }}>👥</div>
              <h2 className="product-title">Student Subscriptions</h2>
              <p className="product-desc">Review pending requests, grant access tokens, or revoke access instantly.</p>
              
              <div style={{ marginTop: '2rem' }}>
                {allSubs.length === 0 ? <p>No subscriptions yet.</p> : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #333' }}>
                        <th style={{ padding: '8px' }}>User</th>
                        <th style={{ padding: '8px' }}>Course</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubs.map(sub => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '8px' }}>{sub.username}</td>
                          <td style={{ padding: '8px' }}>{sub.productId}</td>
                          <td style={{ padding: '8px', color: sub.status === 'active' ? '#10b981' : sub.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                            {sub.status.toUpperCase()}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <form action={async () => {
                              "use server";
                              await fetch(`http://localhost:5173/api/subscriptions`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: sub.id, status: sub.status === 'active' ? 'revoked' : 'active' })
                              })
                              redirect('/'); // refresh
                            }}>
                              <button type="submit" style={{ padding: '4px 8px', background: sub.status === 'active' ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {sub.status === 'active' ? 'Revoke Access' : 'Verify & Grant'}
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // USER DASHBOARD
        <>
          <header className="hub-header">
            <h1>Course Catalog</h1>
            <p className="subtitle">Welcome {session.user.name}. Browse and subscribe to our premium courses.</p>
          </header>
          <div className="hub-container">
            {/* COURSE 1 */}
            <div className="product-card card-1" style={{ opacity: c1Status === 'active' ? 1 : 0.8 }}>
              <div className="product-icon">✓</div>
              <h2 className="product-title">Course: Master Productivity</h2>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>🔗 localhost:5174</div>
              <p className="product-desc">Advanced task management logic and AI-driven prioritization architecture.</p>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                <p><strong>Timeline:</strong> 4 Weeks</p>
                <p><strong>Benefits:</strong> Learn advanced workflow automation and team synchronization.</p>
              </div>
              <SubscribeButton username={session.user.name} productId="project_1" subStatus={c1Status} />
              {c1Status === 'active' && <a href="http://localhost:5174" style={{ display: 'block', marginTop: '10px', color: '#3b82f6', textDecoration: 'underline', textAlign: 'center' }}>Go to Course</a>}
            </div>
            
            {/* COURSE 2 */}
            <div className="product-card card-2" style={{ opacity: c2Status === 'active' ? 1 : 0.8 }}>
              <div className="product-icon">✧</div>
              <h2 className="product-title">Course: AI Art Generation</h2>
              <div style={{ fontSize: '0.8rem', color: '#8b5cf6', marginBottom: '1rem', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>🔗 localhost:5175</div>
              <p className="product-desc">Next-generation neural image generation and prompt engineering.</p>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                <p><strong>Timeline:</strong> 6 Weeks</p>
                <p><strong>Benefits:</strong> Master Stable Diffusion, GANs, and generative prompt tuning.</p>
              </div>
              <SubscribeButton username={session.user.name} productId="project_2" subStatus={c2Status} />
              {c2Status === 'active' && <a href="http://localhost:5175" style={{ display: 'block', marginTop: '10px', color: '#8b5cf6', textDecoration: 'underline', textAlign: 'center' }}>Go to Course</a>}
            </div>

            {/* COURSE 3 */}
            <div className="product-card card-3" style={{ opacity: c3Status === 'active' ? 1 : 0.8 }}>
              <div className="product-icon">$</div>
              <h2 className="product-title">Course: Financial Engineering</h2>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>🔗 localhost:5176</div>
              <p className="product-desc">Intelligent personal finance tracking and algorithmic wealth generation.</p>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                <p><strong>Timeline:</strong> 8 Weeks</p>
                <p><strong>Benefits:</strong> Build automated trading bots and predictive market models.</p>
              </div>
              <SubscribeButton username={session.user.name} productId="project_3" subStatus={c3Status} />
              {c3Status === 'active' && <a href="http://localhost:5176" style={{ display: 'block', marginTop: '10px', color: '#10b981', textDecoration: 'underline', textAlign: 'center' }}>Go to Course</a>}
            </div>
          </div>
        </>
      )}
    </>
  )
}
