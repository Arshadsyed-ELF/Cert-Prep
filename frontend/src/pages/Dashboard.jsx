import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import quizService from "../services/quizService";
import attemptService from "../services/attemptService";
import readinessService from "../services/readinessService";
import { calculateReadiness } from "../utils/readiness";

const getQuizId = (quiz) => quiz?._id || quiz?.id;
const getCertificationKey = (quiz) => quiz?.certificationType || "Other";
const getPercentage = (attempt) => Number(attempt?.percentage || 0);

const getReadinessMeta = (score, label) => {
  const normalized = String(label || "").toLowerCase();
  if (normalized === "excellent" || score >= 90)
    return {
      label: "Excellent",
      color: "text-emerald-700",
      bar: "bg-emerald-500",
      tone: "bg-emerald-50 border-emerald-100",
    };
  if (normalized === "ready" || score >= 80)
    return {
      label: "Ready",
      color: "text-blue-700",
      bar: "bg-blue-600",
      tone: "bg-blue-50 border-blue-100",
    };
  if (normalized === "almost ready" || score >= 70)
    return {
      label: "Almost Ready",
      color: "text-amber-700",
      bar: "bg-amber-500",
      tone: "bg-amber-50 border-amber-100",
    };
  if (normalized === "needs improvement" || score >= 60)
    return {
      label: "Needs Improvement",
      color: "text-orange-700",
      bar: "bg-orange-500",
      tone: "bg-orange-50 border-orange-100",
    };
  return {
    label: score ? "Not Ready" : "Not Started",
    color: "text-gray-600",
    bar: "bg-gray-400",
    tone: "bg-gray-50 border-gray-200",
  };
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date";

const ProgressRing = ({ score }) => (
  <div
    className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
    style={{
      background: `conic-gradient(#2563eb ${Math.min(Math.max(score, 0), 100)}%, #e5e7eb 0)`,
    }}
  >
    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
      <strong className="text-xl text-gray-900">{Math.round(score)}%</strong>
      <span className="text-[10px] uppercase tracking-wide text-gray-500">
        ready
      </span>
    </div>
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [readinessByType, setReadinessByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [quizData, attemptData, overallData] = await Promise.all([
        quizService.getQuizzes(),
        attemptService.getMyAttempts(),
        readinessService.getOverallReadiness(),
      ]);
      const availableQuizzes = Array.isArray(quizData) ? quizData : [];
      const availableAttempts = Array.isArray(attemptData) ? attemptData : [];
      const certificationScores = Object.fromEntries(
        availableQuizzes.map((quiz) => {
          const quizId = getQuizId(quiz);
          const quizAttempts = availableAttempts.filter(
            (attempt) => String(getQuizId(attempt.quizId)) === String(quizId),
          );
          return [quizId, calculateReadiness(quizAttempts)];
        }),
      );
      setQuizzes(availableQuizzes);
      setAttempts(
        availableAttempts.sort(
          (first, second) =>
            new Date(second.completedAt || second.createdAt) -
            new Date(first.completedAt || first.createdAt),
        ),
      );
      setReadinessByType(certificationScores);
      if (overallData)
        setReadinessByType((current) => ({
          ...current,
          __overall: overallData,
        }));
    } catch (loadError) {
      console.error("Unable to load dashboard data:", loadError);
      setError("Unable to load your dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-red-100 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overall = readinessByType.__overall || {
    score: 0,
    attempts: 0,
    averageScore: 0,
    bestScore: 0,
    recentScore: 0,
    readiness: "Not Assessed",
  };
  const completedCount = attempts.length;
  const averageScore = completedCount
    ? Math.round(
        attempts.reduce((total, attempt) => total + getPercentage(attempt), 0) /
          completedCount,
      )
    : 0;
  const bestScore = completedCount
    ? Math.round(Math.max(...attempts.map(getPercentage)))
    : 0;
  const passRate = completedCount
    ? Math.round(
        (attempts.filter((attempt) => attempt.passed).length / completedCount) *
          100,
      )
    : 0;
  const readyCount = quizzes.filter(
    (quiz) => readinessByType[getQuizId(quiz)]?.score >= 80,
  ).length;
  const totalCertifications = new Set(
    quizzes.map((quiz) => quiz.title || getCertificationKey(quiz)),
  ).size;
  const readinessCards = quizzes.map((quiz) => {
    const data = readinessByType[getQuizId(quiz)] || calculateReadiness([]);
    return {
      type: quiz.title || getCertificationKey(quiz),
      quizzes: [quiz],
      data,
      meta: getReadinessMeta(data.score, data.readiness),
    };
  });
  const exploreQuizzes = readinessCards.flatMap((card) =>
    card.quizzes.map((quiz) => ({ quiz, card })),
  );
  const continueCards = readinessCards
    .filter((card) => card.data.score < 80)
    .sort((first, second) => first.data.score - second.data.score)
    .slice(0, 3);
  const recentAttempts = attempts.slice(0, 5);
  const trendAttempts = attempts.slice(0, 7).reverse();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Your preparation hub
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.name || "Learner"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Track your certification preparation and see how ready you are.
          </p>
        </div>
        <Link
          to="/history"
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          View attempt history →
        </Link>
      </header>
      <nav
        className="flex gap-2 overflow-x-auto border-b border-gray-200"
        aria-label="Dashboard sections"
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === "overview" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === "explore" ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          Explore Certifications
        </button>
      </nav>

      {activeTab === "overview" && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Available certifications</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalCertifications}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Available certifications
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Quizzes completed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {completedCount}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Total attempts completed
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Average score</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {completedCount ? `${averageScore}%` : "Not Started"}
              </p>
              <p className="mt-2 text-xs text-gray-500">Across all quizzes</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Certifications ready</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {readyCount}
              </p>
              <p className="mt-2 text-xs text-gray-500">Ready to take</p>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Certification Readiness
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your readiness is calculated from average, recent, and best
                  scores.
                </p>
              </div>
              <Link
                to="/readiness"
                className="text-sm font-semibold text-blue-700"
              >
                Detailed readiness →
              </Link>
            </div>
            {readinessCards.length ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {readinessCards.map((card) => (
                  <div
                    key={card.type}
                    className={`rounded-xl border p-5 shadow-sm ${card.meta.tone}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Certification
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-gray-900">
                          {card.type}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {card.quizzes[0]?.difficulty || "Easy"} assessment
                        </p>
                      </div>
                      <ProgressRing score={card.data.score || 0} />
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${card.meta.color}`}
                      >
                        {card.meta.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {card.data.attempts || 0} attempts
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                      <div
                        className={`h-full rounded-full ${card.meta.bar}`}
                        style={{
                          width: `${Math.min(card.data.score || 0, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Average</p>
                        <strong>
                          {card.data.attempts
                            ? `${Math.round(card.data.averageScore)}%`
                            : "Not Started"}
                        </strong>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Recent</p>
                        <strong>
                          {card.data.attempts
                            ? `${Math.round(card.data.recentScore)}%`
                            : "Not Started"}
                        </strong>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Best</p>
                        <strong>
                          {card.data.attempts
                            ? `${Math.round(card.data.bestScore)}%`
                            : "Not Started"}
                        </strong>
                      </div>
                    </div>
                    <Link
                      to={`/quiz/${getQuizId(card.quizzes[0])}`}
                      className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                    >
                      {card.data.attempts
                        ? "Continue Preparation"
                        : "Start Quiz"}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                No certifications are available yet.
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Performance overview
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your recent quiz performance
                  </p>
                </div>
                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {passRate}% pass rate
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="mt-1 text-xl font-bold">
                    {completedCount ? `${averageScore}%` : "Not Started"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best score</p>
                  <p className="mt-1 text-xl font-bold">
                    {completedCount ? `${bestScore}%` : "Not Started"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recent score</p>
                  <p className="mt-1 text-xl font-bold">
                    {overall.attempts
                      ? `${Math.round(overall.recentScore)}%`
                      : "Not Started"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total attempts</p>
                  <p className="mt-1 text-xl font-bold">{completedCount}</p>
                </div>
              </div>
              <div className="mt-6 flex h-32 items-end gap-2 border-b border-gray-100">
                {trendAttempts.length ? (
                  trendAttempts.map((attempt, index) => (
                    <div
                      key={attempt._id || index}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                    >
                      <span className="text-[10px] text-gray-500">
                        {Math.round(getPercentage(attempt))}%
                      </span>
                      <div
                        className="w-full max-w-10 rounded-t bg-blue-600"
                        style={{
                          height: `${Math.max(getPercentage(attempt), 5)}%`,
                        }}
                      />
                      <span className="text-[10px] text-gray-400">
                        {index + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="w-full self-center text-center text-sm text-gray-500">
                    Complete a quiz to see your trend.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Continue your preparation
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Focus on your biggest opportunities.
              </p>
              <div className="mt-5 space-y-4">
                {continueCards.length ? (
                  continueCards.map((card) => (
                    <div key={card.type} className="rounded-lg bg-gray-50 p-3">
                      <div className="flex justify-between gap-2">
                        <strong className="text-sm text-gray-800">
                          {card.type}
                        </strong>
                        <span className="text-sm font-semibold text-orange-700">
                          {card.data.attempts
                            ? `${Math.round(card.data.score)}%`
                            : "Not Started"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {card.meta.label}
                      </p>
                      <Link
                        to={`/quiz/${getQuizId(card.quizzes[0])}`}
                        className="mt-3 inline-block text-xs font-semibold text-blue-700"
                      >
                        Practice quiz →
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    You are ready across all available certifications.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Quiz Attempts
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest completed quizzes.
                </p>
              </div>
              <Link
                to="/history"
                className="text-sm font-semibold text-blue-700"
              >
                View all attempts →
              </Link>
            </div>
            {recentAttempts.length ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Quiz</th>
                      <th className="px-5 py-3">Certification</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Result</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt._id} className="border-b last:border-0">
                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {attempt.quizId?.title || "Quiz"}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {attempt.quizId?.certificationType || "Certification"}
                        </td>
                        <td className="px-5 py-4">
                          {attempt.score}{" "}
                          <span className="text-gray-400">
                            ({Math.round(getPercentage(attempt))}%)
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${attempt.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                          >
                            {attempt.passed ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {formatDate(attempt.completedAt || attempt.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/results/${attempt._id}`}
                            className="font-semibold text-blue-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  Your certification journey starts here.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  You have not attempted any quizzes yet.
                </p>
                <Link
                  to="#certifications"
                  className="mt-4 inline-block rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Explore Certifications
                </Link>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "explore" && (
        <section id="certifications" className="explore-arena">
          <div className="mb-8 max-w-2xl">
            <p className="explore-kicker">PICK YOUR ARENA</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {exploreQuizzes.map(({ quiz, card }, index) => (
              <div
                key={getQuizId(quiz)}
                className={`explore-card explore-card-${index % 6}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="explore-category">
                    {quiz.certificationType || card.type}
                  </p>
                  <span
                    className={`explore-level ${index % 3 === 1 ? "explore-level-medium" : ""}`}
                  >
                    {card.data.attempts ? card.meta.label : "START"}
                  </span>
                </div>
                <div className="mt-auto">
                  <h3 className="explore-card-title">{quiz.title}</h3>
                  <p className="explore-card-description">
                    {quiz.description ||
                      "Focused practice to build certification confidence."}
                  </p>
                  <div className="explore-card-meta">
                    <span>{quiz.questions?.length || 0} questions</span>
                    <span>·</span>
                    <span>{quiz.duration || 0} min</span>
                    <Link
                      to={`/quiz/${getQuizId(quiz)}`}
                      className="explore-card-link"
                    >
                      Start quiz <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
