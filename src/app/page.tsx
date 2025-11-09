'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { Music } from 'lucide-react';

const PI1_IP = process.env.NEXT_PUBLIC_PI1_IP || '100.104.127.38';
const PI2_IP = process.env.NEXT_PUBLIC_PI2_IP || '100.114.175.61';
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '5000';

export default function Home() {
  const [players] = useState([
    {
      id: 'pi1',
      name: 'Music Player 1',
      ip: PI1_IP,
      apiUrl: `http://${PI1_IP}:${API_PORT}`,
    },
    {
      id: 'pi2',
      name: 'Music Player 2',
      ip: PI2_IP,
      apiUrl: `http://${PI2_IP}:${API_PORT}`,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Resort Music Control
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your music players remotely via Tailscale
          </p>
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              name={player.name}
              ip={player.ip}
              apiUrl={player.apiUrl}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Connected via Tailscale • Secure Remote Access</p>
        </div>
      </div>
    </div>
  );
}
