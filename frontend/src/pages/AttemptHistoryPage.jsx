import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import attemptService from '../services/attemptService';

const AttemptHistoryPage = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await attemptService.getMyAttempts();
                setAttempts(data || []);
            } catch (error) {
                console.error('Error fetching attempt history:', error);
                history.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, [history]);

    if (loading) {
        return <div className="mx-auto max-w-7xl px-4 py-10 text-center text-gray-500 sm:px-6 lg:px-8">Loading attempts...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="mb-4 text-2xl font-bold sm:text-3xl">My Attempt History</h1>
            {attempts.length === 0 ? (
                <p>You haven't attempted any quizzes yet.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white"><table className="min-w-[48rem] w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Quiz Title</th>
                            <th className="border px-4 py-2">Score</th>
                            <th className="border px-4 py-2">Percentage</th>
                            <th className="border px-4 py-2">Status</th>
                            <th className="border px-4 py-2">Date</th>
                            <th className="border px-4 py-2">Review</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.map((attempt) => (
                            <tr key={attempt._id}>
                                <td className="border px-4 py-2">{attempt.quizId?.title || 'Quiz'}</td>
                                <td className="border px-4 py-2">{attempt.score}</td>
                                <td className="border px-4 py-2">{Math.round(attempt.percentage || 0)}%</td>
                                <td className="border px-4 py-2">{attempt.passed ? 'Passed' : 'Failed'}</td>
                                <td className="border px-4 py-2">{new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}</td>
                                <td className="border px-4 py-2 text-center"><Link to={`/results/${attempt._id}`} className="inline-flex rounded-md bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">Review</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>
            )}
        </div>
    );
};

export default AttemptHistoryPage;
