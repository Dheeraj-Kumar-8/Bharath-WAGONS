# Railway Command Centre — Backend

Node.js + Express.js + MongoDB Atlas REST API.

## Setup

```bash
cd backend
npm install
```

## Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Open `.env` and replace `your_mongodb_atlas_connection_string`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/railway-db?retryWrites=true&w=majority
```

## Run

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

## API Endpoints

| Method | Endpoint        | Description              |
|--------|----------------|--------------------------|
| GET    | /api/health     | Server health check      |
| GET    | /api/users      | List all users           |
| GET    | /api/wagons     | List all wagons          |
| GET    | /api/analytics  | List all analytics       |

## Project Structure

```
backend/
├── src/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handler logic
│   ├── middleware/            # Error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── services/             # Business logic (future)
│   ├── utils/                # Shared utilities (future)
│   └── server.js             # App entry point
├── .env                      # Environment variables
└── package.json
```
