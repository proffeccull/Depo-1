import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

// WebSocket event types
export enum WSEventType {
  // Connection events
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  ERROR = 'error',

  // Donation cycle events
  DONATION_MATCHED = 'donation_matched',
  DONATION_RECEIVED = 'donation_received',
  DONATION_CONFIRMED = 'donation_confirmed',
  DONATION_RELEASED = 'donation_released',
  DONATION_DEFAULTED = 'donation_defaulted',

  // Leaderboard events
  LEADERBOARD_UPDATED = 'leaderboard_updated',
  USER_RANK_CHANGED = 'user_rank_changed',

  // Coin system events
  COIN_BALANCE_UPDATE = 'coin_balance_update',
  COIN_PURCHASE_SUCCESS = 'coin_purchase_success',
  COIN_REDEMPTION_SUCCESS = 'coin_redemption_success',

  // Gamification events
  LEVEL_UP = 'level_up',
  XP_AWARDED = 'xp_awarded',
  BADGE_UNLOCKED = 'badge_unlocked',
  MISSION_COMPLETED = 'mission_completed',
  CHALLENGE_COMPLETED = 'challenge_completed',
  BATTLE_PASS_PROGRESS = 'battle_pass_progress',

  // Notification events
  NOTIFICATION_RECEIVED = 'notification_received',

  // System events
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_ALERT = 'system_alert',
  THERMOMETER_UPDATE = 'thermometer:update',

  // Control messages (not broadcast events)
  HEARTBEAT = 'heartbeat',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe'
}

export interface WSMessage {
  type: WSEventType;
  payload: any;
  timestamp?: string;
  userId?: string;
}

export interface WSClient {
  ws: WebSocket;
  userId: string;
  subscriptions: Set<string>;
  lastHeartbeat: Date;
  isAlive: boolean;
}

// WebSocket service class
class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, WSClient> = new Map(); // userId -> client
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeatCheck();
  }

  // Initialize WebSocket server
  initialize(server: any): void {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      perMessageDeflate: false,
      maxPayload: 1024 * 1024 // 1MB max payload
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    logger.info('WebSocket server initialized on path /ws');
  }

  // Handle new WebSocket connection
  private async handleConnection(ws: WebSocket, request: IncomingMessage): Promise<void> {
    try {
      // Extract token from query parameters
      const url = new URL(request.url || '', 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;

      if (!userId) {
        logger.warn('WebSocket connection rejected: Invalid token');
        ws.close(1008, 'Invalid authentication');
        return;
      }

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true, isBanned: true }
      });

      if (!user || !user.isActive || user.isBanned) {
        logger.warn(`WebSocket connection rejected: User ${userId} not active or banned`);
        ws.close(1008, 'User not authorized');
        return;
      }

      // Create client
      const client: WSClient = {
        ws,
        userId,
        subscriptions: new Set(),
        lastHeartbeat: new Date(),
        isAlive: true
      };

      // Store client
      this.clients.set(userId, client);

      logger.info(`WebSocket client connected: ${userId}`);

      // Set up event handlers
      ws.on('message', (data) => this.handleMessage(client, data));
      ws.on('close', () => this.handleDisconnection(client));
      ws.on('error', (error) => this.handleError(client, error));
      ws.on('pong', () => this.handlePong(client));

      // Send connection established message
      this.sendToClient(client, WSEventType.CONNECTION_ESTABLISHED, {
        message: 'Connected successfully',
        userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  // Handle incoming messages
  private handleMessage(client: WSClient, data: WebSocket.RawData): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());

      switch (message.type) {
        case WSEventType.HEARTBEAT:
          client.lastHeartbeat = new Date();
          client.ws.ping();
          break;

        case WSEventType.SUBSCRIBE:
          if (message.payload?.events) {
            message.payload.events.forEach((event: string) => {
              client.subscriptions.add(event);
            });
            logger.info(`Client ${client.userId} subscribed to: ${message.payload.events.join(', ')}`);
          }
          break;

        case WSEventType.UNSUBSCRIBE:
          if (message.payload?.events) {
            message.payload.events.forEach((event: string) => {
              client.subscriptions.delete(event);
            });
            logger.info(`Client ${client.userId} unsubscribed from: ${message.payload.events.join(', ')}`);
          }
          break;

        default:
          logger.warn(`Unknown WebSocket message type: ${message.type} from ${client.userId}`);
      }
    } catch (error) {
      logger.error(`Error handling WebSocket message from ${client.userId}:`, error);
    }
  }

  // Handle client disconnection
  private handleDisconnection(client: WSClient): void {
    logger.info(`WebSocket client disconnected: ${client.userId}`);
    this.clients.delete(client.userId);
  }

  // Handle WebSocket errors
  private handleError(client: WSClient, error: Error): void {
    logger.error(`WebSocket error for client ${client.userId}:`, error);
    this.clients.delete(client.userId);
  }

  // Handle pong responses
  private handlePong(client: WSClient): void {
    client.isAlive = true;
    client.lastHeartbeat = new Date();
  }

  // Start heartbeat check interval
  private startHeartbeatCheck(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, userId) => {
        if (!client.isAlive) {
          logger.warn(`Client ${userId} failed heartbeat check, terminating connection`);
          client.ws.terminate();
          this.clients.delete(userId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  // Send message to specific client
  private sendToClient(client: WSClient, type: WSEventType, payload: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId: client.userId
      };

      client.ws.send(JSON.stringify(message));
    }
  }

  // Broadcast message to all clients
  broadcast(type: WSEventType, payload: any, filterFn?: (client: WSClient) => boolean): void {
    this.clients.forEach((client) => {
      if (filterFn && !filterFn(client)) return;
      this.sendToClient(client, type, payload);
    });
  }

  // Send message to specific user
  sendToUser(userId: string, type: WSEventType, payload: any): void {
    const client = this.clients.get(userId);
    if (client) {
      this.sendToClient(client, type, payload);
    }
  }

  // Send message to multiple users
  sendToUsers(userIds: string[], type: WSEventType, payload: any): void {
    userIds.forEach(userId => {
      this.sendToUser(userId, type, payload);
    });
  }

  // Send message to users subscribed to specific events
  sendToSubscribedUsers(eventType: string, type: WSEventType, payload: any): void {
    this.clients.forEach((client) => {
      if (client.subscriptions.has(eventType)) {
        this.sendToClient(client, type, payload);
      }
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Get client info for debugging
  getClientInfo(userId: string): { connected: boolean; subscriptions: string[] } | null {
    const client = this.clients.get(userId);
    if (!client) return null;

    return {
      connected: client.ws.readyState === WebSocket.OPEN,
      subscriptions: Array.from(client.subscriptions)
    };
  }

  // Graceful shutdown
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close(1001, 'Server shutdown');
    });

    this.clients.clear();

    if (this.wss) {
      this.wss.close();
    }

    logger.info('WebSocket service shut down');
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

export default websocketService;