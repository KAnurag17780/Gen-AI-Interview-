# 🤖 Interview Master — AI-Powered Interview Preparation Platform

A full-stack web application that leverages **Google Gemini AI** to generate personalised interview preparation reports. Upload your resume, describe yourself and the target role, and receive AI-generated technical & behavioural questions, skill-gap analysis, a day-wise preparation plan, and even a tailored resume PDF — all in one place.

🔗 **Live Demo:** [https://interview-fe-ten.vercel.app](https://interview-fe-ten.vercel.app?_vercel_share=4ccnrYcTaeAkHuJdBIe2sX8cpLhPIQiu)

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Interview Report** | Generates a match score, technical questions, behavioural questions, skill gaps and a preparation plan using Gemini AI |
| **Resume PDF Generation** | Creates an ATS-friendly, AI-tailored resume PDF from your existing resume and target job description |
| **Authentication** | Full register / login / logout flow with JWT stored in HTTP-only cookies |
| **Token Blacklisting** | Revoked tokens are persisted in MongoDB so logged-out sessions cannot be reused |
| **Protected Routes** | Both frontend routes and backend API endpoints are guarded by auth middleware |
| **Interview History** | View all your past interview reports on the Home dashboard, sorted by most recent |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Dev server & build tool |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client (with cookie credentials) |
| **SCSS / Sass** | Styling |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express 5** | Web framework |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JSON Web Tokens (JWT)** | Authentication |
| **bcryptjs** | Password hashing |
| **cookie-parser** | Reading HTTP-only auth cookies |
| **Multer** | Multipart file upload (resume PDF) |
| **pdf-parse** | Extracting text from uploaded PDF resumes |
| **Zod** | Schema validation for AI responses |
| **@google/genai** | Google Gemini AI SDK |
| **Puppeteer Core** | Generating resume PDFs from AI-produced HTML |

---

## 📁 Project Structure

```
Gen AI/
├── Backend/
│   ├── server.js                        # Entry point — connects to DB & starts Express
│   ├── src/
│   │   ├── app.js                       # Express app setup (CORS, middleware, routes)
│   │   ├── config/
│   │   │   └── database.js              # Mongoose connection helper
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Register, login, logout, get-me
│   │   │   └── interview.controller.js  # Generate report, get report(s), resume PDF
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # JWT verification & blacklist check
│   │   │   └── file.middleware.js        # Multer upload config
│   │   ├── models/
│   │   │   ├── user.model.js            # User schema (username, email, password)
│   │   │   ├── interviewReport.model.js # Full interview report schema
│   │   │   └── blacklist.modle.js       # Token blacklist schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js           # /api/auth/*
│   │   │   └── interview.routes.js      # /api/interview/*
│   │   └── services/
│   │       └── ai.service.js            # Gemini AI integration & PDF generation
│   ├── .env                             # Environment variables (see below)
│   └── package.json
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx                     # React DOM entry
    │   ├── App.jsx                      # Root component with providers
    │   ├── app.routes.jsx               # Route definitions
    │   ├── style.scss                   # Global styles
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── pages/               # Login & Register pages
    │   │   │   ├── components/          # Protected route wrapper
    │   │   │   ├── hooks/               # Auth custom hooks
    │   │   │   ├── services/            # Auth API calls
    │   │   │   └── auth.context.jsx     # Auth context provider
    │   │   └── interview/
    │   │       ├── pages/               # Home (dashboard) & Interview pages
    │   │       ├── hooks/               # Interview custom hooks
    │   │       ├── services/            # Interview API calls
    │   │       ├── style/               # Interview-specific styles
    │   │       └── interview.context.jsx
    │   └── styles/                      # Shared stylesheets
    └── package.json
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login with email & password |
| `GET` | `/logout` | Public | Clear auth cookie & blacklist token |
| `GET` | `/get-me` | Private | Get current logged-in user details |

### Interview — `/api/interview`

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/` | Private | Upload resume + info → AI-generated interview report |
| `GET` | `/` | Private | Get all interview reports for the logged-in user |
| `GET` | `/report/:interviewId` | Private | Get a specific interview report by ID |
| `POST` | `/resume/pdf/:interviewReportId` | Private | Generate an AI-tailored resume PDF |

---

## ⚙️ Prerequisites

- **Node.js** (v18 or above recommended)
- **npm** (comes with Node.js)
- **MongoDB** — a running instance or a MongoDB Atlas connection string
- **Google Gemini API Key** — obtain one from [Google AI Studio](https://aistudio.google.com/apikey)

---

## 🚀 Getting Started (Localhost)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Gen-AI
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

> **Tip:** Generate a strong `JWT_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Start the development server:

```bash
npm run dev
```

The backend will start on **`http://localhost:3000`**.

### 3. Frontend Setup

Open a new terminal:

```bash
cd Frontend
npm install
```

_(Optional)_ If your backend runs on a port other than `3000`, create a `.env` file in `Frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

Start the Vite dev server:

```bash
npm run dev
```

The frontend will start on **`http://localhost:5173`** (default Vite port).

### 4. Use the App

1. Open `http://localhost:5173` in your browser.
2. **Register** a new account or **Login** with existing credentials.
3. On the **Home** dashboard, create a new interview report by uploading your resume PDF, entering a self-description and job description.
4. View your AI-generated interview report — match score, questions, skill gaps, and prep plan.
5. Optionally, generate a tailored **Resume PDF** from any report.

---

## 🗄️ Database Models

### User
| Field | Type | Constraints |
|---|---|---|
| `username` | String | Required, Unique |
| `email` | String | Required, Unique |
| `password` | String | Required (bcrypt hashed) |

### Interview Report
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId → Users | Owner of the report |
| `resume` | String | Extracted resume text |
| `selfDescription` | String | User's self-description |
| `jobDescription` | String | Target job description |
| `title` | String | AI-inferred job title |
| `matchScore` | Number (0–100) | Profile-to-job match score |
| `technicalQuestions` | Array | Questions with intention & answer guidance |
| `behavioralQuestions` | Array | Questions with intention & answer guidance |
| `skillGaps` | Array | Skills with severity (low / medium / high) |
| `preparationPlan` | Array | Day-wise plan with focus area & tasks |

### Token Blacklist
| Field | Type | Description |
|---|---|---|
| `token` | String | Revoked JWT token |

---

## 🧠 How the AI Integration Works

1. The user uploads a **resume PDF** along with a **self-description** and **job description**.
2. The backend extracts text from the PDF using `pdf-parse`.
3. A structured prompt is sent to **Google Gemini** (`gemini-3-flash-preview`) with a Zod-derived JSON schema to enforce output structure.
4. The AI response is parsed, normalised, and persisted to MongoDB.
5. For **resume PDF generation**, a separate prompt asks Gemini to produce ATS-optimised HTML, which is then converted to PDF via Puppeteer.
