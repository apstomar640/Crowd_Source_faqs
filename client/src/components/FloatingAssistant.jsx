import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, ExternalLink, ChevronRight, ChevronDown, ChevronUp, Zap, Loader } from 'lucide-react';
import { officialFAQs } from '../data/faqs.js';

const API = 'http://localhost:3001/api';

// ─── Yaksha Brain ───────────────────────────────────────────────────────────
// Intelligent FAQ matcher with keyword boost + question-type routing.
// Sources: 28 official FAQs (static) + community Q&A from /api/community/faqs (live).

const CATEGORY_KEYWORDS = {
  noc:        ['noc', 'certificate', 'letter', 'sign', 'stamp', 'format', 'authorised', 'signatory', 'self', 'college', 'hod', 'sign'],
  timing:     ['start', 'date', 'deadline', 'finish', 'begin', 'when', 'month', 'window', 'end date', 'exam', 'june', 'july', 'august', 'before'],
  certificate:['certificate', 'completion', 'earn', 'result panel', 'selection', 'stipend', 'award', 'reward', 'selected', 'panel', 'offer letter'],
  attendance: ['zoom', 'attendance', 'camera', 'session', 'live', 'poll', 'quizzes', 'recorded', 'recording', 'join', 'miss'],
  work:       ['project', 'work', 'mentor', 'hours', 'laptop', 'commit', 'team', 'open-source', 'github', 'contribution', 'code'],
  vina:       ['vins', 'vise', 'online', 'offline', 'programme', 'online programme', 'lab visit', 'in-person', 'residential', 'visit', 'in person'],
  vibe:       ['vibe', 'lms', 'video', 'login', 'course', 'invite', 'flag', 'browser', 'quiet helper', 'progress'],
  rosetta:    ['rosetta', 'journal', 'daily', 'reflect', 'thinking', 'ai tools', 'chatgpt', 'reflection', 'writing', 'mandatory'],
  about:      ['vins', 'vicharanashala', 'about', 'who', 'eligible', 'student', 'iit', 'sumership', 'internship', 'program', 'difference'],
  team:       ['team', 'partner', 'group', 'mate', 'collaborate'],
};

// Question-type classifiers
const QUESTION_TYPE_PATTERNS = [
  { type: 'can_i',   patterns: [/can i/i, /can we/i, /is it possible/i, /able to/i] },
  { type: 'how',     patterns: [/how (do|does|can|to|long)/i, /what (is|are) the/i] },
  { type: 'when',    patterns: [/when/i, /timeline/i, /duration/i, /schedule/i] },
  { type: 'what',    patterns: [/what/i, /which/i] },
  { type: 'why',     patterns: [/why/i] },
  { type: 'should',  patterns: [/should i/i, /should we/i, /advice/i, /recommend/i] },
  { type: 'cost',    patterns: [/cost/i, /pay/i, /fee/i, /charge/i, /stipend/i, /money/i, /paid/i, /free/i] },
  { type: 'eligible',patterns: [/eligible/i, /eligibility/i, /who can/i, /any one/i, /can join/i] },
];

function normalise(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
}

function classifyQuestionType(q) {
  for (const { type, patterns } of QUESTION_TYPE_PATTERNS) {
    for (const p of patterns) {
      if (p.test(q)) return type;
    }
  }
  return 'general';
}

// Score how well a FAQ matches the query
function scoreFAQ(query, faq) {
  const q       = normalise(query);
  const faqQ    = normalise(faq.q || faq.title || '');
  const faqA    = normalise(faq.a || faq.description || faq.content || '');

  let score = 0;

  // ── Exact / near-exact phrase matches (highest weight) ──
  // Query appears whole inside FAQ question → very likely match
  if (faqQ.includes(q))                          return 200;
  if (faqA.includes(q))                          return 150;

  // Query words as prefix in FAQ question
  const qWords = q.split(/\s+/).filter(w => w.length >= 3);
  const faqQWords = faqQ.split(/\s+/);

  // Count how many query words appear in the FAQ
  let matchedWords = 0;
  let unmatchedQWords = [];
  for (const w of qWords) {
    if (faqQWords.includes(w) || faqA.split(/\s+/).includes(w)) {
      matchedWords++;
    } else {
      unmatchedQWords.push(w);
    }
  }

  // Partial phrase prefix match
  if (faqQ.includes(q.slice(0, Math.floor(q.length * 0.65)))) score += 60;

  // Word overlap score (3pts per matched word)
  score += matchedWords * 3;

  // ── Category keyword boost ──
  let bestCatBoost = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const qK  = keywords.filter(k => q.includes(k)).length;
    const fK  = (faqQ + ' ' + faqA).split(/\s+/).filter(w => keywords.includes(w)).length;
    if (qK > 0 && fK > 0) {
      bestCatBoost = Math.max(bestCatBoost, qK * fK * 8);
    }
  }
  score += bestCatBoost;

  // ── Question-type alignment bonus ──
  const queryType = classifyQuestionType(q);
  const faqType   = classifyQuestionType(faqQ);
  if (queryType === faqType && queryType !== 'general') score += 20;

  // ── Penalty for FAQ answer being too short (low-info) ──
  const ansLen = (faq.a || faq.description || '').length;
  if (ansLen < 50)  score -= 5;
  if (ansLen < 20)  score -= 10;

  // ── Preference: FAQs with higher votes ──
  score += Math.log((faq.votes || 0) + 1) * 0.5;

  return score;
}

