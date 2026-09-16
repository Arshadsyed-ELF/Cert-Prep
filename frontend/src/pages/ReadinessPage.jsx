import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import quizService from "../services/quizService";
import attemptService from "../services/attemptService";
import { calculateReadiness } from "../utils/readiness";

const getQuizId = (quiz) => quiz?._id || quiz?.id;

const ReadinessPage = () => {
  const { user } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReadiness = async () => {
      try {
        const [quizData, attemptData] = await Promise.all([
          quizService.getQuizzes(),
          attemptService.getMyAttempts(),
        ]);
        const quizzes = Array.isArray(quizData) ? quizData : [];
        const attempts = Array.isArray(attemptData) ? attemptData : [];
        setCertificates(
          quizzes.map((quiz) => ({
            quiz,
            readiness: calculateReadiness(
              attempts.filter(
                (attempt) =>
                  String(getQuizId(attempt.quizId)) === String(getQuizId(quiz)),
              ),
            ),
          })),
        );
      } catch (loadError) {
        setError(loadError.message || "Unable to load readiness.");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadReadiness();
  }, [user]);

  if (loading)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-gray-500 sm:px-6">
        Loading certificate readiness...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-red-600 sm:px-6">
        Error: {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        Certification Readiness
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Every certificate is scored independently from only its own attempts.
      </p>
      {certificates.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map(({ quiz, readiness }) => (
            <article
              key={getQuizId(quiz)}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {quiz.certificationType || "Certificate"}
              </p>
              <h2 className="mt-1 break-words text-lg font-bold text-gray-900">
                {quiz.title || "Untitled certificate"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {quiz.difficulty || "Easy"} assessment
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-blue-900">
                    {Math.round(readiness.score)}%
                  </p>
                  <p className="text-sm font-semibold text-gray-600">
                    {readiness.readiness}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {readiness.attempts} attempts
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.min(readiness.score, 100)}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Average</p>
                  <strong>{Math.round(readiness.averageScore)}%</strong>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recent</p>
                  <strong>{Math.round(readiness.recentScore)}%</strong>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best</p>
                  <strong>{Math.round(readiness.bestScore)}%</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No certificates are available yet.
        </p>
      )}
    </div>
  );
};

export default ReadinessPage;
