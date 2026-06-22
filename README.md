# 🌍 RoamAI - AI Travel Planner

## Project Overview

RoamAI is a full-stack, multi-user web application that generates highly personalized travel itineraries. By accepting user parameters such as destination, duration, budget tier, and specific interests, the platform leverages a Large Language Model (LLM) agent to construct a comprehensive day-by-day travel plan, complete with an estimated budget and curated hotel suggestions.

## Technology Choices

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Google Gemini API (gemini-2.5-flash)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## Setup Instructions

### Local Setup

1. Clone the repository: `git clone https://github.com/Amarnath201099/roam_ai_travel_planner.git`
2. Open two terminal windows (one for the backend, one for the frontend).

**Backend (`/server`)**

1. `cd server`
2. `npm install`
3. Create a `.env` file with the following variables:
   - `PORT=5000`
   - `MONGO_URI=<your_mongodb_connection_string>`
   - `JWT_SECRET=<your_secure_secret>`
   - `GEMINI_API_KEY=<your_google_gemini_key>`
4. `npm run dev` (or `node index.js`)

**Frontend (`/client`)**

1. `cd client`
2. `npm install`
3. Create a `.env.local` file with:
   - `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
4. `npm run dev`
5. Access the application at `http://localhost:3000`

### Deployed Setup

- **Frontend UI:** [Insert Vercel Link Here]
- **Backend API:** [Insert Render/Railway Link Here]

## Architecture

The system operates on a decoupled client-server model:

- **Client Tier:** A Next.js frontend utilizing standard React client components (`"use client"`). Axios interceptors manage global state and seamlessly inject stateless JWT tokens into the `Authorization` headers of all outbound API requests.
- **Service Tier:** An Express API processes incoming requests. For AI generation, the Express controller formats user input into a strict system prompt and relays it to the Gemini API.
- **Data Tier:** MongoDB stores persistent relational data. The LLM's structured JSON output is parsed by the Express server and mapped directly to a Mongoose `Trip` schema before being returned to the client interface.

## Security

- **Authentication:** Handled via stateless JSON Web Tokens (JWT). Passwords are never stored in plaintext; they are hashed using `bcryptjs` via Mongoose pre-save middleware before database insertion.
- **Authorization:** A custom Express middleware (`protect`) intercepts protected routes, extracts the Bearer token, verifies the signature against the server's secret, and attaches the authenticated user session to the request context.
- **Data Isolation:** Enforced strictly at the controller level. Database queries for fetching or modifying trips specifically validate that the `trip.user` ID matches the currently authenticated `req.user._id`. Users cannot access or modify trip IDs that belong to other accounts.

## AI Design

The application utilizes Google's `gemini-2.5-flash` model.

- **Design Purpose:** The LLM acts as a high-speed data aggregator and formatting agent.
- **Prompt Engineering Strategy:** To ensure system stability, the AI is constrained using a highly specific system instruction and Gemini's native `application/json` response MIME type. This guarantees the LLM returns an exact, deeply nested JSON data contract (arrays of daily activities, categorized budget breakdowns, and hotel arrays) that cleanly maps to the strict Mongoose schema without requiring complex string parsing or regex on the backend.

## Custom Feature: Dynamic Expense Tracker

**What it is:** An interactive budget tracking interface nested inside the generated trip view. It allows users to log real-world expenses (food, flights, activities) directly against the AI's initial budget estimations.

- **Problem Solved:** Travel planners often generate a budget but fail to provide a way to monitor real-time adherence to it. This feature bridges the gap between _planning_ and _execution_.
- **Engineering Judgment:** Instead of just a simple list, it calculates spending velocity in real-time. It features a dynamic progress bar that provides immediate visual feedback, changing to a warning state (amber/red) if the user approaches or breaches the AI's predicted financial ceiling.

## Engineering Decisions

- **Mongoose Schema Design:** The `Trip` schema was heavily nested rather than creating separate relational collections for "Days" or "Activities". Since an itinerary is inextricably bound to a single trip and is retrieved as a single unit, document embedding drastically improves read performance.
- **Light Theme UI:** Opted for a clean, enterprise SaaS-style light theme (off-white backgrounds with dark royal blue accents) over a standard dark mode to ensure maximum readability and accessibility for dense data, such as daily schedules and itemized budgets.

## Limitations

1. **Real-time Pricing:** The AI estimates budgets based on historical training data. It does not hit live airline or hotel APIs, so prices are approximations, not live quotes.
2. **Strict Routing:** Highly obscure or extremely niche local spots might result in AI hallucinations or generic recommendations due to model limitations on hyper-local data.
3. **Session Management:** Token revocation (forcing a logout across all devices) is currently limited due to the stateless nature of JWTs, though an expiration window of 7 days mitigates long-term risk.
