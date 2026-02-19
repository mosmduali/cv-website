# 🚀 CV Portfolio Website

A modern, full-stack personal CV/portfolio website with a built-in admin panel. Built with **Node.js**, **Express**, and **SQLite** — no heavy frameworks, just clean and fast.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)

---

## ✨ Features

- 🎨 **Modern UI** — Dark/light theme toggle, smooth animations, gradient design
- 🔐 **Admin Panel** — Full content management with secure login
- 📁 **File Uploads** — Profile image upload & management
- 🐙 **GitHub Import** — Import projects directly from a GitHub username
- 📌 **Pinned Items** — Pin your best poems, music, or projects to the top
- 🔒 **Security** — AES-256-GCM encryption for sensitive data, bcrypt password hashing
- 📱 **Responsive** — Works on all screen sizes
- 🌐 **Language Switcher** — TR/EN language toggle support
- ⚡ **Typewriter Effect** — Animated typing for your titles
- 🖱️ **Custom Cursor** — Unique worm cursor animation

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | express-session + bcrypt |
| File Upload | Multer |
| Encryption | Node.js crypto (AES-256-GCM) |
| Frontend | Vanilla HTML/CSS/JS |
| Fonts | Google Fonts (Inter, Poppins) |

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/mosmduali/cv-website.git
cd cv-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Edit `.env` and set your own values:

```env
PORT=3000
SESSION_SECRET=your-very-long-random-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 4. Start the server

```bash
npm start
```

Open your browser at **http://localhost:3000**

---

## 🔑 Admin Panel

Go to **http://localhost:3000/admin.html** and log in with the credentials you set in `.env`.

From the admin panel you can manage:
- **Profile** — Name, bio, contact info, profile photo
- **Skills** — Add/edit/delete skills with categories and levels
- **Experience** — Work history with timeline display
- **Education** — Academic background
- **Projects** — Portfolio projects (manual or imported from GitHub)
- **Achievements** — Awards and accomplishments
- **Settings** — Site title, logo, social media links, theme color, account security

---

## 📁 Project Structure

```
cv-website/
├── server.js           # Express server & API routes
├── database.js         # SQLite database setup & queries
├── encryption.js       # AES-256-GCM encryption helpers
├── index.html          # Public portfolio page
├── admin.html          # Admin dashboard
├── script.js           # Frontend JS for portfolio
├── admin-script.js     # Frontend JS for admin panel
├── styles.css          # Portfolio styles
├── admin-styles.css    # Admin panel styles
├── uploads/            # Uploaded images (gitignored)
├── .env.example        # Environment variable template
└── package.json        # Project metadata & dependencies
```

---

## 🔐 Security Notes

- **Never commit `.env`** — it contains your secrets (already in `.gitignore`)
- **Never commit `*.db`** — it may contain personal data (already in `.gitignore`)
- Change the default `SESSION_SECRET` to a long, random string in production
- Sensitive data (email, phone) is encrypted at rest using AES-256-GCM

---

## 🚀 First-Run Behavior

On the very first start, the server automatically:
1. Creates the SQLite database with all required tables
2. Seeds the admin user using credentials from your `.env` file

If you need to reset your database, delete the `cv-data.db` file and restart the server.

---

## 📄 License

ISC — feel free to use and modify for your own portfolio.
