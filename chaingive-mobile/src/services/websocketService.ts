import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import {
  updateUserLevel,
  addXPEntry,
  updateLevelLeaderboard,
} from '../store/slices/userLevelsSlice';
import {
  updateUserNFTs,
  addUserNFT,
  updateNFTCollections,
} from '../store/slices/charitableNFTSlice';
import {
  updateTrustReview,
  addPendingReview,
} from '../store/slices/trustSlice';
import {
  updateCurrentTarget,
  updateTargetProgressLocal,
} from '../store/slices/weeklyTargetsSlice';
import {
  updateCrew,
  addCrewDonation,
  updateCrewChallenge,
} from '../store/slices/crewSlice';
import {
  updateCategory,
  updateUserProgress,
} from '../store/slices/charityCategoriesSlice';

// WebSocket event types
export enum WebSocketEventType {
  // User Level Events
  LEVEL_UP = 'level_up',
  XP_AWARDED = 'xp_awarded',
  PERK_UNLOCKED = 'perk_unlocked',
  MILESTONE_COMPLETED = 'milestone_completed',

  // NFT Events
  NFT_MINTED = 'nft_minted',
  NFT_TRANSFERRED = 'nft_transferred',
  NFT_LISTED = 'nft_listed',
  NFT_SOLD = 'nft_sold',
  NFT_COLLECTION_UPDATED = 'nft_collection_updated',

  // Trust System Events
  TRUST_REVIEW_SUBMITTED = 'trust_review_submitted',
  TRUST_REVIEW_VERIFIED = 'trust_review_verified',
  TRUST_LEVEL_CHANGED = 'trust_level_changed',

  // Weekly Targets Events
  TARGET_PROGRESS_UPDATED = 'target_progress_updated',
  TARGET_COMPLETED = 'target_completed',
  TARGET_GENERATED = 'target_generated',

  // Crew Events
  CREW_PROGRESS_UPDATED = 'crew_progress_updated',
  CREW_MEMBER_JOINED = 'crew_member_joined',
  CREW_MEMBER_LEFT = 'crew_member_left',
  CREW_CHALLENGE_COMPLETED = 'crew_challenge_completed',
  CREW_REWARDS_DISTRIBUTED = 'crew_rewards_distributed',

  // Charity Categories Events
  CATEGORY_PROGRESS_UPDATED = 'category_progress_updated',
  CATEGORY_CHALLENGE_COMPLETED = 'category_challenge_completed',
  CATEGORY_FEATURED_CHANGED = 'category_featured_changed',

  // System Events
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
  userId?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isReconnecting = false;
  private eventListeners: Map<WebSocketEventType, ((payload: any) => void)[]> = new Map();

  constructor(
    private wsUrl: string = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.chaingive.ng/ws'
  ) {}

