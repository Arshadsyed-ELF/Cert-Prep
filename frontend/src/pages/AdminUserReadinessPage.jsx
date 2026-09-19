import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import adminService from '../services/adminService';

const AdminUserReadinessPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadReadiness = async () => {
            try {
                const readinessData = await adminService.getUserReadiness(id);
                setData(readinessData);
            } catch (loadError) {
                setError(loadError.response?.data?.message || 'Unable to load user readiness.');
            } finally {
                setLoading(false);
            }
        };
        loadReadiness();
    }, [id]);

    if (loading) return <p className="text-sm text-gray-500">Loading user readiness...</p>;
    if (error) return <p className="text-sm text-red-600">{error}</p>;

    const user = data?.user;
    const readiness = data?.readiness || {};
    const attempts = data?.attempts || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <button type="button" onClick={() => history.push('/admin/users')} className="mb-3 text-sm text-blue-700 hover:underline">
                        ← Back to users
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{user?.name}&apos;s readiness</h1>
                    <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Readiness</p>
                    <p className="mt-2 text-xl font-bold text-blue-700">{readiness.readiness || 'Not Assessed'}</p>
                    <p className="mt-1 text-sm text-gray-500">Score: {readiness.score ?? 0}%</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total attempts</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{readiness.attempts ?? attempts.length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Average score</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{readiness.averageScore ?? 0}%</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Best / recent</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{readiness.bestScore ?? 0}%</p>
                    <p className="mt-1 text-sm text-gray-500">Recent: {readiness.recentScore ?? 0}%</p>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Attempt history</h2>
                {attempts.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[42rem] text-left text-sm">
                            <thead className="border-b text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="pb-3">Assessment</th>
                                    <th className="pb-3">Score</th>
                                    <th className="pb-3">Percentage</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt) => (
                                    <tr key={attempt._id} className="border-b last:border-0">
                                        <td className="py-3 font-medium text-gray-800">{attempt.quiz?.title || 'Assessment'}</td>
                                        <td className="py-3 text-gray-500">{attempt.score}</td>
                                        <td className="py-3 text-gray-500">{Math.round(attempt.percentage || 0)}%</td>
                                        <td className="py-3 text-gray-500">{attempt.passed ? 'Passed' : 'Failed'}</td>
                                        <td className="py-3 text-gray-500">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500">No attempts yet.</p>}
            </section>
        </div>
    );
};

export default AdminUserReadinessPage;
