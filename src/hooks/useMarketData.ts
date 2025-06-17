
import { useState, useEffect } from 'react';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simulate real-time data updates
      const interval = setInterval(() => {
        const mockData = {
          egx30: {
            value: 18457.23 + (Math.random() - 0.5) * 50,
            change: 2.34 + (Math.random() - 0.5) * 0.5,
            volume: 1200000000 + Math.random() * 100000000
          },
          timestamp: Date.now()
        };
        setMarketData(mockData);
      }, 5000);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  return { marketData, isConnected };
};
