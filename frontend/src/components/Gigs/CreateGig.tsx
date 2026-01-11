import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createGig } from '../../features/gigs/gigsSlice';

const CreateGig: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
    });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.gigs);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const gigData = {
            ...formData,
            budget: parseFloat(formData.budget),
        };

        const result = await dispatch(createGig(gigData));
        if (result.type === 'gigs/create/fulfilled') {
            navigate('/my-gigs');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Gig</h1>
                <p className="text-gray-600">Create a job posting and receive bids from freelancers.</p>
            </div>

            <div className="card">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="e.g., Build a React Website"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={6}
                            className="input resize-none"
                            placeholder="Describe the job requirements, deliverables, and any other important details..."
                        />
                    </div>

                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                            Budget (USD) *
                        </label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="input"
                            placeholder="500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary flex-1"
                        >
                            {isLoading ? 'Posting...' : 'Post Gig'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
