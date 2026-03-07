# QIU Campus Lost & Found Management System

A full-stack web application for Quest International University to manage lost and found items on campus.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: SQLite (via better-sqlite3) — no installation required!
- **Security**: Helmet, express-validator, xss, dotenv

## Features

- Submit Lost or Found item reports
- Browse all Lost / Found items with search & filter
- View detailed item information
- Update item status (Active → Claimed / Resolved)
- Delete reports
- Full server-side validation & XSS prevention
- SQL injection prevention via parameterized queries
- Responsive mobile-friendly design

## Getting Started

### Prerequisites
- Node.js v18+ only (no database installation needed!)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Visit `http://localhost:3000`

The SQLite database file (`lostandfound.db`) is created automatically on first run with sample data included.

### Development
```bash
npm run dev   # uses nodemon for auto-reload
```

## Project Structure

```
campus-lost-found/
├── config/
│   └── db.js              # SQLite connection + auto-setup
├── middleware/
│   └── validation.js      # Input validation & sanitization
├── routes/
│   └── items.js           # CRUD API routes
├── public/
│   ├── index.html         # Single-page frontend
│   ├── css/style.css      # Stylesheet
│   └── js/app.js          # Frontend logic
├── lostandfound.db        # SQLite database (auto-created)
├── server.js              # Express server entry point
├── .env.example           # Environment variable template
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (supports ?category, ?status, ?search) |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update full item |
| PATCH | `/api/items/:id/status` | Update status only |
| DELETE | `/api/items/:id` | Delete item |

## Security Measures

1. **Server-side validation** — express-validator on all inputs
2. **XSS Prevention** — xss library sanitizes all string inputs
3. **SQL Injection Prevention** — Parameterized queries via better-sqlite3
4. **Secure Headers** — Helmet.js sets security HTTP headers
5. **Environment Variables** — Config stored in .env

## License
MIT
