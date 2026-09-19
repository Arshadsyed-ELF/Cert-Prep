import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import quizService from '../services/quizService';
import attemptService from '../services/attemptService';

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const formatRemainingDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    return `${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`;
};
const MAX_TAB_SWITCH_WARNINGS = 3;

const QuizPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [assessmentStarted, setAssessmentStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [tabSwitchWarning, setTabSwitchWarning] = useState('');
    const [timeWarning, setTimeWarning] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const tabSwitchCountRef = useRef(0);
    const timeWarningsRef = useRef({ half: false, ten: false });
    const submissionStartedRef = useRef(false);
    const fullscreenExitCountRef = useRef(0);
    const intentionalFullscreenExitRef = useRef(false);

    const enterFullscreen = async () => {
        if (document.fullscreenElement) {
            setIsFullscreen(true);
            return true;
        }
        if (!document.documentElement.requestFullscreen) {
            toast.warn('Fullscreen mode is unavailable in this browser.');
            return false;
        }
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
            return true;
        } catch (fullscreenError) {
            console.warn('Unable to enter fullscreen mode:', fullscreenError);
            toast.warn('Fullscreen mode is unavailable in this browser.');
            return false;
        }
    };

    const exitFullscreen = () => {
        if (document.fullscreenElement && document.exitFullscreen) {
            intentionalFullscreenExitRef.current = true;
            document.exitFullscreen().catch(() => {});
        }
    };

    useEffect(() => () => exitFullscreen(), []);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await quizService.getQuizById(id);
                setQuiz(fetchedQuiz);
                setRemainingSeconds(Number(fetchedQuiz.duration || 60) * 60);
                setAssessmentStarted(false);
                timeWarningsRef.current = { half: false, ten: false };
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
        if (!assessmentStarted || remainingSeconds === null || remainingSeconds <= 0 || submitting) return undefined;
        const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
        return () => window.clearInterval(timer);
    }, [assessmentStarted, remainingSeconds, submitting]);

    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    const answeredCount = useMemo(() => userAnswers.filter((answer) => Array.isArray(answer) ? answer.length > 0 : Boolean(answer)).length, [userAnswers]);
    const progress = quiz?.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
    const isMultipleAnswer = currentQuestion?.questionType === 'MAQ';
    const flaggedCount = flaggedQuestions.filter(Boolean).length;
    const totalDurationSeconds = Number(quiz?.duration || 60) * 60;
    const timerState = remainingSeconds !== null && remainingSeconds <= totalDurationSeconds * 0.1
        ? 'is-critical'
        : remainingSeconds !== null && remainingSeconds <= totalDurationSeconds * 0.5
            ? 'is-warning'
            : '';

    useEffect(() => {
        if (!assessmentStarted || remainingSeconds === null || !totalDurationSeconds || submitting) return;

        if (remainingSeconds <= totalDurationSeconds * 0.5 && !timeWarningsRef.current.half) {
            timeWarningsRef.current.half = true;
            const message = `Alert: Only ${formatRemainingDuration(remainingSeconds)} left in your assessment.`;
            setTimeWarning(message);
            toast.warn(message);
        }

        if (remainingSeconds <= totalDurationSeconds * 0.1 && !timeWarningsRef.current.ten) {
            timeWarningsRef.current.ten = true;
            const message = `Alert: Only ${formatRemainingDuration(remainingSeconds)} left in your assessment. Please finish and submit soon.`;
            setTimeWarning(message);
            toast.warn(message);
        }
    }, [assessmentStarted, remainingSeconds, submitting, totalDurationSeconds]);

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
        if (!quiz || submitting || submissionStartedRef.current) return;
        submissionStartedRef.current = true;
        setSubmitting(true);
        setError('');
        try {
            const payload = quiz.questions.map((question, index) => ({ questionId: question._id, selectedAnswer: userAnswers[index] || (question.questionType === 'MAQ' ? [] : '') }));
            const result = await attemptService.submitAttempt(id, payload);
            exitFullscreen();
            toast.success('Assessment submitted successfully.');
            history.replace(`/results/${result.attemptId}`, { score: result.score || 0, totalQuestions: result.totalQuestions || quiz.questions.length, passed: result.passed, percentage: result.percentage });
        } catch (submitError) {
            console.error('Error submitting quiz:', submitError);
            setError(submitError.message || 'Unable to submit quiz.');
            submissionStartedRef.current = false;
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (remainingSeconds !== 0 || !quiz || !assessmentStarted || submitting) return undefined;
        submitQuiz();
        return undefined;
    }, [remainingSeconds, quiz, assessmentStarted, submitting]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const currentlyFullscreen = Boolean(document.fullscreenElement);
            setIsFullscreen(currentlyFullscreen);

            if (currentlyFullscreen || !assessmentStarted || submitting || submissionStartedRef.current) return;
            if (intentionalFullscreenExitRef.current) {
                intentionalFullscreenExitRef.current = false;
                return;
            }

            fullscreenExitCountRef.current += 1;
            if (fullscreenExitCountRef.current > 3) {
                toast.error('You exited fullscreen too many times. Your assessment is being submitted.');
                submitQuiz();
                return;
            }

            toast.warn(`Reminder ${fullscreenExitCountRef.current} of 3: please return to fullscreen mode.`);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [assessmentStarted, submitting]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'hidden' || !quiz || !assessmentStarted || submitting || submissionStartedRef.current) return;
            tabSwitchCountRef.current += 1;
            if (tabSwitchCountRef.current > MAX_TAB_SWITCH_WARNINGS) {
                toast.error('You switched tabs too many times. Your assessment is being submitted.');
                submitQuiz();
                return;
            }
            const message = `Reminder ${tabSwitchCountRef.current} of ${MAX_TAB_SWITCH_WARNINGS}: stay on this tab or your assessment will be submitted.`;
            setTabSwitchWarning(message);
            toast.warn(message);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [quiz, assessmentStarted, submitting]);

    const unansweredCount = quiz ? quiz.questions.length - answeredCount : 0;
    const requestSubmit = () => setShowReviewDialog(true);
    const exitAssessment = () => {
        exitFullscreen();
        history.goBack();
    };
    const startAssessment = async () => {
        await enterFullscreen();
        setAssessmentStarted(true);
        toast.info('Assessment started. Good luck!');
    };

    if (error && !quiz) return <div className="mx-auto max-w-xl px-4 py-16 text-center text-red-600">{error}</div>;
    if (!quiz || !currentQuestion) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">Loading assessment...</div>;

    return (
        <div className="quiz-arena min-h-screen pb-24">
            <header className="quiz-arena-header"><div className="quiz-arena-brand"><button type="button" onClick={() => setShowExitDialog(true)} className="quiz-back" aria-label="Exit quiz">←</button><div><h1>Back to Assessments</h1></div></div><div className="quiz-question-meta-actions">{assessmentStarted && !isFullscreen && !submitting && <button type="button" onClick={enterFullscreen} className="quiz-flag-button">Enter fullscreen</button>}<div className="quiz-question-pill"><span /> Question {currentQuestionIndex + 1} <b>of {quiz.questions.length}</b></div></div></header>

            <div className="quiz-attempt-layout">
                <aside className="quiz-navigator-panel" aria-label="Question navigator">
                    <div className="quiz-navigator-heading"><span>Navigator</span><strong>{answeredCount}/{quiz.questions.length}</strong></div>
                    <p className="quiz-navigator-help">Jump to any question</p>
                    <div className="quiz-number-nav">{quiz.questions.map((question, index) => { const answered = Array.isArray(userAnswers[index]) ? userAnswers[index].length > 0 : Boolean(userAnswers[index]); const isCurrent = index === currentQuestionIndex; return <button key={question._id || index} type="button" onClick={() => setCurrentQuestionIndex(index)} className={`${isCurrent ? 'is-current' : ''} ${answered ? 'is-answered' : ''} ${flaggedQuestions[index] ? 'is-flagged' : ''}`} aria-label={`Go to question ${index + 1}${flaggedQuestions[index] ? ', flagged' : ''}`}>{flaggedQuestions[index] && <span className="quiz-nav-flag" aria-hidden="true">⚑</span>}{index + 1}</button>; })}</div>
                    <div className="quiz-navigator-legend"><span><i className="is-current" />Current</span><span><i className="is-answered" />Answered</span><span><i className="is-flagged" />Flagged</span></div>
                    <p className="quiz-flag-count">{flaggedCount} flagged</p>
                </aside>
            <main className="quiz-frame">
                <div className="quiz-utility-row"><span>Question {currentQuestionIndex + 1} of {quiz.questions.length} <b>•</b> {answeredCount} Answered</span><div className="quiz-question-meta-actions"><span className={`quiz-timer ${timerState}`} role="status" aria-live="polite">◷ {formatTime(remainingSeconds || 0)}</span><button type="button" onClick={toggleFlag} className={`quiz-flag-button ${flaggedQuestions[currentQuestionIndex] ? 'is-flagged' : ''}`} aria-pressed={Boolean(flaggedQuestions[currentQuestionIndex])}>{flaggedQuestions[currentQuestionIndex] ? '⚑ Flagged' : '⚐ Flag question'}</button></div></div>
                <div className="quiz-progress-track"><div className="quiz-progress-fill" style={{ width: `${progress}%` }} /></div>
                {tabSwitchWarning && <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">{tabSwitchWarning}</div>}
                {timeWarning && <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800" role="alert">{timeWarning}</div>}
                {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <div className="quiz-question-rule" />
                <h2 className="quiz-question-title">{currentQuestion.question}</h2>
                <p className="quiz-instruction">{isMultipleAnswer ? 'Select all that apply' : 'Select one answer'}</p>
                <div className="quiz-options">{currentQuestion.options.map((option, index) => { const selected = isMultipleAnswer ? (userAnswers[currentQuestionIndex] || []).includes(option.text) : userAnswers[currentQuestionIndex] === option.text; return <label key={index} className={`quiz-option ${selected ? 'is-selected' : ''}`}><input type={isMultipleAnswer ? 'checkbox' : 'radio'} name={`question-${currentQuestionIndex}`} checked={selected} onChange={() => selectAnswer(option.text)} /><span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span></label>; })}</div>
                <div className="quiz-question-footer"><span>{isMultipleAnswer ? 'Multiple answers allowed' : 'One answer allowed'}</span><div className="quiz-card-actions"><button type="button" onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))} disabled={currentQuestionIndex === 0} className="quiz-secondary-button">← Previous</button>{currentQuestionIndex === quiz.questions.length - 1 ? <button type="button" onClick={requestSubmit} className="quiz-primary-button">Review &amp; Submit</button> : <button type="button" onClick={() => setCurrentQuestionIndex((index) => Math.min(index + 1, quiz.questions.length - 1))} className="quiz-primary-button">Next question <span>→</span></button>}</div></div>
            </main>
            </div>

            {showExitDialog && <div className="quiz-dialog-backdrop"><div className="quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title"><h2 id="exit-dialog-title">Leave this assessment?</h2><p>Your answers will not be submitted if you leave now.</p><div><button type="button" onClick={() => setShowExitDialog(false)} className="quiz-secondary-button">Keep working</button><button type="button" onClick={exitAssessment} className="quiz-danger-button">Exit assessment</button></div></div></div>} 
                    {!assessmentStarted && (
                        <div className="quiz-dialog-backdrop">
                            <div className="quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="guidelines-dialog-title">
                                <h2 id="guidelines-dialog-title">Instruction Guidelines</h2>
                                <p>Read these guidelines before starting your assessment.</p>
                                <div className="quiz-timing-summary" aria-label="Assessment timing">
                                    <span><b>Duration</b>{formatRemainingDuration(totalDurationSeconds)}</span>
                                    <span><b>Auto-submit</b>When the timer reaches zero</span>
                                </div>
                                <ul className="quiz-guidelines-list">
                                    <li>Stay on this browser tab. After three reminders, your assessment will be submitted.</li>
                                    <li>Your timer starts when you select Start Assessment.</li>
                                    <li>Your assessment submits automatically when the timer reaches zero.</li>
                                    <li>Review your answers before submitting.</li>
                                </ul>
                                <div className="quiz-dialog-actions">
                                    <button type="button" onClick={startAssessment} className="quiz-primary-button">Start Assessment</button>
                                </div>
                            </div>
                        </div>
                    )}
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
            <h2 id="review-dialog-title">
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
