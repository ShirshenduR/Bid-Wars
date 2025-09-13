import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Item, itemsAPI, bidsAPI } from '../api';
import { Link } from 'react-router-dom';

const BiddingPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Active Auctions</h1>
          <div className="text-sm text-gray-500">
            Updates every 3 seconds
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active auctions</h3>
            <p className="text-gray-500">Check back later for new items to bid on.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Starting Price:</span>
                      <span className="font-medium">${item.starting_price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Highest:</span>
                      <span className="font-bold text-green-600">
                        ${item.current_highest_bid}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Top Bidder:</span>
                      <span className="font-medium">
                        {item.current_highest_bidder || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Bids:</span>
                      <span>{item.bid_count}</span>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleBidSubmit(item.id, e)} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Bid Amount ($)
                      </label>
                      <input
                        type="number"
                        min={parseFloat(item.current_highest_bid) + 0.01}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder={`Minimum: $${(parseFloat(item.current_highest_bid) + 0.01).toFixed(2)}`}
                        value={bidAmount[item.id] || ''}
                        onChange={(e) => setBidAmount(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={bidding[item.id] || !bidAmount[item.id]}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium"
                      >
                        {bidding[item.id] ? 'Placing Bid...' : 'Place Bid'}
                      </button>
                      
                      <Link
                        to={`/items/${item.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium text-center"
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