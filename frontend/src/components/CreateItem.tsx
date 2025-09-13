import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { itemsAPI } from '../api';

const CreateStartupIdea: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await itemsAPI.create({
        title,
        description,
        starting_price: startingPrice,
        max_amount: maxAmount,
        is_active: true,
      });
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.title?.[0] || 
               err.response?.data?.starting_price?.[0] || 
               err.response?.data?.max_amount?.[0] || 
               'Failed to create startup idea');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 shadow rounded-lg px-6 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create Startup Idea</h2>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-200">
                Startup Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter startup title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter startup description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="starting-price" className="block text-sm font-medium text-gray-200">
                Starting Price (₹)
              </label>
              <input
                type="number"
                id="starting-price"
                min="0.01"
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="max-amount" className="block text-sm font-medium text-gray-200">
                Max Amount (₹)
              </label>
              <input
                type="number"
                id="max-amount"
                min="0.01"
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Maximum bid amount"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Startup Idea'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-gray-200 py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStartupIdea;