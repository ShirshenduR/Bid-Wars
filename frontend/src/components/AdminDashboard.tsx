import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Item, itemsAPI } from '../api';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            to="/admin/create-item"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Item
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                No items found. Create your first item to get started.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Starting Price: ${item.starting_price}</span>
                        <span>Current Highest: ${item.current_highest_bid}</span>
                        <span>Bids: {item.bid_count}</span>
                        {item.current_highest_bidder && (
                          <span>Top Bidder: {item.current_highest_bidder}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Link
                        to={`/items/${item.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-3 py-1 rounded text-sm text-white ${
                          item.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
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