  // Initialize WebSocket connection
  async connect(): Promise<void> {
    if (this.isConnected || this.isReconnecting) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const wsUrl = `${this.wsUrl}?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket not initialized'));

        this.ws.onopen = () => {
          console.log('🎯 Gamification WebSocket connected');
          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit(WebSocketEventType.CONNECTION_ESTABLISHED, { connected: true });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.emit(WebSocketEventType.ERROR, { error: error.message });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();

          if (!event.wasClean && event.code !== 1000) {
            this.emit(WebSocketEventType.CONNECTION_LOST, {
              code: event.code,
              reason: event.reason
            });
            this.attemptReconnect();
          }
        };
      });
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      throw error;
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isReconnecting = false;
    this.stopHeartbeat();
  }

  // Send message to server
  send(type: WebSocketEventType, payload: any): void {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent:', type);
    }
  }

  // Subscribe to events
  on(eventType: WebSocketEventType, callback: (payload: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  // Unsubscribe from events
  off(eventType: WebSocketEventType, callback: (payload: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
  private emit(eventType: WebSocketEventType, payload: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('❌ Error in WebSocket event listener:', error);
        }
      });
    }
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 WebSocket message received:', message.type);

    // Emit to custom listeners
    this.emit(message.type, message.payload);

    // Handle Redux store updates
    this.handleReduxUpdate(message);
  }

  // Update Redux store based on WebSocket messages
  private handleReduxUpdate(message: WebSocketMessage): void {
    const { type, payload } = message;

    switch (type) {
      // User Level Events
      case WebSocketEventType.LEVEL_UP:
        store.dispatch(updateUserLevel(payload.userLevel));
        break;

      case WebSocketEventType.XP_AWARDED:
        store.dispatch(addXPEntry(payload.xpEntry));
        break;

      case WebSocketEventType.PERK_UNLOCKED:
        // Update user level perks
        const currentLevel = store.getState().userLevels.userLevel;
        if (currentLevel) {
          const updatedLevel = {
            ...currentLevel,
            perks: currentLevel.perks.map(perk =>
              perk.id === payload.perkId ? { ...perk, isActive: true } : perk
            ),
          };
          store.dispatch(updateUserLevel(updatedLevel));
        }
        break;

      // NFT Events
      case WebSocketEventType.NFT_MINTED:
        store.dispatch(addUserNFT(payload.nft));
        break;

      case WebSocketEventType.NFT_COLLECTION_UPDATED:
        store.dispatch(updateNFTCollections(payload.collections));
        break;

      // Trust System Events
      case WebSocketEventType.TRUST_REVIEW_SUBMITTED:
        store.dispatch(addPendingReview(payload.review));
        break;

      case WebSocketEventType.TRUST_REVIEW_VERIFIED:
        store.dispatch(updateTrustReview(payload.review));
        break;

      // Weekly Targets Events
      case WebSocketEventType.TARGET_PROGRESS_UPDATED:
        store.dispatch(updateTargetProgressLocal({
          categoryId: payload.categoryId,
          amount: payload.amount,
        }));
        break;

      case WebSocketEventType.TARGET_COMPLETED:
        store.dispatch(updateCurrentTarget(payload.target));
        break;

      case WebSocketEventType.TARGET_GENERATED:
        store.dispatch(updateCurrentTarget(payload.target));
        break;

      // Crew Events
      case WebSocketEventType.CREW_PROGRESS_UPDATED:
        store.dispatch(updateCrew(payload.crew));
        break;

      case WebSocketEventType.CREW_MEMBER_JOINED:
        store.dispatch(updateCrew(payload.crew));
        break;

      case WebSocketEventType.CREW_MEMBER_LEFT:
        store.dispatch(updateCrew(payload.crew));
        break;

      case WebSocketEventType.CREW_CHALLENGE_COMPLETED:
        store.dispatch(updateCrewChallenge(payload.challenge));
        break;

      // Charity Categories Events
      case WebSocketEventType.CATEGORY_PROGRESS_UPDATED:
        store.dispatch(updateCategory(payload.category));
        store.dispatch(updateUserProgress(payload.userProgress));
        break;

      case WebSocketEventType.CATEGORY_CHALLENGE_COMPLETED:
        // Update challenge status in category
        break;

      default:
        console.log('📭 Unhandled WebSocket event:', type);
    }
  }

  // Attempt reconnection with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.emit(WebSocketEventType.RECONNECTING, {
      attempt: this.reconnectAttempts + 1,
      maxAttempts: this.maxReconnectAttempts
    });

    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);

    setTimeout(() => {
      console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, delay);
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send(WebSocketEventType.CONNECTION_ESTABLISHED, { ping: true });
      }
    }, 30000); // 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get connection status
  get isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Subscribe to specific user events
  subscribeToUserEvents(userId: string): void {
    this.send(WebSocketEventType.CONNECTION_ESTABLISHED, {
      action: 'subscribe',
      userId,
      events: [
        WebSocketEventType.LEVEL_UP,
        WebSocketEventType.XP_AWARDED,
        WebSocketEventType.PERK_UNLOCKED,
        WebSocketEventType.NFT_MINTED,
        WebSocketEventType.TRUST_REVIEW_SUBMITTED,
        WebSocketEventType.TARGET_PROGRESS_UPDATED,
        WebSocketEventType.CREW_PROGRESS_UPDATED,
        WebSocketEventType.CATEGORY_PROGRESS_UPDATED,
      ],
    });
  }

  // Unsubscribe from user events
  unsubscribeFromUserEvents(userId: string): void {
    this.send(WebSocketEventType.CONNECTION_ESTABLISHED, {
      action: 'unsubscribe',
      userId,
    });
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// React hook for using WebSocket in components
import { useEffect, useState } from 'react';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(websocketService.isWebSocketConnected);

  useEffect(() => {
    const handleConnectionEstablished = () => setIsConnected(true);
    const handleConnectionLost = () => setIsConnected(false);

    websocketService.on(WebSocketEventType.CONNECTION_ESTABLISHED, handleConnectionEstablished);
    websocketService.on(WebSocketEventType.CONNECTION_LOST, handleConnectionLost);

    return () => {
      websocketService.off(WebSocketEventType.CONNECTION_ESTABLISHED, handleConnectionEstablished);
      websocketService.off(WebSocketEventType.CONNECTION_LOST, handleConnectionLost);
    };
  }, []);

  return {
    isConnected,
    send: websocketService.send.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
  };
};

// Initialize WebSocket when app starts
export const initializeWebSocket = async (): Promise<void> => {
  try {
    await websocketService.connect();

    // Get current user and subscribe to their events
    const user = store.getState().auth.user;
    if (user?.id) {
      websocketService.subscribeToUserEvents(user.id);
    }
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket:', error);
  }
};

// Cleanup WebSocket when app closes
export const cleanupWebSocket = (): void => {
  websocketService.disconnect();
};