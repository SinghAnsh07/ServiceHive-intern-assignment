import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getGig } from '../../features/gigs/gigsSlice';
import { createBid, getBidsForGig, hireBid } from '../../features/bids/bidsSlice';

const GigDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { currentGig, isLoading: gigLoading } = useAppSelector((state) => state.gigs);
    const { gigBids, isLoading: bidLoading } = useAppSelector((state) => state.bids);
    const { user } = useAppSelector((state) => state.auth);

    const [showBidForm, setShowBidForm] = useState(false);
    const [bidData, setBidData] = useState({
        message: '',
        price: '',
    });

    const isOwner = currentGig?.ownerId?._id === user?._id;

    useEffect(() => {
        if (id) {
            dispatch(getGig(id));
            // If owner, fetch bids
            if (isOwner) {
                dispatch(getBidsForGig(id));
            }
        }
    }, [dispatch, id, isOwner]);

    const handleBidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const result = await dispatch(createBid({
            gigId: id,
            message: bidData.message,
            price: parseFloat(bidData.price),
        }));

        if (result.type === 'bids/create/fulfilled') {
            setShowBidForm(false);
            setBidData({ message: '', price: '' });
            alert('Bid submitted successfully!');
        }
    };

    const handleHire = async (bidId: string) => {
        if (window.confirm('Are you sure you want to hire this freelancer?')) {
            const result = await dispatch(hireBid(bidId));
            if (result.type === 'bids/hire/fulfilled') {
                alert('Freelancer hired successfully!');
                if (id) {
                    dispatch(getGig(id));
                    dispatch(getBidsForGig(id));
                }
            } else {
                console.error('Hire failed:', result);
                const errorMessage = (result.payload as string) || 'Failed to hire freelancer';
                alert(`Error: ${errorMessage}`);
            }
        }
    };

    if (gigLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!currentGig) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-gray-600">Gig not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
                ← Back
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Gig Details */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{currentGig.title}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentGig.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {currentGig.status === 'open' ? 'Open' : 'Assigned'}
                            </span>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{currentGig.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="text-2xl font-bold text-primary-600">${currentGig.budget}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Posted by</p>
                                <p className="text-lg font-medium text-gray-900">{currentGig.ownerId?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bid Form for non-owners */}
                    {!isOwner && currentGig.status === 'open' && (
                        <div className="card mt-6">
                            {!showBidForm ? (
                                <button
                                    onClick={() => setShowBidForm(true)}
                                    className="btn btn-primary w-full"
                                >
                                    Submit a Bid
                                </button>
                            ) : (
                                <form onSubmit={handleBidSubmit} className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4">Submit Your Bid</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Proposal
                                        </label>
                                        <textarea
                                            value={bidData.message}
                                            onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                                            required
                                            rows={4}
                                            className="input resize-none"
                                            placeholder="Explain why you're the best fit for this job..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Price (USD)
                                        </label>
                                        <input
                                            type="number"
                                            value={bidData.price}
                                            onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="input"
                                            placeholder="450"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="submit" className="btn btn-primary flex-1">
                                            Submit Bid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowBidForm(false)}
                                            className="btn btn-secondary flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Bids Section (for owners only) */}
                {isOwner && (
                    <div className="lg:col-span-1">
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4">
                                Bids ({gigBids.length})
                            </h2>

                            {bidLoading ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : gigBids.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No bids yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {gigBids.map((bid) => (
                                        <div
                                            key={bid._id}
                                            className={`p-4 rounded-lg border-2 ${bid.status === 'hired'
                                                ? 'border-green-500 bg-green-50'
                                                : bid.status === 'rejected'
                                                    ? 'border-gray-300 bg-gray-50 opacity-60'
                                                    : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold text-gray-900">
                                                    {bid.freelancerId?.name}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${bid.status === 'hired'
                                                    ? 'bg-green-100 text-green-800'
                                                    : bid.status === 'rejected'
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{bid.message}</p>

                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-bold text-primary-600">${bid.price}</p>
                                                {bid.status === 'pending' && currentGig.status === 'open' && (
                                                    <button
                                                        onClick={() => handleHire(bid._id)}
                                                        className="btn btn-primary text-sm py-1 px-3"
                                                    >
                                                        Hire
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GigDetail;
