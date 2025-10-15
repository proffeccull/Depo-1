import AsyncStorage from '@react-native-async-storage/async-storage';

// WebSocket Configuration
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.chaingive.com';
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// WebSocket Event Types
export enum WSEventType {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  RECONNECT = 'reconnect',
  ERROR = 'error',

  // Gamification events
  CREW_UPDATE = 'crew_update',
  LEADERBOARD_UPDATE = 'leaderboard_update',
  MISSION_COMPLETE = 'mission_complete',
  CHALLENGE_UPDATE = 'challenge_update',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  COIN_BALANCE_UPDATE = 'coin_balance_update',
  LEVEL_UP = 'level_up',

  // Notification events
  NOTIFICATION = 'notification',
  SYSTEM_MESSAGE = 'system_message',
}

// Message Types
interface WSMessage {
  type: WSEventType;
  payload: any;
  timestamp: string;
  userId?: string;
}

interface WSCallback {
  id: string;
  eventType: WSEventType;
  callback: (data: any) => void;
}

// WebSocket Manager Class
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private callbacks: Map<string, WSCallback> = new Map();
  private isConnected = false;
  private userId: string | null = null;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      this.userId = await AsyncStorage.getItem('userId');
      if (this.userId) {
        this.connect();
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  private connect() {
    if (!this.userId) return;

    try {
      const wsUrl = `${WS_BASE_URL}/ws?userId=${this.userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private onOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit(WSEventType.CONNECT, { connected: true });
  }

  private onMessage(event: any) {
    try {
      const message: WSMessage = JSON.parse(event.data);
      this.emit(message.type, message.payload);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private onClose(event: any) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit(WSEventType.DISCONNECT, { code: event.code, reason: event.reason });

    if (event.code !== 1000) { // Not a normal closure
      this.scheduleReconnect();
    }
  }

  private onError(error: Event) {
    console.error('WebSocket error:', error);
    this.emit(WSEventType.ERROR, { error });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * this.reconnectAttempts;

    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.emit(WSEventType.RECONNECT, { attempt: this.reconnectAttempts });
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Public API
  public subscribe(eventType: WSEventType, callback: (data: any) => void): string {
    const id = `${eventType}_${Date.now()}_${Math.random()}`;
    this.callbacks.set(id, { id, eventType, callback });
    return id;
  }

  public unsubscribe(subscriptionId: string) {
    this.callbacks.delete(subscriptionId);
  }

  public emit(eventType: WSEventType, data: any) {
    this.callbacks.forEach((callback) => {
      if (callback.eventType === eventType) {
        try {
          callback.callback(data);
        } catch (error) {
          console.error(`Error in WebSocket callback for ${eventType}:`, error);
        }
      }
    });
  }

  public send(type: WSEventType, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId: this.userId || undefined,
      };

      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.callbacks.clear();
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  public async updateUserId(userId: string) {
    if (this.userId !== userId) {
      this.userId = userId;
      if (this.isConnected) {
        this.disconnect();
      }
      this.connect();
    }
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

// Utility functions for common subscriptions
export const subscribeToCrewUpdates = (crewId: string, callback: (data: any) => void) => {
  return wsManager.subscribe(WSEventType.CREW_UPDATE, (data) => {
    if (data.crewId === crewId) {
      callback(data);
    }
  });
};

export const subscribeToLeaderboardUpdates = (callback: (data: any) => void) => {
  return wsManager.subscribe(WSEventType.LEADERBOARD_UPDATE, callback);
};

export const subscribeToMissionUpdates = (callback: (data: any) => void) => {
  return wsManager.subscribe(WSEventType.MISSION_COMPLETE, callback);
};

export const subscribeToCoinBalanceUpdates = (callback: (data: any) => void) => {
  return wsManager.subscribe(WSEventType.COIN_BALANCE_UPDATE, callback);
};

export const subscribeToNotifications = (callback: (data: any) => void) => {
  return wsManager.subscribe(WSEventType.NOTIFICATION, callback);
};

// Cleanup function for React components
export const useWebSocketCleanup = (subscriptionIds: string[]) => {
  return () => {
    subscriptionIds.forEach(id => wsManager.unsubscribe(id));
  };
};