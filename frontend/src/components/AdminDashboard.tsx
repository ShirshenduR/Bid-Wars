import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Item as StartupIdea, itemsAPI } from '../api';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const itemsData = await itemsAPI.getAll();
      setItems(itemsData);
    } catch (err: any) {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (itemId: number) => {
    try {
      await itemsAPI.toggleStatus(itemId);
      // Refresh the items list
      fetchItems();
    } catch (err: any) {
      setError('Failed to toggle item status');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link
            to="/admin/create-item"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Startup Idea
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-700">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-300">
                No startup ideas found. Create your first startup idea to get started.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.is_active
                                ? 'bg-green-900 text-green-200'
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 mt-1">{item.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                        <span>Starting Price: ${item.starting_price}</span>
                        <span>Max Amount: ${item.max_amount}</span>
                        <span>Current Highest: ${item.current_highest_bid}</span>
                        <span>Bids: {item.bid_count}</span>
                        {item.current_highest_bidder && (
                          <span>Top Bidder: {item.current_highest_bidder}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Link
                        to={`/items/${item.id}`}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-3 py-1 rounded text-sm text-white ${
                          item.is_active
                            ? 'bg-red-700 hover:bg-red-800'
                            : 'bg-green-700 hover:bg-green-800'
                        }`}
                      >
                        {item.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;