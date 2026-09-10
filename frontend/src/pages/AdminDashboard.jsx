import React, { useEffect, useRef, useState } from 'react';
import quizService from '../services/quizService';
import adminService from '../services/adminService';

const initialQuiz = {
    title: '',
    certificationType: '',
    certificationLevel: '',
    description: '',
    duration: 30,
    passingPercentage: 70,
};

const initialQuestion = {
    questionType: 'MCQ',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'Easy',
};

const getId = (item) => item._id || item.id;

const fromApiQuestion = (question) => ({
    questionType: question.questionType || (Array.isArray(question.correctAnswer) ? 'MAQ' : 'MCQ'),
    question: question.question || '',
    options: (question.options || []).map((option) => option.text || ''),
    correctAnswer: question.correctAnswer || '',
    explanation: question.explanation || '',
    difficulty: question.difficulty || 'Easy',
});

const toApiQuestions = (questions) => questions.map((question) => ({
    ...question,
    options: question.options.map((text) => ({ text })),
}));

const normaliseImportedQuestion = (question, index) => {
    if (!question || typeof question !== 'object') throw new Error(`Question ${index + 1} must be an object.`);
    const options = (question.options || []).map((option) => typeof option === 'string' ? option.trim() : String(option?.text || '').trim()).filter(Boolean);
    const questionType = question.questionType || (Array.isArray(question.correctAnswer) ? 'MAQ' : 'MCQ');
    const correctAnswer = Array.isArray(question.correctAnswer) ? question.correctAnswer.map((answer) => String(answer).trim()) : String(question.correctAnswer || '').trim();
    const answers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    if (!['MCQ', 'MAQ'].includes(questionType) || !String(question.question || '').trim() || options.length < 2 || answers.length === 0 || (questionType === 'MCQ' && answers.length !== 1) || !answers.every((answer) => options.includes(answer)) || !String(question.explanation || '').trim() || !['Easy', 'Medium', 'Hard'].includes(question.difficulty)) {
        throw new Error(`Question ${index + 1} is invalid. Each question needs text, at least two options, a matching correctAnswer, explanation, and difficulty (Easy, Medium, or Hard).`);
    }
    return { questionType, question: question.question.trim(), options, correctAnswer: questionType === 'MAQ' ? answers : answers[0], explanation: question.explanation.trim(), difficulty: question.difficulty };
};

const questionJsonTemplate = {
    questions: [
        {
            questionType: 'MCQ',
            question: 'Which command initializes a new Git repository?',
            options: ['git init', 'git start', 'git create', 'git new'],
            correctAnswer: 'git init',
            explanation: 'The git init command creates a new local Git repository.',
            difficulty: 'Easy',
        },
        {
            questionType: 'MAQ',
            question: 'Which are JavaScript primitive data types?',
            options: ['string', 'number', 'boolean', 'array'],
            correctAnswer: ['string', 'number', 'boolean'],
            explanation: 'Arrays are objects; string, number, and boolean are primitive types.',
            difficulty: 'Medium',
        },
    ],
};

