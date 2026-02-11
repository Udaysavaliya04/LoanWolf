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


### Backend (Express + Mongo)

From the `server` folder:

```bash
cd server
npm install        # already run once
npm run dev        # starts API on http://localhost:5000
```

APIs (base: `/api/loans`):

- `POST /api/loans` – create a loan.
- `GET /api/loans` – list loans.
- `GET /api/loans/:id` – get loan + events.
- `POST /api/loans/:id/events` – add extra payment or rate change.
- `GET /api/loans/:id/schedule` – build amortization schedule with events applied.

### Frontend (React + Vite)

From the `client` folder:

```bash
cd client
npm install        # already run once
npm run dev        # starts app (usually on http://localhost:5173)
```
