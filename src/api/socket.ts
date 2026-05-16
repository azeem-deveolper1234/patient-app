import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

// Remove the trailing `/api` from API_BASE_URL to get the base socket URL
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'], // Use WebSocket first to avoid polling overhead
        reconnection: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(eventName, callback);
      } else {
        this.socket.off(eventName);
      }
    }
  }
}

export const socketService = new SocketService();
