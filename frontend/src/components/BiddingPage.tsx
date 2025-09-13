import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Item as StartupIdea, itemsAPI, bidsAPI } from '../api';
import { Link } from 'react-router-dom';

const BiddingPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState<{ [key: number]: string }>({});
  const [bidding, setBidding] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchActiveItems();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchActiveItems, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveItems = async () => {
    try {
      const itemsData = await itemsAPI.getActive();
      setItems(itemsData);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (itemId: number, e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = bidAmount[itemId];
    if (!amount) return;

    setBidding(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await bidsAPI.create(itemId, amount);
      setBidAmount(prev => ({ ...prev, [itemId]: '' }));
      // Immediately refresh items to show updated bid
      fetchActiveItems();
    } catch (err: any) {
      setError(err.response?.data?.bid_amount?.[0] || 'Failed to place bid');
    } finally {
      setBidding(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (user?.role !== 'player') {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Player privileges required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Active Startup Ideas</h1>
          <div className="text-sm text-gray-300">
            Updates every 3 seconds
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">No active startup ideas</h3>
            <p className="text-gray-300">Check back later for new startup ideas to bid on.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-semibold text-white mb-2 break-words">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {item.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Starting Price:</span>
                      <span className="font-medium text-white">₹{item.starting_price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Max Amount:</span>
                      <span className="font-medium text-white">₹{item.max_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Highest:</span>
                      <span className="font-bold text-green-400">₹{item.current_highest_bid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Top Bidder:</span>
                      <span className="font-medium text-white">
                        {item.current_highest_bidder || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Bids:</span>
                      <span className="text-white">{item.bid_count}</span>
                    </div>
                  </div>
                  <form onSubmit={(e) => handleBidSubmit(item.id, e)} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Your Bid Amount (₹)
                      </label>
                      <input
                        type="number"
                        min={parseFloat(item.current_highest_bid) + 0.01}
                        max={item.max_amount ? parseFloat(item.max_amount) : undefined}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder={`Min: ₹${(parseFloat(item.current_highest_bid) + 0.01).toFixed(2)}${item.max_amount ? ", Max: ₹" + item.max_amount : ''}`}
                        value={bidAmount[item.id] || ''}
                        onChange={(e) => setBidAmount(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={bidding[item.id] || !bidAmount[item.id]}
                        className="flex-1 bg-indigo-700 hover:bg-indigo-800 disabled:bg-gray-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                      >
                        {bidding[item.id] ? 'Placing Bid...' : 'Place Bid'}
                      </button>
                      <Link
                        to={`/items/${item.id}`}
                        className="bg-gray-700 hover:bg-gray-800 text-gray-200 py-2 px-4 rounded-md text-sm font-medium text-center"
                      >
                        Details
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingPage;