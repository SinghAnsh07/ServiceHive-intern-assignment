import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getGigs } from '../../features/gigs/gigsSlice';

const GigList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { gigs, isLoading } = useAppSelector((state) => state.gigs);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(getGigs(search));
    }, [dispatch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(getGigs(search));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Open Gigs</h1>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search gigs by title or description..."
                        className="input flex-1"
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading gigs...</p>
                </div>
            ) : gigs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No gigs found. Be the first to post one!</p>
                    <Link to="/create-gig" className="btn btn-primary mt-4 inline-block">
                        Post a Gig
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {gigs.map((gig: any) => (
                        <Link
                            key={gig._id}
                            to={`/gigs/${gig._id}`}
                            className="card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                                    {gig.title}
                                </h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Open
                                </span>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">Budget</p>
                                    <p className="text-lg font-bold text-primary-600">${gig.budget}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Posted by</p>
                                    <p className="text-sm font-medium text-gray-900">{gig.ownerId?.name}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GigList;
