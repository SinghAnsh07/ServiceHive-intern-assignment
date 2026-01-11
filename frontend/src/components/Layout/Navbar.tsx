import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useSocket } from '../../context/SocketContext';

const Navbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { notifications, clearNotifications } = useSocket();
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-600">GigFlow</h1>
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                Browse Gigs
                            </Link>
                            <Link
                                to="/my-gigs"
                                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                My Gigs
                            </Link>
                            <Link
                                to="/my-bids"
                                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                My Bids
                            </Link>
                            <Link
                                to="/create-gig"
                                className="btn btn-primary"
                            >
                                Post a Gig
                            </Link>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    {notifications.length > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearNotifications}
                                                    className="text-sm text-primary-600 hover:text-primary-700"
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No new notifications
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200">
                                                {notifications.map((notification, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notification.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className="text-gray-700 font-medium">{user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="btn btn-secondary">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
