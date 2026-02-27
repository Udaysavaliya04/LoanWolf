const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const { buildFullAdvisorContext } = require('../services/advisorContextService');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/chat', async (req, res) => {
  try {
    let session = await ChatSession.findOne({ userId: req.user.id });
    if (!session) {
      return res.json({ messages: [] });
    }
    res.json({ messages: session.messages.slice(-50) });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message: userMessage, contextData } = req.body;
    if (!userMessage) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user.id;

    let session = await ChatSession.findOne({ userId });
    if (!session) {
      session = new ChatSession({ userId, messages: [] });
    }
    session.messages.push({ role: 'user', content: userMessage });
    await session.save();

    const activeLoanId = contextData?.currentLoan?._id || contextData?.currentLoanId || null;
    const { context: fullContext } = await buildFullAdvisorContext(userId, {
      activeLoanId,
      clientContextData: contextData || null,
    });

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Server missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const recentHistory = session.messages
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'User' : 'WolfAI'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are **WolfAI**, an elite financial strategist and debt payoff expert. You have access to the user's complete portfolio: every loan, full amortization schedules (period-by-period), all extra payments and rate changes, and dashboard metrics. Use this data to give precise, actionable advice.

**Persona**
- Professional, encouraging, and mathematically precise.
- Default strategy: **Avalanche method** (highest interest rate first) unless the user asks otherwise.
- Be direct. No fluff. Use exact numbers from the context when possible.

**Data you have**
The following block contains the user's full portfolio: loan inputs, events, schedule summaries, and the complete amortization table (every month) for each loan. Use it to answer questions accurately.

\`\`\`
${fullContext}
\`\`\`

**Recent conversation**
${recentHistory}

**User's latest message**
"${userMessage}"

**Instructions**
- Answer using the portfolio data above. Reference specific loans by name and exact figures (₹ amounts, dates, months) when relevant.
- For "what if I pay extra?" questions: use the schedule math. E.g. "Paying ₹X extra on [Loan Name] would reduce interest by approximately ₹Y and payoff by Z months earlier."
- For "which loan first?": use Avalanche (highest rate first); cite current balance and rate from the data.
- Use Markdown: **bold** key numbers, lists, and dates.
- Keep responses under 250 words unless the user asks for a detailed breakdown.
- If the user has no loans, encourage them to add one and explain how you can help once they do.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    session.messages.push({ role: 'assistant', content: text });
    await session.save();

    res.json({ reply: text });
  } catch (err) {
    console.error('WolfAI Chat Error:', err);
    res.status(500).json({
      message: 'Failed to generate advice. Ensure GEMINI_API_KEY is set.',
    });
  }
});

module.exports = router;
