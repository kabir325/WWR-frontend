'use client';

import { useState } from 'react';
import PlayerCardProxy from '@/components/PlayerCardProxy';
import { Music, Server } from 'lucide-react';

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || 'http://localhost:3001';

export default function HomeProxy() {
  const [players] = useState([
    {
      id: 'pi1',
      name: 'Music Player 1',
    },
    {
      id: 'pi2',
      name: 'Music Player 2',
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
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Server className="w-4 h-4" />
            Managed via EC2 Proxy Gateway
          </p>
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => (
            <PlayerCardProxy
              key={player.id}
              piId={player.id}
              name={player.name}
              proxyUrl={PROXY_URL}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure Connection via EC2 Proxy • No Tailscale Required</p>
        </div>
      </div>
    </div>
  );
}
