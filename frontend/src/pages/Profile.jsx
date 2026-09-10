import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updatePassword } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const { theme, setTheme } = useTheme();
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const displayName = user?.name || 'Learner';
    const initial = displayName.charAt(0).toUpperCase();

    const changeTheme = (nextTheme) => {
        setTheme(nextTheme);
        toast.success(`${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} appearance selected.`);
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        if (passwords.newPassword.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage('Passwords do not match.');
            toast.error('Passwords do not match.');
            return;
        }
        setSavingPassword(true);
        try {
            const response = await updatePassword(passwords);
            setMessage(response.message || 'Password updated successfully.');
            toast.success(response.message || 'Password updated successfully.');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Unable to update password.';
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSavingPassword(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '♙' },
        { id: 'security', label: 'Security', icon: '♢' },
        { id: 'preferences', label: 'Preferences', icon: '⚙' },
    ];

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div><h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1><p className="mt-1 text-sm text-gray-600">Manage your account, profile, and preferences</p></div>
            <nav className="grid grid-cols-3 rounded-xl bg-gray-100 p-1" aria-label="Settings sections">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setMessage(''); }} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>)}</nav>
            {message && <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

            {activeTab === 'profile' && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"><div className="border-b border-gray-200 pb-5"><h2 className="text-xl font-bold text-gray-900">♙ Profile Information</h2><p className="mt-1 text-sm text-gray-500">Your personal information and account identity</p><div className="mt-6 flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-400 text-2xl font-bold text-white">{initial}</div><div><h3 className="font-semibold text-gray-900">{displayName}</h3><p className="text-sm text-gray-500">{user?.email || 'Email unavailable'}</p><p className="mt-1 text-xs text-gray-500">Profile photo management is not available yet.</p></div></div></div><div className="grid gap-5 pt-6 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Full name<input value={displayName} readOnly className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700" /></label><label className="text-sm font-medium text-gray-700">Email<input value={user?.email || ''} readOnly className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500" /></label><label className="text-sm font-medium text-gray-700 sm:col-span-2">Account role<input value={user?.role || 'user'} readOnly className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 capitalize text-gray-700" /></label></div></section>}

            {activeTab === 'security' && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"><div className="border-b border-gray-200 pb-5"><h2 className="text-xl font-bold text-gray-900">♢ Change Password</h2><p className="mt-1 text-sm text-gray-500">Update your account password</p></div><form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-4 pt-6"><label className="block text-sm font-medium text-gray-700">Current password<input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} placeholder="Enter current password" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label><label className="block text-sm font-medium text-gray-700">New password<input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} placeholder="Enter new password" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label><label className="block text-sm font-medium text-gray-700">Confirm password<input type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} placeholder="Confirm new password" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" required /></label><p className="text-xs text-gray-500">Password must be at least 6 characters long.</p><button type="submit" disabled={savingPassword} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-gray-400">{savingPassword ? 'Updating...' : '♢ Update Password'}</button></form></section>}

            {activeTab === 'preferences' && <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"><div className="border-b border-gray-200 pb-5"><h2 className="text-xl font-bold text-gray-900">⚙ Appearance</h2><p className="mt-1 text-sm text-gray-500">Choose your preferred theme</p></div><div className="grid gap-3 pt-6 sm:grid-cols-3">{['light', 'dark', 'system'].map((option) => <button key={option} type="button" onClick={() => changeTheme(option)} className={`rounded-xl border p-5 text-center transition ${theme === option ? 'border-blue-900 bg-blue-50 ring-1 ring-blue-900' : 'border-gray-200 hover:border-blue-300'}`}><span className="block text-2xl">{option === 'light' ? '☼' : option === 'dark' ? '☾' : '▣'}</span><span className="mt-2 block text-sm font-semibold capitalize text-gray-800">{option}</span></button>)}</div><p className="mt-5 text-xs text-gray-500">Your preference is saved locally on this device.</p></section>}

            <div className="flex flex-wrap gap-3"><Link to="/dashboard" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Back to dashboard</Link></div>
        </div>
    );
};

export default Profile;
