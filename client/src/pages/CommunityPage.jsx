import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp, ThumbsDown, MessageCircle, Shield, Clock, CheckCircle,
  ChevronDown, ChevronUp, Send, CornerDownRight, Loader, X, AlertCircle
} from 'lucide-react';

const CATEGORIES = ['About', 'NOC', 'Timing', 'Certificate', 'Work', 'Attendance', 'Rosetta', 'ViBe', 'General'];
const API = 'http://localhost:3001/api';

function normalise(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ── Answer Card ──────────────────────────────────────────────────────────────

function AnswerCard({ answer, onVote, userVote }) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/[0.04] last:border-0">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-0.5">
        <button onClick={() => onVote(answer.id, 'up')} className={`p-1 rounded transition-all ${userVote === 'up' ? 'text-accent' : 'text-gray-600 hover:text-gray-300'}`}>
          <ThumbsUp size={13} />
        </button>
        <span className={`text-sm font-bold ${userVote === 'up' ? 'text-accent' : userVote === 'down' ? 'text-warn' : 'text-gray-500'}`}>
          {answer.score ?? 0}
        </span>
        <button onClick={() => onVote(answer.id, 'down')} className={`p-1 rounded transition-all ${userVote === 'down' ? 'text-warn' : 'text-gray-600 hover:text-gray-300'}`}>
          <ThumbsDown size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {answer.isOfficial && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/15 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={8} /> Official
            </span>
          )}
          <span className="text-[10px] text-gray-500">{answer.author_name || 'Anonymous'}</span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-600">{timeAgo(answer.created_at)}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{answer.content}</p>
      </div>
    </div>
  );
}

// ── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ question, onVote, onToggleAnswer, expanded, onSubmitAnswer, onFetchAnswers, answers, loadingAnswers }) {
  const [showForm, setShowForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    await onSubmitAnswer(question.id, answerText.trim());
    setAnswerText('');
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Question votes */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onVote(question.id, 'up', true)}
              className={`p-1.5 rounded-lg transition-all ${question.userVote === 'up' ? 'text-accent bg-accent/10' : 'text-gray-600 hover:text-gray-300 hover:bg-white/[0.04]'}`}
            >
              <ThumbsUp size={15} />
            </button>
            <span className={`text-sm font-bold ${question.userVote === 'up' ? 'text-accent' : question.userVote === 'down' ? 'text-warn' : 'text-gray-400'}`}>
              {question.score ?? 0}
            </span>
            <button
              onClick={() => onVote(question.id, 'down', true)}
              className={`p-1.5 rounded-lg transition-all ${question.userVote === 'down' ? 'text-warn bg-warn/10' : 'text-gray-600 hover:text-gray-300 hover:bg-white/[0.04]'}`}
            >
              <ThumbsDown size={15} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
                {question.category}
              </span>
              {question.has_answers === 1 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={9} /> Answered
                </span>
              )}
              {question.has_answers === 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={9} /> Open
                </span>
              )}
            </div>

            <h3 className="font-outfit font-semibold text-gray-100 mb-1.5 leading-snug">{question.title}</h3>
            {question.description && (
              <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">{question.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
              <button
                onClick={() => { onFetchAnswers(question.id); onToggleAnswer(question.id); }}
                className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <MessageCircle size={12} />
                <span>{question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}</span>
              </button>
              <span className="flex items-center gap-1.5">
                <ThumbsUp size={11} /> {question.score ?? 0} votes
              </span>
              <span>{question.views || 0} views</span>
              <span className="flex items-center gap-1.5">
                <Clock size={10} /> {timeAgo(question.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-5 flex flex-col gap-1">
              {loadingAnswers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={18} className="text-gray-600 animate-spin" />
                </div>
              ) : answers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle size={28} className="text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">No answers yet</p>
                  <p className="text-xs text-gray-700">Be the first to answer!</p>
                </div>
              ) : (
                answers.map(a => (
                  <AnswerCard
                    key={a.id}
                    answer={a}
                    onVote={(aId, dir) => onVote(aId, dir, false, question.id)}
                    userVote={a.userVote}
                  />
                ))
              )}

              {/* Answer form */}
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer font-medium py-2 mt-1"
                >
                  <CornerDownRight size={13} />
                  Write an answer
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    placeholder="Write a clear, helpful answer…"
                    className="input-field min-h-20 resize-none text-sm"
                    required
                    minLength={20}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <Shield size={10} /> Answering anonymously
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <button type="button" onClick={() => { setShowForm(false); setAnswerText(''); }} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                      <button type="submit" disabled={submitting || answerText.trim().length < 20} className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40 flex items-center gap-1.5">
                        {submitting ? <Loader size={11} className="animate-spin" /> : <Send size={11} />}
                        Post Answer
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Ask Modal ────────────────────────────────────────────────────────────────

function AskModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 15) { setError('Question must be at least 15 characters'); return; }
    if (description.trim().length < 30) { setError('Please add more detail (at least 30 characters)'); return; }
    setError('');
    setSubmitting(true);
    const ok = await onSubmit({ title: title.trim(), description: description.trim(), category });
    setSubmitting(false);
    if (ok) {
      setTitle(''); setDescription(''); setCategory('General');
      onClose();
    }
  };

  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative glass rounded-2xl p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-outfit text-lg font-bold">Ask the Community</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Your Question *</label>
            <input
              className="input-field"
              placeholder="e.g. Can I start the internship in August if my exams end in July?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">More Details *</label>
            <textarea
              className="input-field min-h-20 resize-none"
              placeholder="Add context — what you've already looked into, why you're asking…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-warn bg-warn/10 px-3 py-2 rounded-lg">
              <AlertCircle size={12} /> {error}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.05]">
            <Shield size={12} className="text-gray-600 flex-shrink-0" />
            Posted anonymously · Questions with high votes may become Official FAQs
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-40 flex items-center gap-1.5">
              {submitting ? <Loader size={13} className="animate-spin" /> : null}
              Post Anonymously →
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [showAsk, setShowAsk] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [answersMap, setAnswersMap] = useState({});
  const [loadingAnswers, setLoadingAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch questions on mount and filter change
  useEffect(() => {
    fetchQuestions();
  }, [filter, sort]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('category', filter);
      params.set('sort', sort);
      const res = await fetch(`${API}/community/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setError('');
    } catch {
      setError('Failed to load questions. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetId, direction, isQuestion, questionId) => {
    // Optimistic update
    const update = (list) => list.map(q => {
      if (isQuestion && q.id === targetId) {
        const prev = q.userVote;
        let delta = direction === 'up' ? 1 : -1;
        if (prev === direction) { delta = direction === 'up' ? -1 : 1; }
        return { ...q, score: Math.max(0, (q.score ?? 0) + delta), userVote: prev === direction ? null : direction };
      }
      if (!isQuestion && q.id === questionId) {
        return {
          ...q,
          answers: q.answers?.map(a => {
            if (a.id === targetId) {
              const prev = a.userVote;
              let delta = direction === 'up' ? 1 : -1;
              if (prev === direction) { delta = direction === 'up' ? -1 : 1; }
              return { ...a, score: Math.max(0, (a.score ?? 0) + delta), userVote: prev === direction ? null : direction };
            }
            return a;
          }),
        };
      }
      return q;
    });

    if (isQuestion) {
      setQuestions(prev => prev.map(q => {
        if (q.id !== targetId) return q;
        const prev = q.userVote;
        let delta = direction === 'up' ? 1 : -1;
        if (prev === direction) { delta = direction === 'up' ? -1 : 1; }
        return { ...q, score: Math.max(0, (q.score ?? 0) + delta), userVote: prev === direction ? null : direction };
      }));
    } else {
      // Update answer in answersMap
      setAnswersMap(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || []).map(a => {
          if (a.id !== targetId) return a;
          const prev = a.userVote;
          let delta = direction === 'up' ? 1 : -1;
          if (prev === direction) { delta = direction === 'up' ? -1 : 1; }
          return { ...a, score: Math.max(0, (a.score ?? 0) + delta), userVote: prev === direction ? null : direction };
        }),
      }));
    }

    // Persist to backend
    try {
      await fetch(`${API}/community/questions/${targetId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, isQuestion }),
      });
    } catch { /* silent - already optimistically updated */ }
  };

  const toggleAnswer = (qId) => {
    setExpanded(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const fetchAnswers = async (qId) => {
    if (answersMap[qId]) return; // already loaded
    setLoadingAnswers(prev => ({ ...prev, [qId]: true }));
    try {
      const res = await fetch(`${API}/community/questions/${qId}/answers`);
      const data = await res.json();
      setAnswersMap(prev => ({ ...prev, [qId]: data.answers || [] }));
    } catch {
      setAnswersMap(prev => ({ ...prev, [qId]: [] }));
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [qId]: false }));
    }
  };

  const handleSubmitQuestion = async ({ title, description, category }) => {
    try {
      const res = await fetch(`${API}/community/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchQuestions(); // Refresh list
      return true;
    } catch {
      setError('Failed to post question. Please try again.');
      return false;
    }
  };

  const handleSubmitAnswer = async (qId, content) => {
    try {
      const res = await fetch(`${API}/community/questions/${qId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAnswersMap(prev => ({
        ...prev,
        [qId]: [...(prev[qId] || []), { ...data.answer, userVote: null }],
      }));
      // Update answer count on question
      setQuestions(prev => prev.map(q =>
        q.id === qId ? { ...q, answer_count: (q.answer_count || 0) + 1 } : q
      ));
    } catch {
      setError('Failed to post answer. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-outfit text-3xl font-bold mb-1">Community Q&A</h1>
        <p className="text-gray-400 text-sm">Ask anonymously · Answer peers · Top answers become Official FAQs</p>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-warn bg-warn/10 px-4 py-3 rounded-xl mb-5 border border-warn/15">
            <AlertCircle size={14} /> {error}
            <button onClick={() => setError('')} className="ml-auto text-warn/60 hover:text-warn cursor-pointer"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => setShowAsk(true)} className="btn-primary">+ Ask Question</button>

        {/* Sort */}
        <div className="flex gap-2 ml-auto">
          {[['newest', 'Newest'], ['votes', 'Top Voted']].map(([val, label]) => (
            <button key={val} onClick={() => setSort(val)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                sort === val ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-gray-200'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${filter === 'all' ? 'bg-white/[0.08] border-white/[0.12] text-gray-200' : 'text-gray-500'}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${filter === c ? 'bg-white/[0.08] border-white/[0.12] text-gray-200' : 'text-gray-500'}`}>
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Ask modal */}
      <AnimatePresence>
        {showAsk && (
          <AskModal
            open={showAsk}
            onClose={() => setShowAsk(false)}
            onSubmit={handleSubmitQuestion}
          />
        )}
      </AnimatePresence>

      {/* Question list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader size={24} className="text-gray-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading questions…</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle size={40} className="text-gray-800 mb-3" />
          <p className="text-gray-600 mb-1">No questions yet</p>
          <p className="text-xs text-gray-700 mb-4">Be the first to ask!</p>
          <button onClick={() => setShowAsk(true)} className="btn-primary">Ask the First Question</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onVote={handleVote}
              onToggleAnswer={toggleAnswer}
              expanded={!!expanded[q.id]}
              onSubmitAnswer={handleSubmitAnswer}
              onFetchAnswers={fetchAnswers}
              answers={answersMap[q.id] || []}
              loadingAnswers={!!loadingAnswers[q.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}