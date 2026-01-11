import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getMyGigs } from '../../features/gigs/gigsSlice';

const MyGigs: React.FC = () => {
    const dispatch = useAppDispatch();
    const { myGigs, isLoading } = useAppSelector((state) => state.gigs);

    useEffect(() => {
        dispatch(getMyGigs());
    }, [dispatch]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Posted Gigs</h1>
                <Link to="/create-gig" className="btn btn-primary">
                    Post New Gig
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : myGigs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">You haven't posted any gigs yet.</p>
                    <Link to="/create-gig" className="btn btn-primary inline-block">
                        Post Your First Gig
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myGigs.map((gig: any) => (
                        <Link
                            key={gig._id}
                            to={`/gigs/${gig._id}`}
                            className="card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                                    {gig.title}
                                </h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${gig.status === 'open'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {gig.status === 'open' ? 'Open' : 'Assigned'}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="text-lg font-bold text-primary-600">${gig.budget}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyGigs;
