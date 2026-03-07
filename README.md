# Campus Lost & Found Management System

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MySQL (via mysql2)
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
- Node.js v18+
- MySQL v8.0+

### Installation

```bash
# 1. Set up the database
# Open MySQL Workbench or Command Prompt and run:
# mysql -u root -p < database.sql

# 2. Create your .env file
cp .env.example .env
# Then open .env and fill in your MySQL credentials

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

Visit `http://localhost:3000`

### Development
```bash
npm run dev   # uses nodemon for auto-reload
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lostandfound_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

## Project Structure

```
campus-lost-found/
├── config/
│   └── db.js              # MySQL connection pool
├── middleware/
│   └── validation.js      # Input validation & sanitization
├── routes/
│   └── items.js           # CRUD API routes
├── public/
│   ├── index.html         # Home page
│   ├── lost.html          # Lost items page
│   ├── found.html         # Found items page
│   ├── report.html        # Submit/Edit report page
│   ├── css/style.css      # Stylesheet
│   └── js/               # Frontend JavaScript
├── database.sql           # MySQL schema & seed data
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
3. **SQL Injection Prevention** — Parameterized queries via mysql2
4. **Secure Headers** — Helmet.js sets security HTTP headers
5. **Environment Variables** — MySQL credentials stored in .env file
