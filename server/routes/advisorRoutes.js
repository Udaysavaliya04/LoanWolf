const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Loan = require('../models/Loan');
const ChatSession = require('../models/ChatSession'); // New model
const { buildSchedule } = require('../services/amortizationService');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

// GET /chat - Retrieve conversation history
router.get('/chat', async (req, res) => {
  try {
    let session = await ChatSession.findOne({ userId: req.user.id });
    if (!session) {
      // Return empty if no session yet
      return res.json({ messages: [] });
    }
    // Return last 50 messages to keep payload light
    res.json({ messages: session.messages.slice(-50) });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// POST /chat - Send a message
router.post('/chat', async (req, res) => {
  try {
    const { message: userMessage, contextData } = req.body;
    if (!userMessage) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user.id;

    // 1. Save User Message to History
    let session = await ChatSession.findOne({ userId });
    if (!session) {
      session = new ChatSession({ userId, messages: [] });
    }
    session.messages.push({ role: 'user', content: userMessage });
    await session.save();

    // 2. Build Advanced Context (The "Brain")
    const loans = await Loan.find({ ownerId: userId });
    let loanContext = "";
    
    // Inject Client Context if available (User is looking at a specific loan)
    if (contextData && contextData.currentLoan) {
       loanContext += `
**ACTIVE VIEW CONTEXT**:
The user is currently viewing the loan: "${contextData.currentLoan.name}".
- **Schedule Summary from UI**: 
  - Total Interest: ₹${contextData.scheduleSummary?.totalInterest?.toLocaleString() || 'N/A'}
  - Payoff Date: ${contextData.scheduleSummary?.payoffDate ? new Date(contextData.scheduleSummary.payoffDate).toLocaleDateString() : 'N/A'}
  - Interest Saved (vs Baseline): ₹${contextData.scheduleComparison?.interestSaved?.toLocaleString() || '0'}
  - Interest Saved (vs Baseline): ₹${contextData.scheduleComparison?.interestSaved?.toLocaleString() || '0'}
- **Recent Events from UI**:
${contextData.events?.map(e => `  - ${new Date(e.date).toLocaleDateString()}: ${e.type === 'EXTRA_PAYMENT' ? 'Extra Payment ₹'+e.amount : 'Rate Change ' + e.newAnnualInterestRate + '%'}`).join('\n') || 'None'}
\n`;
    }

    loanContext += "\n**FULL PORTFOLIO ANALYSIS**:\n";
    let totalPrincipal = 0;
    let totalMonthlyPayment = 0;

    if (loans.length === 0) {
      loanContext += "User has no loans currently.";
    } else {
      for (const loan of loans) {
        // 1. Fetch Events
        const events = await require('../models/LoanEvent').find({ loanId: loan._id }).sort({ date: 1 });
        const eventHistory = events.map(e => 
          `- ${new Date(e.date).toLocaleDateString()}: ${e.type === 'EXTRA_PAYMENT' ? 'Extra Payment' : 'Rate Change'} of ${e.type === 'EXTRA_PAYMENT' ? '₹'+e.amount.toLocaleString() : e.newAnnualInterestRate+'%'}`
        ).join('\n    ');

        // 2. Run Schedule
        const fullData = await buildSchedule(loan._id);
        const schedule = fullData.schedule;
        const currentItem = schedule.find(i => i.tranType === 'Proj');
        const currentBalance = currentItem ? currentItem.openingBalance : 0;
        const nextPaymentDate = currentItem ? new Date(currentItem.toDate).toLocaleDateString() : 'N/A';
        
        const nextInterest = currentItem ? currentItem.interest : 0;
        const nextPrincipal = currentItem ? currentItem.principalComponent : 0;
        
        // 3. Get recent/upcoming schedule (next 3 months)
        const upcoming = schedule
          .filter(i => i.tranType === 'Proj')
          .slice(0, 3)
          .map(i => `   - ${new Date(i.toDate).toLocaleDateString()}: EMI ₹${Math.round(i.totalPayment).toLocaleString()} (Prin: ₹${Math.round(i.principalComponent)}, Int: ₹${Math.round(i.interest)})`)
          .join('\n');

        totalPrincipal += currentBalance;
        totalMonthlyPayment += currentItem ? currentItem.totalPayment : 0;

        loanContext += `
**Loan: ${loan.name}**
  - **Status**: Current Balance ₹${Math.round(currentBalance).toLocaleString()}
  - **Terms**: ${loan.annualInterestRate}% Interest, EMI ~₹${Math.round(currentItem ? currentItem.totalPayment : 0).toLocaleString()}
  - **Event History (User Actions)**:
    ${eventHistory || 'No extra payments or rate changes recorded.'}
  - **Upcoming Schedule**:
${upcoming}
  - **Projected Payoff**: ${fullData.summary.payoffDate ? new Date(fullData.summary.payoffDate).toLocaleDateString() : 'Unknown'}
`;
      }
      loanContext += `\n**Portfolio Summary**:\n- Total Debt: ₹${Math.round(totalPrincipal).toLocaleString()}\n- Total Monthly Commitment: ₹${Math.round(totalMonthlyPayment).toLocaleString()}`;
    }

    // 3. Initialize Gemini
    // Ensure API Key is present
    if (!process.env.GEMINI_API_KEY) {
       throw new Error("Server missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 4. Construct System Prompt
    // We include last few messages for conversational continuity
    const recentHistory = session.messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'WolfAI'}: ${m.content}`).join('\n');

    const systemPrompt = `
      You are **WolfAI**, an elite financial strategist and debt payoff expert.
      Your goal is to help the user become debt-free as fast as possible.
      
      **Persona**:
      - Professional but encouraging.
      - Mathematically precise.
      - You use the "Avalanche Method" (highest interest rate first) as your default strategy unless asked otherwise.
      - You are direct. No fluff.

      **Current Portfolio Context**:
      ${loanContext}

      **Recent Conversation**:
      ${recentHistory}

      **User's Latest Question**: "${userMessage}"

      **Instructions**:
      - Answer the question specifically based on the portfolio data above.
      - If they ask "What if I pay extra?", calculate the impact roughly (e.g., "Paying ₹5,000 extra on [Loan Name] would save you...")
      - Use Markdown for formatting (bold key numbers, lists).
      - Keep response under 200 words unless detailed analysis is requested.
    `;

    // 5. Generate Response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. Save AI Response
    session.messages.push({ role: 'assistant', content: text });
    await session.save();

    res.json({ reply: text });

  } catch (err) {
    console.error('WolfAI Chat Error:', err);
    res.status(500).json({ message: 'Failed to generate advice. Ensure GEMINI_API_KEY is set.' });
  }
});

module.exports = router;
