import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import attemptService from '../services/attemptService';

const ResultsPage = () => {
    const location = useLocation();
    const { id } = useParams();
    const [attempt, setAttempt] = useState(location.state || null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return undefined;
        const loadAttempt = async () => {
            try {
                setAttempt(await attemptService.getAttemptDetails(id));
            } catch (loadError) {
                setError(loadError.message || 'Unable to load result.');
            } finally {
                setLoading(false);
            }
        };
        loadAttempt();
        return undefined;
    }, [id]);

    if (loading) return <div className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">Loading result...</div>;
    if (error) return <div className="mx-auto max-w-2xl px-4 py-12 text-center text-red-600">{error}</div>;

    const score = attempt?.score || 0;
    const questions = attempt?.quizId?.questions || [];
    const totalQuestions = attempt?.totalQuestions || questions.length || 0;
    const passed = Boolean(attempt?.passed);
    const percentage = attempt?.percentage ?? (totalQuestions ? Math.round((score / totalQuestions) * 100) : 0);
    const answersByQuestionId = new Map((attempt?.answers || []).map((answer) => [String(answer.questionId), answer]));
    const formatAnswer = (answer) => {
        if (Array.isArray(answer)) return answer.length ? answer.join(', ') : 'No answer selected';
        return answer || 'No answer selected';
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 sm:text-sm">Quiz result</p>
                <h1 className="mt-2 break-words text-2xl font-bold text-gray-900 sm:text-3xl">{attempt?.quizId?.title || 'Quiz Completed!'}</h1>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">{score} / {totalQuestions} correct answers</p>
                <p className="mt-5 text-4xl font-bold text-blue-900 sm:text-5xl">{Math.round(percentage)}%</p>
                <p className={`mt-2 text-base font-semibold sm:text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>{passed ? 'PASSED' : 'FAILED'}</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    {/* <Link to="/dashboard" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Back to dashboard</Link>
                    <a href="#question-review" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Review questions</a> */}
                </div>
            </section>

            <section id="question-review" className="mt-8 scroll-mt-6">
                <div className="mb-4"><h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Question review</h2><p className="mt-1 text-sm text-gray-500">Compare your answers with the correct answers and explanations.</p></div>
                {questions.length ? <div className="space-y-4">{questions.map((question, index) => {
                    const answer = answersByQuestionId.get(String(question._id));
                    const correct = Boolean(answer?.isCorrect);
                    return <article key={question._id || index} className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 ${correct ? 'border-emerald-200' : 'border-red-200'}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Question {index + 1}</p><h3 className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">{question.question}</h3></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{correct ? 'Correct' : 'Incorrect'}</span></div>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-lg bg-gray-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your answer</dt><dd className="mt-1 break-words font-medium text-gray-800">{formatAnswer(answer?.selectedAnswer)}</dd></div><div className="rounded-lg bg-emerald-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Correct answer</dt><dd className="mt-1 break-words font-medium text-emerald-900">{formatAnswer(question.correctAnswer)}</dd></div></dl>
                        {question.explanation && <div className="mt-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-950"><span className="font-semibold">Explanation: </span>{question.explanation}</div>}
                    </article>;
                })}</div> : <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Question review is not available for this result.</div>}
            </section>
            </div>
    );
};

export default ResultsPage;
