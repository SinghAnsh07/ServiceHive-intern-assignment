## 🔧 Installation & Setup

### 1. Clone the repository

```bash
cd "servicehive intern project"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (or use the existing one):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_secret_jwt_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important**: Make sure MongoDB is running on your system!

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs` - Get all open gigs (with optional search)
- `GET /api/gigs/:id` - Get single gig
- `POST /api/gigs` - Create new gig (Protected)
- `GET /api/gigs/my-gigs` - Get user's posted gigs (Protected)
- `PUT /api/gigs/:id` - Update gig (Protected)
- `DELETE /api/gigs/:id` - Delete gig (Protected)

### Bids
- `POST /api/bids` - Submit a bid (Protected)
- `GET /api/bids/:gigId` - Get all bids for a gig (Owner only)
- `GET /api/bids/my-bids` - Get user's submitted bids (Protected)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (Protected)
- `PUT /api/bids/:bidId` - Update bid (Protected)
- `DELETE /api/bids/:bidId` - Delete bid (Protected)


## 📁 Project Structure

```
gigflow/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gigController.js
│   │   └── bidController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── bidRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── store.ts
    │   │   └── hooks.ts
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Gigs/
    │   │   ├── Bids/
    │   │   └── Layout/
    │   ├── context/
    │   │   └── SocketContext.tsx
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── gigs/
    │   │   └── bids/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    └── tailwind.config.js
```