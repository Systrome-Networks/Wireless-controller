import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger.js';
import { WebSocketEvent } from '@wac/types';

interface ClientConnection {
  ws: WebSocket;
  orgId?: string;
  isAlive: boolean;
}

export class WacWebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<ClientConnection> = new Set();

  init(server: any): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const orgId = url.searchParams.get('orgId') || undefined;

      const client: ClientConnection = { ws, orgId, isAlive: true };
      this.clients.add(client);

      logger.info('WebSocket client connected', { orgId, clientCount: this.clients.size });

      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.action === 'subscribe' && msg.orgId) {
            client.orgId = msg.orgId;
            ws.send(JSON.stringify({ status: 'subscribed', orgId: client.orgId }));
          }
        } catch (e) {
          // Ignore invalid client messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(client);
        logger.info('WebSocket client disconnected', { clientCount: this.clients.size });
      });
    });

    // Liveness heartbeat ping every 30 seconds
    setInterval(() => {
      for (const client of this.clients) {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(client);
          continue;
        }
        client.isAlive = false;
        client.ws.ping();
      }
    }, 30000);
  }

  broadcast<T>(event: WebSocketEvent<T>): void {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (!client.orgId || client.orgId === event.orgId) {
          client.ws.send(payload);
        }
      }
    }
  }
}

export const wsHub = new WacWebSocketHub();
