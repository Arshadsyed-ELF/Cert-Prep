import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import attemptService from '../services/attemptService';

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const QuizPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await quizService.getQuizById(id);
                setQuiz(fetchedQuiz);
                setRemainingSeconds(Number(fetchedQuiz.duration || 60) * 60);
                setUserAnswers(new Array(fetchedQuiz.questions?.length || 0));
                setFlaggedQuestions(new Array(fetchedQuiz.questions?.length || 0).fill(false));
            } catch (fetchError) {
                console.error('Error fetching quiz:', fetchError);
                setError('Unable to load this quiz.');
            }
        };
        if (id) fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (remainingSeconds === null || remainingSeconds <= 0 || submitting) return undefined;
        const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
        return () => window.clearInterval(timer);
    }, [remainingSeconds, submitting]);

    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    const answeredCount = useMemo(() => userAnswers.filter((answer) => Array.isArray(answer) ? answer.length > 0 : Boolean(answer)).length, [userAnswers]);
    const progress = quiz?.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
    const isMultipleAnswer = currentQuestion?.questionType === 'MAQ';
    const flaggedCount = flaggedQuestions.filter(Boolean).length;

    const toggleFlag = () => {
        setFlaggedQuestions((previous) => {
            const updated = [...previous];
            updated[currentQuestionIndex] = !updated[currentQuestionIndex];
            return updated;
        });
    };

    const selectAnswer = (answer) => {
        setUserAnswers((previous) => {
            const updated = [...previous];
            if (isMultipleAnswer) {
                const selected = Array.isArray(updated[currentQuestionIndex]) ? updated[currentQuestionIndex] : [];
                updated[currentQuestionIndex] = selected.includes(answer) ? selected.filter((item) => item !== answer) : [...selected, answer];
            } else updated[currentQuestionIndex] = answer;
            return updated;
        });
    };

    const submitQuiz = async () => {
        if (!quiz || submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const payload = quiz.questions.map((question, index) => ({ questionId: question._id, selectedAnswer: userAnswers[index] || (question.questionType === 'MAQ' ? [] : '') }));
            const result = await attemptService.submitAttempt(id, payload);
            history.replace(`/results/${result.attemptId}`, { score: result.score || 0, totalQuestions: result.totalQuestions || quiz.questions.length, passed: result.passed, percentage: result.percentage });
        } catch (submitError) {
            console.error('Error submitting quiz:', submitError);
            setError(submitError.message || 'Unable to submit quiz.');
            setSubmitting(false);
        }
    };

    const unansweredCount = quiz ? quiz.questions.length - answeredCount : 0;
    const requestSubmit = () => setShowReviewDialog(true);

    if (error && !quiz) return <div className="mx-auto max-w-xl px-4 py-16 text-center text-red-600">{error}</div>;
    if (!quiz || !currentQuestion) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">Loading assessment...</div>;

    return (
        <div className="quiz-arena min-h-screen pb-24">
            <header className="quiz-arena-header"><div className="quiz-arena-brand"><button type="button" onClick={() => setShowExitDialog(true)} className="quiz-back" aria-label="Exit quiz">←</button><div><h1>Back to Assessments</h1></div></div><div className="quiz-question-pill"><span /> Question {currentQuestionIndex + 1} <b>of {quiz.questions.length}</b></div></header>

            <div className="quiz-attempt-layout">
                <aside className="quiz-navigator-panel" aria-label="Question navigator">
                    <div className="quiz-navigator-heading"><span>Navigator</span><strong>{answeredCount}/{quiz.questions.length}</strong></div>
                    <p className="quiz-navigator-help">Jump to any question</p>
                    <div className="quiz-number-nav">{quiz.questions.map((question, index) => { const answered = Array.isArray(userAnswers[index]) ? userAnswers[index].length > 0 : Boolean(userAnswers[index]); const isCurrent = index === currentQuestionIndex; return <button key={question._id || index} type="button" onClick={() => setCurrentQuestionIndex(index)} className={`${isCurrent ? 'is-current' : ''} ${answered ? 'is-answered' : ''} ${flaggedQuestions[index] ? 'is-flagged' : ''}`} aria-label={`Go to question ${index + 1}${flaggedQuestions[index] ? ', flagged' : ''}`}>{flaggedQuestions[index] && <span className="quiz-nav-flag" aria-hidden="true">⚑</span>}{index + 1}</button>; })}</div>
                    <div className="quiz-navigator-legend"><span><i className="is-current" />Current</span><span><i className="is-answered" />Answered</span><span><i className="is-flagged" />Flagged</span></div>
                    <p className="quiz-flag-count">{flaggedCount} flagged</p>
                </aside>
            <main className="quiz-frame">
                <div className="quiz-utility-row"><span>Question {currentQuestionIndex + 1} of {quiz.questions.length} <b>•</b> {answeredCount} Answered</span><div className="quiz-question-meta-actions"><span className="quiz-timer">◷ {formatTime(remainingSeconds || 0)}</span><button type="button" onClick={toggleFlag} className={`quiz-flag-button ${flaggedQuestions[currentQuestionIndex] ? 'is-flagged' : ''}`} aria-pressed={Boolean(flaggedQuestions[currentQuestionIndex])}>{flaggedQuestions[currentQuestionIndex] ? '⚑ Flagged' : '⚐ Flag question'}</button></div></div>
                <div className="quiz-progress-track"><div className="quiz-progress-fill" style={{ width: `${progress}%` }} /></div>
                {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <div className="quiz-question-rule" />
                <h2 className="quiz-question-title">{currentQuestion.question}</h2>
                <p className="quiz-instruction">{isMultipleAnswer ? 'Select all that apply' : 'Select one answer'}</p>
                <div className="quiz-options">{currentQuestion.options.map((option, index) => { const selected = isMultipleAnswer ? (userAnswers[currentQuestionIndex] || []).includes(option.text) : userAnswers[currentQuestionIndex] === option.text; return <label key={index} className={`quiz-option ${selected ? 'is-selected' : ''}`}><input type={isMultipleAnswer ? 'checkbox' : 'radio'} name={`question-${currentQuestionIndex}`} checked={selected} onChange={() => selectAnswer(option.text)} /><span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span></label>; })}</div>
                <div className="quiz-question-footer"><span>{isMultipleAnswer ? 'Multiple answers allowed' : 'One answer allowed'}</span><div className="quiz-card-actions"><button type="button" onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))} disabled={currentQuestionIndex === 0} className="quiz-secondary-button">← Previous</button>{currentQuestionIndex === quiz.questions.length - 1 ? <button type="button" onClick={requestSubmit} className="quiz-primary-button">Review &amp; Submit</button> : <button type="button" onClick={() => setCurrentQuestionIndex((index) => Math.min(index + 1, quiz.questions.length - 1))} className="quiz-primary-button">Next question <span>→</span></button>}</div></div>
            </main>
            </div>

            {showExitDialog && <div className="quiz-dialog-backdrop"><div className="quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title"><h2 id="exit-dialog-title">Leave this assessment?</h2><p>Your answers will not be submitted if you leave now.</p><div><button type="button" onClick={() => setShowExitDialog(false)} className="quiz-secondary-button">Keep working</button><button type="button" onClick={() => history.goBack()} className="quiz-danger-button">Exit assessment</button></div></div></div>} 
                    {showReviewDialog && (
    <div
        className="quiz-dialog-backdrop"
        role="presentation"
        onClick={() => !submitting && setShowReviewDialog(false)}
    >
        <div
            className="quiz-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            onClick={(event) => event.stopPropagation()}
        >
            <h2 id="review-dialog-title text-xl ">
                Submit Assessment?
            </h2>
       <br />
            <p>
                Are you sure you want to submit your assessment?
                Once submitted, you will not be able to change your answers.
            </p>

            <div className="quiz-review-stats">
                <span>
                    <b>{answeredCount}</b> answered
                </span>

                <span>
                    <b>{unansweredCount}</b> unanswered
                </span>

                <span>
                    <b>{flaggedCount}</b> flagged
                </span>
            </div>

            {unansweredCount > 0 && (
                <div className="quiz-review-warning pt-5 pb-5">
                    ⚠️ You still have {unansweredCount} unanswered
                    {unansweredCount === 1 ? ' question' : ' questions'}.
                </div>
            )}

            <div className="quiz-dialog-actions">
                <button
                    type="button"
                    onClick={() => setShowReviewDialog(false)}
                    disabled={submitting}
                    className="quiz-secondary-button"
                >
                    Keep Reviewing
                </button>

                <button
                    type="button"
                    onClick={submitQuiz}
                    disabled={submitting}
                    className="quiz-primary-button m-5"
                >
                    {submitting
                        ? 'Submitting...'
                        : 'Yes, Submit Assessment'}
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default QuizPage;
