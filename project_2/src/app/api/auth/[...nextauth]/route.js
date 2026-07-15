import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://localhost:5173/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
          });
          const user = await res.json();
          if (res.ok && user) {
            return { id: user.id, name: user.username, email: user.username + "@nexus.local", role: user.role };
          }
          return null;
        } catch (e) {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret-production-key-12345",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
