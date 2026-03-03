const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const { buildFullAdvisorContext } = require('../services/advisorContextService');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

function buildModelCandidates() {
  const preferred = process.env.GEMINI_MODEL;
  const defaults = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  return Array.from(new Set([preferred, ...defaults].filter(Boolean)));
}

function classifyGeminiError(err) {
  const message = String(err?.message || '');
  const status = err?.status || err?.code || err?.response?.status || null;
  const lower = message.toLowerCase();

  if (status === 429 || lower.includes('quota') || lower.includes('rate limit')) {
    return { type: 'quota', statusCode: 429 };
  }
  if (
    status === 400 &&
    (lower.includes('token') ||
      lower.includes('context') ||
      lower.includes('input too long') ||
      lower.includes('request too large'))
  ) {
    return { type: 'context_too_large', statusCode: 413 };
  }
  if (
    status === 404 ||
    lower.includes('model') && (lower.includes('not found') || lower.includes('unsupported'))
  ) {
    return { type: 'model_unavailable', statusCode: 503 };
  }
  return { type: 'unknown', statusCode: 502 };
}

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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'AI service is not configured on server (missing GEMINI_API_KEY).',
        code: 'AI_NOT_CONFIGURED',
      });
    }

    const activeLoanId = contextData?.currentLoan?._id || contextData?.currentLoanId || null;

    const { context: fullContext } = await buildFullAdvisorContext(userId, {
      activeLoanId,
      clientContextData: contextData || null,
      maxLoansForContext: 4,
      maxRowsForActiveLoan: 140,
      maxRowsForOtherLoan: 50,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelCandidates = buildModelCandidates();

    const recentHistory = session.messages
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'User' : 'WolfAI'}: ${m.content}`)
      .join('\n');

    const buildPrompt = (context) => `You are **WolfAI**, an elite financial strategist and debt payoff expert. You have access to the user's complete portfolio: every loan, full amortization schedules (period-by-period), all extra payments and rate changes, and dashboard metrics. Use this data to give precise, actionable advice.

**Persona**
- Professional, encouraging, and mathematically precise.
- Default strategy: **Avalanche method** (highest interest rate first) unless the user asks otherwise.
- Be direct. No fluff. Use exact numbers from the context when possible.

**Data you have**
The following block contains the user's full portfolio: loan inputs, events, schedule summaries, and the complete amortization table (every month) for each loan. Use it to answer questions accurately.

\`\`\`
${context}
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

    const compactContext = await buildFullAdvisorContext(userId, {
      activeLoanId,
      clientContextData: contextData || null,
      maxLoansForContext: 2,
      maxRowsForActiveLoan: 70,
      maxRowsForOtherLoan: 25,
    });

    let text = null;
    let lastErr = null;

    // 1st pass: full context, then compact context fallback.
    for (const candidate of modelCandidates) {
      const model = genAI.getGenerativeModel({ model: candidate });
      try {
        const result = await model.generateContent(buildPrompt(fullContext));
        text = result.response.text();
        break;
      } catch (err) {
        lastErr = err;
        const classified = classifyGeminiError(err);
        if (classified.type === 'context_too_large') {
          try {
            const result = await model.generateContent(buildPrompt(compactContext.context));
            text = result.response.text();
            break;
          } catch (retryErr) {
            lastErr = retryErr;
          }
        }
      }
    }

    if (!text) {
      throw lastErr || new Error('Unknown AI generation failure');
    }

    session.messages.push({ role: 'assistant', content: text });
    await session.save();

    res.json({ reply: text });
  } catch (err) {
    console.error('WolfAI Chat Error:', err);
    const classified = classifyGeminiError(err);
    res.status(classified.statusCode || 502).json({
      message:
        classified.type === 'quota'
          ? 'AI quota exceeded. Please retry in a few minutes.'
          : classified.type === 'context_too_large'
            ? 'Your portfolio context is too large for one request. Please retry with a shorter query.'
            : classified.type === 'model_unavailable'
              ? 'Configured AI model is unavailable on server. Please check GEMINI_MODEL.'
              : 'Failed to generate advice due to an AI provider error.',
      code: classified.type,
    });
  }
});

module.exports = router;
