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
   - `NODE_ENV`
   - `CLIENT_URLS`
4. `npm run dev` (or `node index.js`)

**Frontend (`/client`)**

1. `cd client`
2. `npm install`
3. Create a `.env.local` file with:
   - `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
4. `npm run dev`
5. Access the application at `http://localhost:3000`

### Deployed Setup

- **Frontend UI:** [Vercel Link](https://roam-ai-travel-planner.vercel.app/)
- **Backend API:** [Render Link](https://roam-ai-travel-planner.onrender.com)

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

## Custom / Creative Features

## 1. Dynamic Expense Tracker

### What it is

An interactive budget tracking interface embedded directly within the generated trip view. Users can log real-world expenses (e.g., food, transportation, accommodation, activities, shopping) against the AI-generated budget estimates throughout the trip.

### Problem Solved

Traditional travel planners generate a budget but provide no mechanism to track actual spending during the journey. This creates a disconnect between planning and execution. The Dynamic Expense Tracker closes that gap by allowing users to monitor spending in real time and stay aligned with their financial goals.

### Engineering Logic

- Users can categorize expenses and compare actual costs against estimated budgets.
- Real-time calculations continuously update remaining budget and category-wise spending.
- Spending velocity analysis predicts whether users are likely to exceed their planned budget based on current expenditure patterns.
- A dynamic progress bar provides immediate visual feedback:
  - **Green:** Within safe spending range.
  - **Amber:** Approaching budget limit.
  - **Red:** Budget exceeded or projected to exceed.

### Engineering Judgment

Rather than functioning as a simple expense log, the tracker actively assists decision-making through predictive budget monitoring. This transforms budgeting from a static planning exercise into a proactive financial management tool.

---

## 2. Version History, Restore & AI Merge Engine

### What it is

A robust itinerary version control system that enables non-destructive editing, instant restoration of previous itinerary states, and AI-powered merging of multiple planning iterations.

### Problem Solved

Trip planning is highly iterative. Users frequently experiment with different schedules, destinations, or activities and often worry about losing earlier ideas. This feature provides a safety net by preserving recent versions, allowing users to restore any previous itinerary state or intelligently combine multiple versions.

### Engineering Logic

#### FIFO History Buffer

- The system maintains a strict FIFO (First-In-First-Out) queue containing the most recent **5 itinerary versions**.
- Every meaningful modification creates a new snapshot of the itinerary state.

#### Restore Mechanism

- Each saved version includes a dedicated **Restore** action.
- Users can instantly revert the itinerary to any previously saved version without affecting other historical snapshots.
- Restoration can be performed at:
  - Entire trip level.
  - Individual day level (e.g., restore Day 2 from an earlier version while keeping the rest of the itinerary unchanged).
- Restored versions are treated as new active states and re-enter the history pipeline for future edits.

#### AI Merge Intelligence

- Users can select two versions or individual day plans and request an AI-generated merge.
- The AI analyzes activities, timings, and dependencies from both versions.
- Conflicting events are resolved while maintaining chronological consistency.
- The merged result becomes a new version in the history stack.

#### State Management

- Historical snapshots remain available throughout the planning phase.
- Once the itinerary is finalized (`isFinalized: true`), the history buffer is flushed to minimize storage overhead and clearly indicate completion of the planning lifecycle.

### Engineering Judgment

The combination of version history, granular restore capabilities, and AI-assisted merging creates a workflow similar to modern source-control systems. This significantly reduces user anxiety during experimentation, encourages exploration of alternative plans, and ensures that valuable itinerary ideas are never permanently lost.

---

## 3. Context-Aware Smart Packing List

### What it is

An intelligent, modular packing assistant that dynamically adapts to the user's destination, weather conditions, travel group, trip duration, and planned activities instead of relying on generic checklists.

### Problem Solved

Traditional packing lists are often cluttered with irrelevant recommendations and fail to account for destination-specific requirements. Travelers frequently forget important items related to weather, activities, or local conditions.

### Engineering Logic

#### Trip Essentials Layer

Core recommendations generated from:

- Destination characteristics.
- Expected weather conditions.
- Trip duration.
- Group size and traveler profile.
- Transportation mode.

Examples:

- Travel documents.
- Chargers and electronics.
- Weather-appropriate clothing.
- Personal essentials.

#### Daily Gear Layer

A day-by-day packing assistant linked directly to itinerary activities.

Examples:

- Hiking day → Trekking shoes, hydration pack.
- Beach day → Swimwear, sunscreen, towel.
- City exploration → Comfortable walking shoes, power bank.
- Photography excursion → Camera gear, spare batteries.

#### Dynamic Updates

- Changes in itinerary automatically update packing recommendations.
- Activity additions or removals trigger recalculation of required items.
- Weather-based adjustments can introduce new recommendations closer to departure.

### Engineering Judgment

By connecting packing recommendations directly to itinerary activities, the system transforms packing into a contextual and personalized experience. This improves practicality, reduces forgotten essentials, and increases overall engagement with the travel planning workflow.

## Engineering Decisions

- **Mongoose Schema Design:** The `Trip` schema was heavily nested rather than creating separate relational collections for "Days" or "Activities". Since an itinerary is inextricably bound to a single trip and is retrieved as a single unit, document embedding drastically improves read performance.
- **Light Theme UI:** Opted for a clean, enterprise SaaS-style light theme (off-white backgrounds with dark royal blue accents) over a standard dark mode to ensure maximum readability and accessibility for dense data, such as daily schedules and itemized budgets.

## Limitations

1. **Real-time Pricing:** The AI estimates budgets based on historical training data. It does not hit live airline or hotel APIs, so prices are approximations, not live quotes.
2. **Strict Routing:** Highly obscure or extremely niche local spots might result in AI hallucinations or generic recommendations due to model limitations on hyper-local data.
3. **Session Management:** Token revocation (forcing a logout across all devices) is currently limited due to the stateless nature of JWTs, though an expiration window of 7 days mitigates long-term risk.

## Future Implementations

### 1. OTP-Based Password Recovery & Verification

**Overview:**
Implement secure OTP-based authentication flows for password resets and sensitive account actions.

**Value to Users:**
Users can recover access to their accounts securely without relying solely on passwords. OTP verification can also be used for email verification during registration and for sensitive account changes.

**Technical Scope:**

- Email OTP generation and validation
- Password reset workflow
- Account verification during signup
- OTP expiration and retry limits
- Secure token storage and validation

---

### 2. AI-Powered Trip Progress Tracker

**Overview:**
Transform generated itineraries into interactive travel companions by allowing users to mark activities as completed, skipped, or postponed during their trip.

**Value to Users:**
Most travel planners stop being useful after itinerary generation. This feature helps users actively track and manage their trip execution.

**Engineering Logic:**

- Day-wise activity completion tracking
- Progress visualization across the trip
- Real-time trip completion percentage
- Activity status management (Completed, Skipped, Pending)

**AI Enhancement:**
After the trip concludes, AI analyzes user behavior patterns and generates:

- Travel style insights
- Activity completion trends
- Budget adherence reports
- Personalized recommendations for future trips

Example:

> "You completed 92% of cultural activities but skipped most nightlife experiences. Future itineraries can prioritize museums, heritage sites, and local experiences."

---

### 3. AI Travel Journal & Memory Generator

**Overview:**
Automatically generate a personalized travel diary based on completed activities, photos, notes, and expenses recorded during the trip.

**Value to Users:**
Travel memories are often scattered across photos and notes. This feature converts trip data into a cohesive story.

**Engineering Logic:**

- Collect completed activities
- Aggregate user notes
- Associate uploaded trip photos
- Generate day-wise summaries

**Output Examples:**

- AI-generated travel journal
- Trip highlights
- Memorable moments recap
- Shareable travel story
