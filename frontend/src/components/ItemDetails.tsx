import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Item as StartupIdea, BidHistory, itemsAPI } from '../api';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<StartupIdea | null>(null);
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const itemData = await itemsAPI.getById(parseInt(id!));
        setItem(itemData);
      } catch (err: any) {
        setError('Failed to fetch item details');
      } finally {
        setLoading(false);
      }
    };

    const fetchBidHistory = async () => {
      try {
        const historyData = await itemsAPI.getBidHistory(parseInt(id!));
        setBidHistory(historyData);
      } catch (err: any) {
        // Handle error silently for bid history
      }
    };

    if (id) {
      fetchItemDetails();
      fetchBidHistory();
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchItemDetails();
        fetchBidHistory();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Item not found'}
        </div>
      </div>
    );
  }

  const isWinner = !item.is_active && item.current_highest_bidder === user?.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-700 hover:bg-gray-800 text-gray-200 px-4 py-2 rounded-md text-sm"
        >
          ← Back
        </button>

        <div className="bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">{item.title}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      item.is_active
                        ? 'bg-green-900 text-green-200'
                        : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {item.is_active ? 'Active Startup' : 'Startup Ended'}
                  </span>
                  {isWinner && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-900 text-yellow-200">
                      🎉 You Won!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Startup Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-gray-200 mt-1">{item.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Starting Price:</span>
                    <span className="ml-2 font-medium text-white">₹{item.starting_price}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Amount:</span>
                    <span className="ml-2 font-medium text-white">₹{item.max_amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created by:</span>
                    <span className="ml-2 font-medium text-white">{item.created_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created on:</span>
                    <span className="ml-2 font-medium text-white">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Current Status</h3>
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Highest Bid:</span>
                    <span className="text-2xl font-bold text-green-400">
                      ₹{item.current_highest_bid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Top Bidder:</span>
                    <span className="font-medium text-white">
                      {item.current_highest_bidder || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Bids:</span>
                    <span className="font-medium text-white">{item.bid_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {bidHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Bid History</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bidHistory.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          index === 0 ? 'bg-green-100' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{bid.user}</span>
                          {index === 0 && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                              Highest
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{bid.bid_amount}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(bid.bid_time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!item.is_active && item.current_highest_bidder && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  🎉 Auction Winner
                </h3>
                <p className="text-yellow-700">
                  <strong>{item.current_highest_bidder}</strong> won this auction with a bid of{' '}
                  <strong>₹{item.current_highest_bid}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;