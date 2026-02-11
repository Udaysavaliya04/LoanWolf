## Loan amortization tracker (MERN)

This project is a full-stack loan amortization tracker built with the **MERN stack** (MongoDB, Express, React, Node).

It lets you:

- Create loans with principal, interest rate, term, and start date.
- Add **extra principal payments** and **interest rate change** events.
- Generate a **detailed amortization schedule** with:
  - Period-by-period opening/closing balance
  - Interest and principal split
  - Extra payments
  - Totals and payoff date.

### Prerequisites

- Node.js (LTS recommended)
- A running MongoDB instance (default URI: `mongodb://127.0.0.1:27017/loan_tracker`)

You can override the MongoDB connection string by setting `MONGO_URI` in your environment for the backend.

### Backend (Express + Mongo)

From the `server` folder:

```bash
cd server
npm install        # already run once
npm run dev        # starts API on http://localhost:5000
```

APIs (base: `/api/loans`):

-'the post request is used in the main calculation of home loan interest'
-'get request enables to get the loan events and the amortization shedule and the main delivery of the post data uses and the main part of the post analysis is to make changes into the proper amount'

-'the calculated amount includes the prepayement methods and the main '
- `POST /api/loans` – create a loan.
- `GET /api/loans` – list loans.
- `GET /api/loans/:id` – get loan + events.
- `POST /api/loans/:id/events` – add extra payment or rate change.
- `GET /api/loans/:id/schedule` – build amortization schedule with events applied.

Calculations are done with monthly compounding and use `decimal.js` to avoid floating-point rounding issues.

### Frontend (React + Vite)

From the `client` folder:

```bash
cd client
npm install        # already run once
npm run dev        # starts app (usually on http://localhost:5173)
```

The Vite dev server is configured to **proxy** `/api` to `http://localhost:5000`, so as long as the backend is running you can use the app without extra config.

### Usage

1. Start MongoDB.
2. In `server`, run `npm run dev`.
3. In `client`, run `npm run dev` and open the shown URL in your browser.
4. Create a loan, select it, add events (extra payments or rate changes), and click **Generate schedule** to view the detailed table and totals.

