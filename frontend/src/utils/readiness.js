const scoreOf = (attempt) => Number(attempt?.percentage || 0);

export const calculateReadiness = (attempts = []) => {
  const orderedAttempts = [...attempts].sort(
    (first, second) => new Date(first.completedAt || first.createdAt) - new Date(second.completedAt || second.createdAt),
  );

  if (!orderedAttempts.length) {
    return { score: 0, attempts: 0, averageScore: 0, recentScore: 0, bestScore: 0, readiness: 'Not Assessed' };
  }

  const scores = orderedAttempts.map(scoreOf);
  const averageScore = scores.reduce((total, score) => total + score, 0) / scores.length;
  const recentScore = scores[scores.length - 1];
  const bestScore = Math.max(...scores);
  const score = Number(((averageScore * 0.5) + (recentScore * 0.3) + (bestScore * 0.2)).toFixed(2));
  const readiness = score >= 90 ? 'Excellent' : score >= 80 ? 'Ready' : score >= 70 ? 'Almost Ready' : score >= 60 ? 'Needs Improvement' : 'Not Ready';

  return { score, attempts: scores.length, averageScore: Number(averageScore.toFixed(2)), recentScore, bestScore, readiness };
};
