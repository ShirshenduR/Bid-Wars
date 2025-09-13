import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Item, BidHistory, itemsAPI } from '../api';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<Item | null>(null);
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
        >
          ← Back
        </button>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.is_active ? 'Active Auction' : 'Auction Ended'}
                  </span>
                  {isWinner && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      🎉 You Won!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <p className="text-gray-900 mt-1">{item.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Starting Price:</span>
                    <span className="ml-2 font-medium">${item.starting_price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created by:</span>
                    <span className="ml-2 font-medium">{item.created_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created on:</span>
                    <span className="ml-2 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Highest Bid:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${item.current_highest_bid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Top Bidder:</span>
                    <span className="font-medium">
                      {item.current_highest_bidder || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Bids:</span>
                    <span className="font-medium">{item.bid_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {bidHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid History</h3>
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
                          <div className="font-bold text-green-600">${bid.bid_amount}</div>
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
                  <strong>${item.current_highest_bid}</strong>
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