const QuestionModal = ({ draft, setDraft, editingIndex, saving, onClose, onSave }) => {
    const [tab, setTab] = useState('content');

    const updateDraft = (field, value) => setDraft({ ...draft, [field]: value });
    const selectCorrectAnswer = (option) => {
        if (!option) return;
        if (draft.questionType === 'MAQ') {
            const selected = Array.isArray(draft.correctAnswer) ? draft.correctAnswer : [];
            updateDraft('correctAnswer', selected.includes(option) ? selected.filter((answer) => answer !== option) : [...selected, option]);
            return;
        }
        updateDraft('correctAnswer', option);
    };
    const updateOption = (index, value) => {
        const options = draft.options.slice();
        const oldValue = options[index];
        options[index] = value;
        const correctAnswer = Array.isArray(draft.correctAnswer) ? draft.correctAnswer.map((answer) => answer === oldValue ? value : answer) : draft.correctAnswer === oldValue ? value : draft.correctAnswer;
        setDraft({ ...draft, options, correctAnswer });
    };
    const addOption = () => setDraft({ ...draft, options: [...draft.options, ''] });
    const removeOption = (index) => {
        if (draft.options.length <= 2) return;
        const removed = draft.options[index];
        setDraft({
            ...draft,
            options: draft.options.filter((_, optionIndex) => optionIndex !== index),
            correctAnswer: Array.isArray(draft.correctAnswer) ? draft.correctAnswer.filter((answer) => answer !== removed) : draft.correctAnswer === removed ? '' : draft.correctAnswer,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{editingIndex === null ? 'Create New Question' : 'Edit Question'}</h2>
                    <button type="button" onClick={onClose} className="text-xl text-gray-500">×</button>
                </div>
                <div className="my-4 inline-flex rounded-lg bg-gray-100 p-1 text-sm">
                    {['content', 'settings', 'explanation'].map((item) => (
                        <button key={item} type="button" onClick={() => setTab(item)} className={`rounded px-3 py-2 ${tab === item ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                            {item === 'content' ? 'Content' : item === 'settings' ? 'Settings' : 'Hints & Explanation'}
                        </button>
                    ))}
                </div>

                {tab === 'content' && (
                    <form onSubmit={onSave} className="space-y-5">
                        <label className="block text-sm font-medium text-gray-700">Question type
                            <select value={draft.questionType} onChange={(event) => updateDraft('questionType', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="MCQ">Multiple Choice (Single)</option><option value="MAQ">Multiple Answer (Select all that apply)</option></select>
                        </label>
                        <label className="block text-sm font-medium text-gray-700">Question text *
                            <textarea value={draft.question} onChange={(event) => updateDraft('question', event.target.value)} rows="4" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required />
                        </label>
                        <div>
                            <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-medium text-gray-700">Answer options</h3><button type="button" onClick={addOption} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">+ Add option</button></div>
                            <div className="space-y-2">
                                {draft.options.map((option, index) => <div key={index} className="flex items-center gap-2">
                                    <button type="button" onClick={() => selectCorrectAnswer(option)} aria-label={`Mark option ${index + 1} correct`} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${((Array.isArray(draft.correctAnswer) && draft.correctAnswer.includes(option)) || draft.correctAnswer === option) && option ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-600'}`}>{((Array.isArray(draft.correctAnswer) && draft.correctAnswer.includes(option)) || draft.correctAnswer === option) && option ? '✓' : String.fromCharCode(65 + index)}</button>
                                    <input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${String.fromCharCode(65 + index)}`} required className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                                    {draft.options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="px-2 text-red-600">×</button>}
                                </div>)}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">{draft.questionType === 'MAQ' ? 'Select every circle that marks a correct answer.' : 'Click the circle to mark the correct answer.'}</p>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save Question'}</button></div>
                    </form>
                )}
                {tab === 'settings' && <label className="block text-sm font-medium text-gray-700">Difficulty<select value={draft.difficulty} onChange={(event) => updateDraft('difficulty', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"><option>Easy</option><option>Medium</option><option>Hard</option></select></label>}
                {tab === 'explanation' && <label className="block text-sm font-medium text-gray-700">Explanation *<textarea value={draft.explanation} onChange={(event) => updateDraft('explanation', event.target.value)} rows="7" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label>}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [quizForm, setQuizForm] = useState(initialQuiz);
    const [questionDraft, setQuestionDraft] = useState(initialQuestion);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [view, setView] = useState('list');
    const [menuQuizId, setMenuQuizId] = useState(null);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [assessmentPage, setAssessmentPage] = useState(1);
    const [assessmentPageSize, setAssessmentPageSize] = useState(12);
    const [adminSection, setAdminSection] = useState('overview');
    const [overview, setOverview] = useState(null);
    const [users, setUsers] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [userPageSize, setUserPageSize] = useState(12);
    const jsonUploadRef = useRef(null);

    const loadQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuizzes();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load assessments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadQuizzes(); }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 250);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const [overviewData, usersData] = await Promise.all([adminService.getOverview(), adminService.getUsers()]);
                setOverview(overviewData);
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load admin dashboard.');
            }
        };
        loadOverview();
    }, []);

    const clearFeedback = () => { setError(''); setMessage(''); };
    const resetEditor = () => { setQuizForm(initialQuiz); setQuestionDraft(initialQuestion); setActiveQuizId(null); setQuestions([]); setEditingQuestionIndex(null); setQuestionModalOpen(false); };
    const startNewAssessment = () => { resetEditor(); setAdminSection('assessments'); setView('editor'); };

    const openQuiz = (quiz) => {
        clearFeedback();
        setActiveQuizId(getId(quiz));
        setQuizForm({ title: quiz.title || '', certificationType: quiz.certificationType || '', certificationLevel: quiz.certificationLevel || '', description: quiz.description || '', duration: quiz.duration || 30, passingPercentage: quiz.passingPercentage || 70 });
        setQuestions((quiz.questions || []).map(fromApiQuestion));
        setQuestionDraft(initialQuestion);
        setEditingQuestionIndex(null);
        setMenuQuizId(null);
        setAdminSection('assessments');
        setView('editor');
    };

    const saveQuizDetails = async (event) => {
        event.preventDefault();
        clearFeedback();
        setSaving(true);
        const payload = { ...quizForm, title: quizForm.title.trim(), certificationType: quizForm.certificationType.trim(), certificationLevel: quizForm.certificationLevel.trim(), description: quizForm.description.trim(), duration: Number(quizForm.duration), passingPercentage: Number(quizForm.passingPercentage), questions: toApiQuestions(questions) };
        try {
            const saved = activeQuizId ? await quizService.updateQuiz(activeQuizId, payload) : await quizService.createQuiz(payload);
            setActiveQuizId(activeQuizId || getId(saved));
            setMessage(activeQuizId ? 'Assessment details saved.' : 'Assessment created. Add questions below.');
            await loadQuizzes();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save assessment details.');
        } finally { setSaving(false); }
    };

    const updateQuestions = async (nextQuestions, successMessage) => {
        setSaving(true);
        try {
            await quizService.updateQuiz(activeQuizId, { ...quizForm, duration: Number(quizForm.duration), passingPercentage: Number(quizForm.passingPercentage), questions: toApiQuestions(nextQuestions) });
            setQuestions(nextQuestions);
            setMessage(successMessage);
            await loadQuizzes();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save question.');
        } finally { setSaving(false); }
    };

    const saveQuestion = async (event) => {
        event.preventDefault();
        clearFeedback();
        const options = questionDraft.options.map((option) => option.trim());
        const correctAnswers = Array.isArray(questionDraft.correctAnswer) ? questionDraft.correctAnswer : [questionDraft.correctAnswer];
        if (!questionDraft.question.trim() || options.filter(Boolean).length < 2 || !correctAnswers.filter(Boolean).length || !questionDraft.explanation.trim() || correctAnswers.some((answer) => !options.includes(answer))) {
            setError('Add question text, at least two options, the correct answer, and an explanation.');
            return;
        }
        const nextQuestion = { ...questionDraft, question: questionDraft.question.trim(), options, correctAnswer: questionDraft.questionType === 'MAQ' ? correctAnswers : correctAnswers[0], explanation: questionDraft.explanation.trim() };
        const nextQuestions = questions.slice();
        if (editingQuestionIndex === null) nextQuestions.push(nextQuestion); else nextQuestions[editingQuestionIndex] = nextQuestion;
        await updateQuestions(nextQuestions, editingQuestionIndex === null ? 'Question added.' : 'Question updated.');
        setQuestionDraft(initialQuestion);
        setEditingQuestionIndex(null);
        setQuestionModalOpen(false);
    };

    const openQuestionModal = (index = null) => { clearFeedback(); setEditingQuestionIndex(index); setQuestionDraft(index === null ? initialQuestion : questions[index]); setQuestionModalOpen(true); };
    const removeQuestion = async (index) => { const nextQuestions = questions.filter((_, questionIndex) => questionIndex !== index); await updateQuestions(nextQuestions, 'Question removed.'); };
    const importQuestionsFromJson = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        clearFeedback();
        try {
            const parsed = JSON.parse(await file.text());
            const importedQuestions = Array.isArray(parsed) ? parsed : parsed.questions;
            if (!Array.isArray(importedQuestions) || importedQuestions.length === 0) throw new Error('The JSON must be a non-empty array of questions, or an object with a questions array.');
            const nextQuestions = [...questions, ...importedQuestions.map(normaliseImportedQuestion)];
            await updateQuestions(nextQuestions, `${importedQuestions.length} question${importedQuestions.length === 1 ? '' : 's'} imported.`);
        } catch (err) {
            setError(err instanceof SyntaxError ? 'The selected file is not valid JSON.' : err.message || 'Unable to import questions.');
        }
    };
    const downloadQuestionTemplate = () => {
        const file = new Blob([JSON.stringify(questionJsonTemplate, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'question-import-template.json';
        link.click();
        URL.revokeObjectURL(url);
    };
    const handleDeleteQuiz = async (quiz) => {
        const id = getId(quiz);
        if (!id || !window.confirm(`Delete "${quiz.title}"?`)) return;
        try { await quizService.deleteQuiz(id); if (activeQuizId === id) resetEditor(); setMessage('Assessment deleted.'); await loadQuizzes(); } catch (err) { setError(err.response?.data?.message || 'Unable to delete assessment.'); }
    };

    const handleDeleteUser = async (user) => {
        const id = getId(user);
        if (!id || !window.confirm(`Delete user "${user.name || user.email}"?`)) return;
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter((item) => getId(item) !== id));
            setMessage('User deleted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete user.');
        }
    };

    const types = [...new Set(quizzes.map((quiz) => quiz.certificationType).filter(Boolean))];
    const filteredQuizzes = quizzes.filter((quiz) => {
        const matchesSearch = `${quiz.title} ${quiz.certificationType} ${quiz.description}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        return matchesSearch && (typeFilter === 'all' || quiz.certificationType === typeFilter);
    });
    const assessmentPageCount = Math.max(1, Math.ceil(filteredQuizzes.length / assessmentPageSize));
    const paginatedQuizzes = filteredQuizzes.slice((assessmentPage - 1) * assessmentPageSize, assessmentPage * assessmentPageSize);
    const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize));
    const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);

    useEffect(() => {
        setAssessmentPage(1);
    }, [searchTerm, typeFilter, assessmentPageSize]);

    useEffect(() => {
        if (assessmentPage > assessmentPageCount) setAssessmentPage(assessmentPageCount);
    }, [assessmentPage, assessmentPageCount]);

    useEffect(() => {
        setUserPage(1);
    }, [userPageSize]);

    useEffect(() => {
        if (userPage > userPageCount) setUserPage(userPageCount);
    }, [userPage, userPageCount]);

    const chartValues = overview?.attemptsByDay || [];
    const maxAttempts = Math.max(...chartValues.map((item) => item.count), 1);

    if (adminSection === 'overview' && view === 'list') {
        return <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1><p className="mt-1 text-sm text-gray-500">Monitor your platform, users, assessments, and performance.</p></div><button type="button" onClick={startNewAssessment} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">+ Create Assessment</button></div>
            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="flex gap-2 border-b border-gray-200"><button type="button" onClick={() => setAdminSection('overview')} className="border-b-2 border-blue-900 px-3 py-2 text-sm font-semibold text-blue-900">Overview</button><button type="button" onClick={() => setAdminSection('assessments')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">Assessments</button></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Total users</p><p className="mt-2 text-3xl font-bold text-gray-900">{overview?.metrics?.users ?? '—'}</p><p className="mt-2 text-xs text-green-600">Registered learners</p></div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Assessments</p><p className="mt-2 text-3xl font-bold text-gray-900">{overview?.metrics?.quizzes ?? quizzes.length}</p><p className="mt-2 text-xs text-blue-600">Available quizzes</p></div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Total attempts</p><p className="mt-2 text-3xl font-bold text-gray-900">{overview?.metrics?.attempts ?? '—'}</p><p className="mt-2 text-xs text-gray-500">All time submissions</p></div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Pass rate</p><p className="mt-2 text-3xl font-bold text-gray-900">{overview?.metrics?.passRate ?? '—'}%</p><p className="mt-2 text-xs text-green-600">Across all attempts</p></div></div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-gray-900">Attempts this week</h2><p className="text-sm text-gray-500">Daily submission activity</p></div><span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">Last 7 days</span></div><div className="flex h-56 items-end gap-3 border-b border-gray-100 pb-2">{chartValues.length ? chartValues.map((item) => <div key={item._id} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs text-gray-500">{item.count}</span><div className="w-full max-w-10 rounded-t bg-blue-600" style={{ height: `${Math.max((item.count / maxAttempts) * 85, 5)}%` }} /><span className="text-xs text-gray-400">{item._id.slice(5)}</span></div>) : <p className="w-full self-center text-center text-sm text-gray-500">No attempt data yet.</p>}</div></section><section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-gray-900">Top assessments</h2><p className="mb-5 text-sm text-gray-500">By attempt volume</p><div className="space-y-4">{(overview?.quizPerformance || []).length ? overview.quizPerformance.map((item) => <div key={item._id}><div className="mb-1 flex justify-between text-sm"><span className="truncate pr-3 text-gray-700">{item.title || 'Untitled assessment'}</span><span className="text-gray-500">{item.attempts}</span></div><div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-green-500" style={{ width: `${Math.min((item.averagePercentage || 0), 100)}%` }} /></div></div>) : <p className="text-sm text-gray-500">No assessment attempts yet.</p>}</div></section></div>
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-gray-900">Recent users</h2><p className="text-sm text-gray-500">Latest learner registrations</p></div><button type="button" onClick={() => setAdminSection('users')} className="text-sm text-blue-700">Manage users</button></div>{(overview?.recentUsers || []).length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase text-gray-400"><tr><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Joined</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{overview.recentUsers.map((user) => <tr key={getId(user)} className="border-b last:border-0"><td className="py-3 font-medium text-gray-800">{user.name}</td><td className="py-3 text-gray-500">{user.email}</td><td className="py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="py-3 text-right"><button type="button" onClick={() => handleDeleteUser(user)} className="text-red-600">Delete</button></td></tr>)}</tbody></table></div> : <p className="text-sm text-gray-500">No users registered yet.</p>}</section>
        </div>;
    }

    if (view === 'editor') {
        return <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><button type="button" onClick={() => { resetEditor(); setView('list'); }} className="mr-3 text-gray-500">←</button><span className="align-middle"><h1 className="inline text-2xl font-bold text-gray-900">{activeQuizId ? 'Edit Assessment' : 'Create Assessment'}</h1><p className="ml-9 text-sm text-gray-500">Configure your assessment settings and add questions</p></span></div><div><button type="submit" form="assessment-details" disabled={saving} className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white">Save Draft</button></div></div>
            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-1 text-xl font-semibold">Basic Information</h2><p className="mb-5 text-sm text-gray-500">Set the title, type, and basic settings for your assessment</p><form id="assessment-details" onSubmit={saveQuizDetails} className="grid grid-cols-1 gap-4 md:grid-cols-2"><input value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} placeholder="Title *" required className="rounded-lg border border-gray-300 px-3 py-2" /><input value={quizForm.certificationType} onChange={(event) => setQuizForm({ ...quizForm, certificationType: event.target.value })} placeholder="Assessment Type" required className="rounded-lg border border-gray-300 px-3 py-2" /><input value={quizForm.certificationLevel} onChange={(event) => setQuizForm({ ...quizForm, certificationLevel: event.target.value })} placeholder="Course (optional)" required className="rounded-lg border border-gray-300 px-3 py-2" /><input type="number" min="1" value={quizForm.duration} onChange={(event) => setQuizForm({ ...quizForm, duration: event.target.value })} placeholder="Duration (minutes)" required className="rounded-lg border border-gray-300 px-3 py-2" /><textarea value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} placeholder="Description" required rows="4" className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" /><label className="text-sm text-gray-600">Pass Percentage<input type="number" min="0" max="100" value={quizForm.passingPercentage} onChange={(event) => setQuizForm({ ...quizForm, passingPercentage: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><button type="submit" disabled={saving} className="rounded-lg bg-blue-900 px-4 py-2 font-semibold text-white md:col-span-2">{saving ? 'Saving...' : activeQuizId ? 'Save Assessment Details' : 'Create Assessment'}</button></form></section>
            {activeQuizId && <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-8 text-sm"><span>Questions <strong>{questions.length}</strong></span><span>Marks Assigned <strong>{questions.length}</strong></span><span>Remaining <strong>0</strong></span></div><div className="flex flex-wrap gap-2"><input ref={jsonUploadRef} type="file" accept="application/json,.json" onChange={importQuestionsFromJson} className="hidden" /><button type="button" onClick={downloadQuestionTemplate} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Download Template</button><button type="button" onClick={() => jsonUploadRef.current?.click()} disabled={saving} className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 disabled:opacity-50">Upload JSON</button><button type="button" onClick={() => openQuestionModal()} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">+ New Question</button></div></div><p className="mb-4 text-xs text-gray-500">Download the template, edit its <code>questions</code> array, then upload it. Imported questions are added to this assessment.</p>{questions.length === 0 ? <p className="text-sm text-gray-500">No questions yet. Create the first question or upload a JSON file.</p> : <div className="space-y-3">{questions.map((question, index) => <div key={`${question.question}-${index}`} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"><div><p className="font-semibold">{index + 1}. {question.question}</p><p className="mt-1 text-sm text-gray-500">{question.options.length} options · {question.difficulty}</p></div><div className="flex gap-3 text-sm"><button type="button" onClick={() => openQuestionModal(index)} className="text-blue-600">Edit</button><button type="button" onClick={() => removeQuestion(index)} className="text-red-600">Delete</button></div></div>)}</div>}</section>}
            {questionModalOpen && <QuestionModal draft={questionDraft} setDraft={setQuestionDraft} editingIndex={editingQuestionIndex} saving={saving} onClose={() => setQuestionModalOpen(false)} onSave={saveQuestion} />}
        </div>;
    }

    if (adminSection === 'users' && view === 'list') {
        return <div className="space-y-6">
            <div className="flex items-end justify-between"><div><h1 className="text-3xl font-bold text-gray-900">User management</h1><p className="mt-1 text-sm text-gray-500">Review and manage registered learners.</p></div><button type="button" onClick={() => setAdminSection('overview')} className="text-sm text-blue-700">← Back to overview</button></div>
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex gap-2 border-b border-gray-200"><button type="button" onClick={() => setAdminSection('overview')} className="px-3 py-2 text-sm text-gray-500">Overview</button><button type="button" className="border-b-2 border-blue-900 px-3 py-2 text-sm font-semibold text-blue-900">Users</button></div>{users.length ? <><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase text-gray-400"><tr><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Joined</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{paginatedUsers.map((user) => <tr key={getId(user)} className="border-b last:border-0"><td className="py-3 font-medium text-gray-800">{user.name}</td><td className="py-3 text-gray-500">{user.email}</td><td className="py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="py-3 text-right"><button type="button" onClick={() => handleDeleteUser(user)} className="text-red-600">Delete</button></td></tr>)}</tbody></table></div><div className="mt-4 flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(userPage - 1) * userPageSize + 1}-{Math.min(userPage * userPageSize, users.length)} of {users.length}</span><div className="flex items-center gap-2"><label htmlFor="user-page-size">Rows:</label><select id="user-page-size" value={userPageSize} onChange={(event) => setUserPageSize(Number(event.target.value))} className="rounded border border-gray-200 bg-white px-2 py-1"><option value="6">6</option><option value="12">12</option><option value="24">24</option></select><button type="button" onClick={() => setUserPage(1)} disabled={userPage === 1} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">«</button><button type="button" onClick={() => setUserPage((page) => Math.max(1, page - 1))} disabled={userPage === 1} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">‹</button><span>Page {userPage} of {userPageCount}</span><button type="button" onClick={() => setUserPage((page) => Math.min(userPageCount, page + 1))} disabled={userPage === userPageCount} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">›</button><button type="button" onClick={() => setUserPage(userPageCount)} disabled={userPage === userPageCount} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">»</button></div></div></> : <p className="text-sm text-gray-500">No users registered yet.</p>}</section>
        </div>;
    }

    return <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-3xl font-bold tracking-tight text-gray-900">Assessment Builder</h1><p className="mt-1 text-sm text-gray-500">Create and manage assessments for your courses</p></div><button type="button" onClick={startNewAssessment} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">+ Create Assessment</button></div>
        <div className="flex gap-2 border-b border-gray-200"><button type="button" onClick={() => setAdminSection('overview')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">Overview</button><button type="button" className="border-b-2 border-blue-900 px-3 py-2 text-sm font-semibold text-blue-900">Assessments</button><button type="button" onClick={() => setAdminSection('users')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">Users</button></div>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"><div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_150px]"><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search assessments..." className="rounded-lg border border-gray-200 px-3 py-2 text-sm" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"><option value="all">All Types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></div></section>
        <section>{loading ? <p className="py-8 text-sm text-gray-500">Loading assessments...</p> : filteredQuizzes.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No assessments match your filters.</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{paginatedQuizzes.map((quiz) => <div key={getId(quiz)} className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-end"><button type="button" onClick={() => setMenuQuizId(menuQuizId === getId(quiz) ? null : getId(quiz))} className="text-lg text-gray-500">⋮</button></div>{menuQuizId === getId(quiz) && <div className="absolute right-4 top-12 z-10 w-44 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg"><button type="button" onClick={() => openQuiz(quiz)} className="block w-full rounded px-3 py-2 text-left hover:bg-gray-50">Edit</button><button type="button" onClick={() => handleDeleteQuiz(quiz)} className="block w-full rounded px-3 py-2 text-left text-red-600 hover:bg-red-50">Delete</button></div>}<button type="button" onClick={() => openQuiz(quiz)} className="mt-5 block w-full text-left"><h2 className="truncate pb-1 font-semibold text-gray-900 hover:text-blue-700">{quiz.title}</h2><p className="mt-2 min-h-10 line-clamp-2 text-xs leading-5 text-gray-500">{quiz.description || 'No description provided.'}</p><p className="mt-3 text-xs text-gray-500">{quiz.questions?.length || 0} questions · {quiz.duration} min · {quiz.certificationType}</p></button></div>)}</div>}<div className="mt-4 flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredQuizzes.length === 0 ? 0 : (assessmentPage - 1) * assessmentPageSize + 1}-{Math.min(assessmentPage * assessmentPageSize, filteredQuizzes.length)} of {filteredQuizzes.length}</span><div className="flex items-center gap-2"><label htmlFor="assessment-page-size">Rows:</label><select id="assessment-page-size" value={assessmentPageSize} onChange={(event) => setAssessmentPageSize(Number(event.target.value))} className="rounded border border-gray-200 bg-white px-2 py-1"><option value="6">6</option><option value="12">12</option><option value="24">24</option></select><button type="button" onClick={() => setAssessmentPage(1)} disabled={assessmentPage === 1} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">«</button><button type="button" onClick={() => setAssessmentPage((page) => Math.max(1, page - 1))} disabled={assessmentPage === 1} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">‹</button><span>Page {assessmentPage} of {assessmentPageCount}</span><button type="button" onClick={() => setAssessmentPage((page) => Math.min(assessmentPageCount, page + 1))} disabled={assessmentPage === assessmentPageCount} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">›</button><button type="button" onClick={() => setAssessmentPage(assessmentPageCount)} disabled={assessmentPage === assessmentPageCount} className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40">»</button></div></div></section>
    </div>;
};

export default AdminDashboard;
