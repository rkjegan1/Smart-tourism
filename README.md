# Smart Tourism App — Intelligent Tourism Recommendation System

Clean, minimal, extensible backend (priority) + a bare-bones React frontend
used only to test the API. Built to be enhanced later in Google Antigravity.

## Folder Structure

```
smart-tourism-app/
├── backend/
│   ├── config/
│   │   └── db.js                  MongoDB connection
│   ├── models/
│   │   ├── User.js                name, email, hashed password, role
│   │   ├── Place.js                name, country, city, category, tags, budgetLevel, bestFor, rating
│   │   └── Questionnaire.js       stores each recommendation request + result
│   ├── controllers/
│   │   ├── authController.js      register / login / me
│   │   ├── placeController.js     get all / get one / search
│   │   ├── recommendationController.js   decision-tree recommendation logic
│   │   └── adminController.js     add / edit / delete places
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── placeRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js      JWT "protect" + "adminOnly"
│   │   └── errorMiddleware.js
│   ├── seed/
│   │   └── sampleData.js          seeds 2 users + 8 places
│   ├── server.js                  app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api.js                 fetch wrapper for the backend API
    │   ├── App.jsx                minimal UI: login/register, search, recommend
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

## Backend

### Models

- **User**: `name`, `email`, `password` (bcrypt-hashed), `role` (`user` | `admin`)
- **Place**: `name`, `description`, `country`, `city`, `category`
  (`nature` | `culture` | `adventure` | `relaxation` | `nightlife` | `food`),
  `tags`, `budgetLevel` (`low` | `medium` | `high`), `bestFor`
  (`solo` | `couple` | `family` | `friends`), `imageUrl`, `rating`, `location {lat, lng}`
- **Questionnaire**: `user` (optional), `answers { interest, budget, groupType, duration }`,
  `recommendedPlaces[]`

### API Endpoints

| Method | Endpoint                  | Auth        | Description                          |
|--------|----------------------------|-------------|---------------------------------------|
| POST   | `/api/auth/register`       | Public      | Register a new user                   |
| POST   | `/api/auth/login`          | Public      | Login, returns JWT                    |
| GET    | `/api/auth/me`             | User        | Get current user profile              |
| GET    | `/api/places`               | Public      | List all places (paginated)           |
| GET    | `/api/places/search`        | Public      | Search by `?q=&country=&city=`        |
| GET    | `/api/places/:id`           | Public      | Get one place                         |
| POST   | `/api/recommend`            | Public      | Decision-tree recommendation          |
| POST   | `/api/admin/places`         | Admin       | Add a place                           |
| PUT    | `/api/admin/places/:id`     | Admin       | Edit a place                          |
| DELETE | `/api/admin/places/:id`     | Admin       | Delete a place                        |

Send the JWT as `Authorization: Bearer <token>` for protected routes.

### Recommendation logic (simple decision tree)

`POST /api/recommend` body: `{ "interest": "nature", "budget": "low", "groupType": "solo", "duration": "short" }`

1. Try a strict match: `category = interest` AND `budgetLevel = budget` AND `bestFor` includes `groupType`.
2. If nothing found, relax `budget` (match `interest` + `groupType` only).
3. If still nothing, relax further and match on `interest` only.
4. The request + result is saved to `Questionnaire` for history/analytics.

This is intentionally simple (a chain of if/fallback filters) so it's easy to
extend into a real tree, weighted scoring, or a proper ML model later.

## Run Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # optional: loads 2 sample users + 8 sample places
npm run dev                 # starts on http://localhost:5000
```

To import real destinations and images, add `GEOAPIFY_API_KEY` and
`UNSPLASH_ACCESS_KEY` to `backend/.env`, then run:

```bash
npm run import:places
```

The import upserts a curated set of places from six cities, so it is safe to run again.

Seeded accounts (after `npm run seed`):
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # edit VITE_API_URL if backend isn't on :5000
npm install
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173` — you can register/login, search seeded places,
and run the recommendation questionnaire against the live backend.

## Extending later (Antigravity)

The frontend is intentionally bare (no styling, no state library, no routing)
so you can safely replace `App.jsx` / add pages without fighting existing UI
decisions. The backend is modular (routes → controllers → models) so adding
new fields, endpoints, or swapping the recommendation logic for a real
ML/AI model later only touches `recommendationController.js` and `Place.js`.
