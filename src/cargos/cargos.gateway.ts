import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/cargos' })
export class CargosGateway {
  @WebSocketServer()
  server: Server;

  emitChange(event: string, data: any) {
    this.server.emit(event, data);
  }
}
