import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getMyBids } from '../../features/bids/bidsSlice';

const MyBids: React.FC = () => {
    const dispatch = useAppDispatch();
    const { myBids, isLoading } = useAppSelector((state) => state.bids);

    useEffect(() => {
        dispatch(getMyBids());
    }, [dispatch]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
                <p className="text-gray-600">Track all your submitted bids and their status.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : myBids.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">You haven't submitted any bids yet.</p>
                    <Link to="/" className="btn btn-primary inline-block">
                        Browse Gigs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {myBids.map((bid: any) => (
                        <div
                            key={bid._id}
                            className={`card ${bid.status === 'hired'
                                    ? 'border-2 border-green-500 bg-green-50'
                                    : bid.status === 'rejected'
                                        ? 'border-2 border-gray-300 bg-gray-50'
                                        : ''
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            to={`/gigs/${bid.gigId?._id}`}
                                            className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                                        >
                                            {bid.gigId?.title}
                                        </Link>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bid.status === 'hired'
                                                ? 'bg-green-100 text-green-800'
                                                : bid.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {bid.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-3">{bid.message}</p>

                                    <div className="flex gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-500">Your Bid:</span>
                                            <span className="ml-2 font-semibold text-primary-600">${bid.price}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Gig Budget:</span>
                                            <span className="ml-2 font-semibold">${bid.gigId?.budget}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Gig Status:</span>
                                            <span className={`ml-2 font-semibold ${bid.gigId?.status === 'open' ? 'text-green-600' : 'text-gray-600'
                                                }`}>
                                                {bid.gigId?.status}
                                            </span>
                                        </div>
                                    </div>

                                    {bid.status === 'hired' && (
                                        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                                            <p className="text-green-800 font-medium">
                                                🎉 Congratulations! You've been hired for this gig!
                                            </p>
                                        </div>
                                    )}

                                    {bid.status === 'rejected' && (
                                        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                                            <p className="text-gray-700">
                                                This bid was not selected. Keep trying!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBids;
