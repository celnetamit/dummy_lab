# Nexus Central - Platform Architecture Memo

This document serves as a reference for the current multi-app architecture, security implementations, and centralized database structure to aid in future tasks and scalability.

## 1. Network Topology & Routing
The platform consists of four distinct Next.js applications running simultaneously on localized ports:
* **Main Hub (`main_web`)**: `http://localhost:5173` - Serves as the central administration, identity provider, and subscription manager.
* **TaskMaster Pro (`project_1`)**: `http://localhost:5174` - Premium Product 1
* **Artify AI (`project_2`)**: `http://localhost:5175` - Premium Product 2
* **FinTrack (`project_3`)**: `http://localhost:5176` - Premium Product 3

## 2. Centralized Database (Prisma)
The single source of truth for the entire ecosystem is the SQLite database (`dev.db`) located within the `main_web` repository.
* **`User` Model**: Stores universal credentials (`username`, `password` hashed via `bcryptjs`, and `role`).
* **`Subscription` Model**: Maps a `username` to a specific `productId` (e.g., `"project_1"`), allowing users to unlock specific apps.
* **`DataRecord` Model**: A generic CRUD entity used for testing basic API operations.

## 3. Centralized Identity & Authentication
We eliminated hardcoded, decentralized credentials across the product apps to ensure true platform cohesion.
* **The Identity Provider (IdP)**: `main_web` hosts `/api/auth/verify`, which accepts raw credentials, securely verifies them against Prisma, and returns a verified user object.
* **NextAuth Consumers**: The three product apps (`project_1`, `project_2`, `project_3`) have their `authorize` callbacks configured to dispatch a `POST` request to the Hub's verification endpoint. The product apps handle their own JWT session state, but *only* issue tokens if the Hub authenticates the request.

## 4. Edge-Level Route Protection
To prevent users from navigating directly to sensitive URLs (e.g., `http://localhost:5174/dashboard`), we implemented Next.js Edge Middleware.
* **`middleware.js`**: Exists at the root of every product application. It intercepts routing logic before the page is rendered. If a valid NextAuth JWT token is missing, the user is instantly redirected to the `/login` portal.

## 5. Strict Cross-Origin Security (CORS)
To prevent rogue applications or internal spoofing, strict CORS policies are enforced.
* **Dynamic Origin Verification**: The Hub's APIs (`/api/subscriptions`) dynamically parse the `Origin` header. They will *only* append `Access-Control-Allow-Origin` if the request originates from `5173`, `5174`, `5175`, or `5176`. 
* **Product Isolation**: Because the product apps do not define any CORS allowance headers by default, modern browsers physically prevent `project_1` from communicating with `project_2` or `project_3`.

## 6. Server-Side Authorization (Subscription Blackout)
Visual obfuscation (like CSS `opacity`) is insecure because the React DOM is still transmitted.
* **Implementation**: We implemented a Server-Side Rendering (SSR) blackout in the `page.js` files of the product apps.
* **Behavior**: If `isSubscribed` is false, the server aborts the rendering of the application's core UI and *only* ships the HTML for the "Access Restricted - Subscribe Now" popup. This guarantees zero data leakage for unauthorized users. Admins (`username === 'admin'`) automatically bypass this check.

## Future Development Notes
* If a new project is created (`project_4`), ensure it is added to the `allowedOrigins` array in `main_web/src/app/api/subscriptions/route.js`.
* All Prisma imports should utilize the absolute alias `@/lib/prisma` to prevent path-depth build errors.
