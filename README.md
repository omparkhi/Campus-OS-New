# 🎓 CampusOS — Smart Campus Administration Portal
> ICI Ideathon 2026 | PBCE Nagpur | Problem Statement #4 | Team: CodeCrew

Real-time transparency for certificate, ID card & TC requests.

---

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
# Root
npm install

# Install all (server + client)
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment
```bash
# Copy .env template
cp server/.env.example server/.env

# Fill in server/.env:
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campusos
JWT_SECRET=campusos_super_secret_key_2026
GEMINI_API_KEY=your_key_from_aistudio.google.com   # Optional — fallback mode works without it
CLIENT_URL=http://localhost:3000
PORT=5000
```

### 3. Seed DB & Start
```bash
# Seed database (run once)
cd server && npm run seed

# Start both server + client
cd .. && npm start
```

App runs at: **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@pbce.ac.in         | admin123    |
| Student | student1@pbce.ac.in      | student123  |
| Student | student2@pbce.ac.in      | student123  |
| ...     | student10@pbce.ac.in     | student123  |

> Or use the **Demo buttons** on the login page!

---

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, React Router v6, Recharts      |
| Styling    | Custom CSS with CSS Variables (no UI lib)|
| Backend    | Node.js, Express.js                      |
| Real-time  | Socket.io (WebSocket)                    |
| Database   | MongoDB Atlas + Mongoose ODM             |
| Auth       | JWT + bcrypt + RBAC middleware           |
| AI Chatbot | Google Gemini 1.5 Flash API              |

---

## 📁 Project Structure

```
campusos/
├── server/                    # Backend
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── roleCheck.js       # RBAC: student | admin
│   ├── models/
│   │   ├── User.js
│   │   ├── Request.js         # Core — statusHistory array
│   │   ├── Notification.js
│   │   └── CampusConfig.js    # AI knowledge base
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── socket/socketHandler.js # Real-time events
│   ├── seed.js                # Demo data
│   └── index.js               # Entry point
│
└── client/src/
    ├── components/
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx
    │   ├── StatusBadge.jsx    # Color-coded live badges
    │   ├── StatusTimeline.jsx # Full request history
    │   ├── RequestCard.jsx
    │   ├── NotificationBell.jsx
    │   └── ChatWidget.jsx     # Gemini AI chat
    ├── pages/
    │   ├── student/           # Dashboard, NewRequest, MyRequests, Detail, History
    │   └── admin/             # Dashboard, RequestQueue, Detail, Students, Analytics, Config
    ├── context/AuthContext.jsx
    ├── hooks/useSocket.js     # Socket.io singleton
    └── utils/constants.js
```

---

## ⚡ The Real-Time Demo (PS4 Core Feature)

**Open two browser tabs:**
1. Tab 1: Login as `student1@pbce.ac.in` → go to a request detail page
2. Tab 2: Login as `admin@pbce.ac.in` → manage the same request → click "Update Status"

**Watch Tab 1 update LIVE with no refresh** — this is Socket.io in action.

```
Admin clicks Update → PATCH /api/requests/:id/status
→ Server saves to MongoDB
→ Server emits: request:updated → room 'student:456'
→ Student tab receives event
→ Status badge changes color LIVE
→ Toast notification appears
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint         | Access | Description         |
|--------|-----------------|--------|---------------------|
| POST   | /api/auth/register | Public | Register new user   |
| POST   | /api/auth/login    | Public | Login → JWT token   |
| GET    | /api/auth/me       | Any    | Get current user    |

### Requests (Core PS4)
| Method | Endpoint                    | Access  | Description                        |
|--------|-----------------------------|---------|------------------------------------|
| POST   | /api/requests               | Student | Submit new request                 |
| GET    | /api/requests/my            | Student | Get my requests                    |
| GET    | /api/requests               | Admin   | Get ALL requests (filterable)      |
| GET    | /api/requests/:id           | Both    | Get single request + full history  |
| PATCH  | /api/requests/:id/status    | Admin   | Update status → **triggers Socket.io** |
| DELETE | /api/requests/:id           | Admin   | Delete request                     |

### Notifications
| Method | Endpoint                        | Access  |
|--------|---------------------------------|---------|
| GET    | /api/notifications              | Student |
| PATCH  | /api/notifications/:id/read     | Student |
| PATCH  | /api/notifications/read-all     | Student |

### AI Chat
| Method | Endpoint         | Access  | Description               |
|--------|-----------------|---------|---------------------------|
| POST   | /api/chat        | Student | Send message to Gemini    |
| GET    | /api/chat/config | Any     | Get campus config         |
| PUT    | /api/chat/config | Admin   | Update AI knowledge base  |

### Analytics (Admin Only)
| Method | Endpoint                  |
|--------|---------------------------|
| GET    | /api/analytics/overview   |
| GET    | /api/analytics/by-type    |

---

## 🤖 Gemini AI Setup (Optional)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create API key → paste into `server/.env` as `GEMINI_API_KEY`
3. Without a key, CampusBot runs in **demo mode** with intelligent rule-based responses

---

## 🏆 Winning Features

- ✅ **Real-time Socket.io** — status change → student sees it instantly, zero polling
- ✅ **RBAC** — student JWTs cannot hit admin endpoints (403)
- ✅ **Full Status Timeline** — every transition logged with timestamp + admin remark
- ✅ **AI Chatbot** — Gemini-powered with admin-controlled knowledge base
- ✅ **No-code KB update** — admin edits processing times/docs from UI, bot updates instantly
- ✅ **20 seeded requests** — across all 6 statuses, ready for live demo
- ✅ **Recharts Analytics** — 7-day trend, status pie, type bar chart

---

*CampusOS · Team CodeCrew · ICI Ideathon 2026 · PBCE Nagpur · PS #4*
