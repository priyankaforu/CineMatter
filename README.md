# Cinematter

![GitHub stars](https://img.shields.io/github/stars/priyankaforu/cinematter?style=flat&color=yellow)
![GitHub forks](https://img.shields.io/github/forks/priyankaforu/cinematter?style=flat&color=blue)
![GitHub issues](https://img.shields.io/github/issues/priyankaforu/cinematter?style=flat)
![GitHub last commit](https://img.shields.io/github/last-commit/priyankaforu/cinematter?style=flat&color=green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple)

A full-stack movie review and favourites app for Indian regional language films. Discover movies in your preferred language, rate and review them, build a friends list, and see what your friends are watching — all in real time.

**Live demo:** Coming soon  
**Built by:** [@priyankaforu](https://x.com/priyankaforu)

---

## What it does

- Browse movies by Indian regional language (Telugu, Hindi, Tamil, Kannada, etc.)
- Search movies by name
- Rate and review movies on a 1-10 scale
- Add movies to your favourites list
- Send/accept/reject friend requests
- View your friends' favourite movies and reviews
- Real-time notifications via WebSockets when someone sends or accepts a friend request
- Forgot password flow with OTP via email

---

## Architecture

```
React (Vite, port 5173)  →  Express (port 3000)  →  PostgreSQL
                                    ↕
                                TMDB API
                                    ↕
                              Socket.io (real-time)
```

The frontend is a React SPA. The backend is an Express REST API with raw SQL queries via the `pg` library. Movie metadata (posters, titles, release dates) is fetched on-demand from TMDB — the database only stores user-generated data (ratings, reviews, favourites, friendships). Socket.io handles real-time friend request notifications over a persistent WebSocket connection.

---

## Tech stack

**Backend:** Node.js, Express, PostgreSQL, Socket.io, JWT, bcrypt, Nodemailer  
**Frontend:** React, Vite, Tailwind CSS v4, React Router, Axios, React Toastify, Lucide React  
**External API:** [TMDB](https://www.themoviedb.org/) for movie data  

---

## Database schema

**users** — id, user_name (unique), user_mail (unique), password_hash, preferred_lang, created_at

**ratings** — id, user_id, tmdb_movie_id, review_text, rating, created_at  
→ UNIQUE constraint on (user_id, tmdb_movie_id)

**favourites** — id, user_id, tmdb_movie_id, created_at  
→ UNIQUE constraint on (user_id, tmdb_movie_id)

**friends** — id, sender_id, receiver_id, status (pending/accepted), created_at  
→ UNIQUE constraint on (sender_id, receiver_id)

**otp** — id, user_mail, otp_gen, otp_set, expires_at

**Design decisions:**
- `tmdb_movie_id` is used as a bridge to TMDB data — movie details are never duplicated in the database
- Ratings (AVG, COUNT) are computed on-the-fly, never stored
- The friends table handles bidirectional relationships using CASE WHEN queries

---

## API routes

### Auth (`/api/auth`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/signup` | No | Create account with language preference |
| POST | `/login` | No | Returns JWT token (24h expiry) |
| GET | `/profile` | Yes | Get user profile |

### Movies (`/api/movies`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/?language=te&page=1` | No | Discover movies by language |
| GET | `/search?q=baahubali` | No | Search movies by name |

### Ratings (`/api/ratings`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/:movieId` | No | Movie details + reviews |
| POST | `/` | Yes | Create or overwrite a review |
| DELETE | `/` | Yes | Delete a review |

### Favourites (`/api/favorites`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Yes | Get user's favourites with TMDB data |
| POST | `/` | Yes | Add a favourite |
| DELETE | `/` | Yes | Remove a favourite |

### Friends (`/api/friends`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users` | Yes | All users sorted by review count |
| GET | `/search?q=name` | Yes | Search users by name (ILIKE) |
| POST | `/sendrequest` | Yes | Send friend request |
| GET | `/requests` | Yes | Received pending requests |
| GET | `/sent` | Yes | Sent pending requests |
| GET | `/friendlist` | Yes | All accepted friends |
| PUT | `/:id/accept` | Yes | Accept a friend request |
| DELETE | `/:id` | Yes | Reject/delete friendship |
| DELETE | `/unfriend/:userId` | Yes | Unfriend by user ID |
| GET | `/favorites/:id` | Yes | Get a friend's favourites (friends only) |

### Password (`/api/password`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/forgot` | No | Send OTP to email |
| POST | `/verifyOTP` | No | Verify OTP |
| PUT | `/reset` | No | Reset password (requires verified OTP) |

---

## Getting started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- A [TMDB API](https://developer.themoviedb.org/) account (free)
- A Gmail account with [App Password](https://support.google.com/accounts/answer/185833) for Nodemailer

### 1. Clone the repo

```bash
git clone https://github.com/priyankaforu/cinematter.git
cd cinematter
```

### 2. Set up the database

```bash
psql -U postgres
CREATE DATABASE cinematter;
\c cinematter
```

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR UNIQUE NOT NULL,
    user_mail VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    preferred_lang VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    tmdb_movie_id INT NOT NULL,
    review_text TEXT,
    rating INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tmdb_movie_id)
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tmdb_movie_id)
);

CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE otp (
    id SERIAL PRIMARY KEY,
    user_mail VARCHAR,
    otp_gen VARCHAR,
    otp_set BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP
);
```

### 3. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT = 3000
API_KEY = your_tmdb_api_key
API_TOKEN = your_tmdb_bearer_token
API_ENDPOINT = https://api.themoviedb.org/3/discover/movie
MOVIE_ID_ENDPOINT = https://api.themoviedb.org/3/movie
DB_USER=postgres or (check your default on access level)
DB_HOST=localhost
DB_NAME=cinematter
DB_PORT=5432
JWT_SECRET_KEY=your_jwt_secret_key
NODE_MAILER_PASS= the_gmail_password_but_not_your_personal

```

```bash
npm run dev
```

### 4. Set up the client

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`

---

## Project structure

```
cinematter/
├── server/
│   ├── index.js              # Express + Socket.io setup
│   ├── configs/
│   │   ├── db.js             # PostgreSQL connection pool
│   │   └── nodeMailer.js     # Nodemailer transporter
│   ├── middlewares/
│   │   └── auth.middleware.js # JWT verification
│   └── routes/
│       ├── auth.routes.js
│       ├── movies.routes.js
│       ├── ratings.routes.js
│       ├── fav.routes.js
│       ├── friends.routes.js
│       └── password.routes.js
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ReviewModel.jsx
│   │   │   └── confirmationModel.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Logout.jsx
│   │   │   ├── TimeLine.jsx
│   │   │   ├── friendsPage.jsx
│   │   │   ├── FriendFavorites.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   └── utils/
│   │       ├── languages.json
│   │       ├── getLanguage.js
│   │       ├── friendList.js
│   │       └── socket.js
```

---

## Key design principles

- **No AI-generated code** — every line written by hand with understanding
- **Don't store what you can calculate** — averages computed on-the-fly with AVG()
- **Don't store what another service provides** — TMDB data fetched on demand
- **Defense in depth** — backend validates data, database enforces constraints
- **Token-based auth** — user_id always comes from JWT, never from request body
- **Parameterized queries** — all SQL uses $1, $2 to prevent SQL injection

---

## Built as part of

[30 Projects in Plain JavaScript](https://x.com/priyankaforu) — Project 3  
No AI coding assistance. No frameworks for the sake of frameworks. Understanding every line.