function findBestFAQs(query, allFAQs, count = 3) {
  const scored = allFAQs
    .map(faq => ({ faq, score: scoreFAQ(query, faq) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(s => s.faq);
}

function buildAnswer(query, faqs) {
  if (!faqs.length) {
    // Show a helpful redirect
    return {
      text: `I couldn't find an exact match for "${query}". Try asking on the Community page — your question might already be answered there, or someone from the team will reply.`,
      faqs: [],
      redirect: '/community',
    };
  }

  const primary = faqs[0];
  let text = primary.a || primary.description || primary.content || '';

  if (faqs.length > 1) {
    const sec    = faqs[1];
    const secTxt = sec.a || sec.description || sec.content || '';
    const preview = secTxt.length > 120 ? secTxt.slice(0, 117) + '…' : secTxt;
    text += `\n\nAlso relevant: "${sec.q || sec.title}" — ${preview}`;
  }

  return { text, faqs };
}

// Quick-preset buttons — cover every major topic with signal-rich questions
const PRESETS = [
  { q: 'How do I get my NOC signed?',                           keywords: ['noc', 'sign'] },
  { q: 'What if I miss a Zoom session?',                         keywords: ['zoom', 'miss'] },
  { q: 'When will I get my certificate?',                        keywords: ['certificate', 'when'] },
  { q: 'Can I start later if I have exams?',                     keywords: ['start', 'exam', 'later'] },
  { q: 'Who is my mentor and how are they assigned?',            keywords: ['mentor', 'assigned'] },
  { q: 'Is there a stipend or do I get paid?',                   keywords: ['stipend', 'pay'] },
  { q: 'What is Rosetta and is it mandatory?',                   keywords: ['rosetta', 'mandatory'] },
  { q: 'How do I log into ViBe? The invite link is not working', keywords: ['vibe', 'login', 'invite'] },
  { q: 'What is the difference between VINS and VISE?',          keywords: ['vins', 'vise', 'offline'] },
  { q: 'Am I eligible if I have already graduated?',             keywords: ['eligible', 'alumni', 'graduate'] },
];

const WELCOME = {
  from: 'ai',
  text: "Namaste! I'm Yaksha. I know all the official FAQs — and I also learn from every question the community asks. Ask me anything about Vicharanashala!",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function FloatingAssistant() {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([WELCOME]);
  const [input, setInput]             = useState('');
  const [visible, setVisible]         = useState(true);
  const [communityFAQs, setCommunityFAQs] = useState([]);
  const [presetExpanded, setPresetExpanded] = useState(false);
  const [thinking, setThinking]       = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`${API}/community/faqs`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.faqs) setCommunityFAQs(data.faqs); })
      .catch(() => {});
  }, [open]);

  const allFAQs = [
    ...officialFAQs.map(f => ({ ...f, source: 'official' })),
    ...communityFAQs.map(f => ({ ...f, source: 'community' })),
  ];

  const handleSend = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    setMessages(m => [...m, { from: 'user', text: userText }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const matched   = findBestFAQs(userText, allFAQs);
      const { text: answer, faqs, redirect } = buildAnswer(userText, matched);

      setThinking(false);
      setMessages(m => [
        ...m,
        { from: 'ai', text: answer, faqs, matchedFAQ: matched[0] || null, redirect },
      ]);
    }, 900);
  };

  const handlePresetClick = (preset) => {
    setMessages(m => [...m, { from: 'user', text: preset.q }]);
    setThinking(true);
    setTimeout(() => {
      const matched   = findBestFAQs(preset.q, allFAQs);
      const { text: answer, faqs, redirect } = buildAnswer(preset.q, matched);
      setThinking(false);
      setMessages(m => [
        ...m,
        { from: 'ai', text: answer, faqs, matchedFAQ: matched[0] || null, redirect },
      ]);
    }, 900);
  };

  const displayedPresets = presetExpanded ? PRESETS : PRESETS.slice(0, 5);

  const lastMsg = messages[messages.length - 1];

  return (
    <AnimatePresence>
      {!visible ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => { setVisible(true); setOpen(false); }}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.45)] transition-all duration-300 cursor-pointer"
        >
          <Bot size={24} className="text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-deep animate-pulse" />
        </motion.button>
      ) : !open ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.45)] transition-all duration-300 cursor-pointer"
        >
          <Bot size={24} className="text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-deep animate-pulse" />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[60] w-[22rem] sm:w-[26rem] bg-elevated border border-white/[0.1] rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden max-h-[38rem]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface/90 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot size={16} className="text-black" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-elevated animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">Yaksha Assistant</p>
                <p className="text-[10px] text-gray-500">
                  {officialFAQs.length} official
                  {communityFAQs.length > 0 && ` · ${communityFAQs.length} community`}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white p-1 transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[88%]">
                  {m.from === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Bot size={9} className="text-black" />
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium">Yaksha</span>
                    </div>
                  )}

                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-primary text-black font-semibold rounded-br-md'
                      : 'bg-white/[0.06] text-gray-200 border border-white/[0.07] rounded-bl-md'
                  }`}>
                    {m.text.split('\n').map((line, li) => {
                      if (line.startsWith('Also see:') || line.startsWith('Also relevant:')) {
                        const rest = line.replace(/^(Also (see|relevant):)\\s*/, '');
                        return (
                          <p key={li} className="mt-2 pt-2 border-t border-white/[0.07] text-gray-400 text-[11px]">
                            💡 {rest}
                          </p>
                        );
                      }
                      return line.trim() ? <p key={li} className={li > 0 ? 'mt-2' : ''}>{line}</p> : null;
                    })}
                  </div>

                  {/* Source badge */}
                  {m.from === 'ai' && m.matchedFAQ && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/[0.06] border border-primary/12 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-0.5">
                          {m.matchedFAQ.source === 'community' ? '🌐 Community Answer' : '✅ Official FAQ'}
                          {m.matchedFAQ.section && ` · ${m.matchedFAQ.section}`}
                        </p>
                        <p className="text-[11px] text-gray-300 leading-snug group-hover:text-primary transition-colors">
                          {m.matchedFAQ.q || m.matchedFAQ.title}
                        </p>
                        {m.matchedFAQ.votes !== undefined && (
                          <p className="text-[9px] text-gray-600 mt-1">
                            ▲ {m.matchedFAQ.votes} votes
                            {m.matchedFAQ.answer_count !== undefined && ` · ${m.matchedFAQ.answer_count} answers`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Redirect nudge */}
                  {m.from === 'ai' && m.redirect && (
                    <a
                      href={m.redirect}
                      className="mt-2 flex items-center gap-1.5 text-[10px] text-primary/70 hover:text-primary transition-colors"
                    >
                      <ExternalLink size={10} />
                      Ask on Community page →
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Thinking indicator */}
            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader size={11} className="text-gray-500 animate-spin" />
                  <span className="text-xs text-gray-500">Thinking…</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Presets */}
          <div className="px-3 pb-2 flex-shrink-0 border-t border-white/[0.04] pt-2">
            <div className="flex flex-wrap gap-1.5">
              {displayedPresets.map(p => (
                <button
                  key={p.q}
                  onClick={() => handlePresetClick(p)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-500 hover:text-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Zap size={8} className="text-primary/60 flex-shrink-0" />
                  <span className="truncate max-w-[11rem]">{p.q.length > 36 ? p.q.slice(0, 34) + '…' : p.q}</span>
                </button>
              ))}
              {PRESETS.length > 5 && (
                <button
                  onClick={() => setPresetExpanded(e => !e)}
                  className="text-[10px] px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {presetExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  {presetExpanded ? 'Less' : `+${PRESETS.length - 5} more`}
                </button>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Vicharanashala…"
              className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-full px-4 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-primary/30 transition-all"
            />
            <button
              onClick={() => handleSend()}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
            >
              <Send size={13} className="text-black" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}