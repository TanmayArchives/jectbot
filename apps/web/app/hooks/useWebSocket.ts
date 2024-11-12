import { useEffect, useRef } from 'react';
import { logger } from '@repo/web3/utils/logger';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe';
  channel: string;
  params?: any;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribedChannels = useRef<Set<string>>(new Set());

  useEffect(() => {
    connect();
    return () => {
      cleanup();
    };
  }, []);

  const connect = () => {
    try {
      wsRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      wsRef.current.onopen = () => {
        logger.info('WebSocket connected');
        // Resubscribe to previous channels
        subscribedChannels.current.forEach(channel => {
          const [channelName, params] = channel.split(':');
          subscribe(channelName, params ? JSON.parse(params) : undefined);
        });
      };

      wsRef.current.onclose = () => {
        logger.info('WebSocket disconnected');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = (error) => {
        logger.error('WebSocket error:', error);
      };
    } catch (error) {
      logger.error('Error creating WebSocket connection:', error);
    }
  };

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const subscribe = (channel: string, params?: any) => {
    if (!wsRef.current) return;

    const message: WebSocketMessage = {
      type: 'subscribe',
      channel,
      params
    };

    wsRef.current.send(JSON.stringify(message));
    subscribedChannels.current.add(`${channel}:${JSON.stringify(params)}`);
  };

  const unsubscribe = (channel: string, params?: any) => {
    if (!wsRef.current) return;

    const message: WebSocketMessage = {
      type: 'unsubscribe',
      channel,
      params
    };

    wsRef.current.send(JSON.stringify(message));
    subscribedChannels.current.delete(`${channel}:${JSON.stringify(params)}`);
  };

  const on = (eventHandler: (data: any) => void) => {
    if (!wsRef.current) return;

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        eventHandler(data);
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
      }
    };
  };

  return {
    subscribe,
    unsubscribe,
    on,
    ws: wsRef.current
  };
} 