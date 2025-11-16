'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import AuthGate from '@/components/AuthGate';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Music, Settings, LogOut, Plus, RefreshCw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function Dashboard() {
  const { user, logout } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPI, setShowAddPI] = useState(false);

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/players`);
      const data = await response.json();
      if (data.success) {
        setPlayers(data.players);
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPI = async (piData: any) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/pis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(piData)
      });
      
      if (response.ok) {
        setShowAddPI(false);
        fetchPlayers();
      }
    } catch (error) {
      console.error('Failed to add PI:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPlayers();
  };

  const handleDiscover = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/discover`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchPlayers();
      }
    } catch (error) {
      console.error('Failed to discover PIs:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Resort Music Control
                </h1>
                <p className="text-gray-600">
                  Manage your music players remotely
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={handleDiscover}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Discover PIs"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAddPI(true)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add PI"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}
              {user?.role === 'viewer' && (
                <span className="text-xs text-gray-500 px-2">View-only access</span>
              )}
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-bold text-gray-800">{players.length}</p>
              </div>
              <Music className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {players.filter(p => p.status === 'online').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {players.filter(p => p.status === 'offline').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Player Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Found</h3>
            <p className="text-gray-600 mb-4">
              No music players are currently available. Try discovering players or adding one manually.
            </p>
            {user?.role === 'admin' && (
              <div className="space-x-3">
                <button
                  onClick={handleDiscover}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Discover Players
                </button>
                <button
                  onClick={() => setShowAddPI(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add Player Manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.name}
                location={player.location}
                status={player.status}
                apiUrl={`${API_BASE}/api/${player.id}`}
                userRole={user?.role}
              />
            ))}
          </div>
        )}

        {/* Add PI Modal */}
        {showAddPI && (
          <AddPIModal
            onClose={() => setShowAddPI(false)}
            onSubmit={handleAddPI}
          />
        )}
      </div>
    </div>
  );
}

function AddPIModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    ip: '',
    name: '',
    location: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Music Player</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({...formData, ip: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100.104.127.38"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Music Player 3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Lobby Area"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </AuthProvider>
  );
}
