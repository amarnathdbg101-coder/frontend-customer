/**
 * ShopSilo Customer Web App - Real-Time Authenticated Customer Hook
 *
 * Connects to GoBackend Customer WebSocket (/api/v1/customer/ws?token=...)
 * Delivers real-time status updates for pickup reservations (Booked -> Packing -> Ready -> Completed),
 * instant POS counter checkout confirmations, and live Udhar/Khata updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketUrl } from '../utils/websocket';
import { getActiveToken } from '../api/client';
import { cacheEvents, CACHE_EVENTS } from '../utils/cacheEvents';

export const useRealtimeCustomer = (options = {}) => {
  const { onReservationUpdate, onKhataUpdate, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const cleanup = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    const token = getActiveToken();
    if (!token || !enabled || typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return;
    }

    cleanup();

    const wsUrl = getWebSocketUrl(`/api/v1/customer/ws?token=${encodeURIComponent(token)}`);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Heartbeat ping every 25 seconds
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch (_) {}
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (!data || typeof data !== 'object') return;

          const eventType = data.event || data.type;
          const payload = data.payload || {};

          switch (eventType) {
            case 'RESERVATION_STATUS_MUTATED':
            case 'RESERVATION_CANCELLED':
            case 'POS_SALE_COMPLETED': {
              callbacksRef.current.onReservationUpdate?.(payload);
              cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED, payload);
              break;
            }

            case 'KHATA_MUTATED': {
              callbacksRef.current.onKhataUpdate?.(payload);
              cacheEvents.emit(CACHE_EVENTS.KHATA_MUTATED, payload);
              break;
            }

            default:
              break;
          }
        } catch (e) {
          console.warn('[useRealtimeCustomer] Error parsing message:', e);
        }
      };

      ws.onerror = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);

        // Exponential backoff reconnect
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(30000, reconnectAttemptsRef.current * 3000);
        reconnectTimerRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            connect();
          }
        }, delay);
      };
    } catch (err) {
      console.warn('[useRealtimeCustomer] Connection failed:', err);
      setIsConnected(false);
    }
  }, [enabled, cleanup]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [connect, cleanup]);

  return { isConnected };
};

export default useRealtimeCustomer;
