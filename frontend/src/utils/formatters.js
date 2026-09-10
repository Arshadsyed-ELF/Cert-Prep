export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatScore = (score, total) => {
    return `${score} / ${total}`;
};

export const formatPercentage = (score, total) => {
    const percentage = (score / total) * 100;
    return `${percentage.toFixed(2)}%`;
};

export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};