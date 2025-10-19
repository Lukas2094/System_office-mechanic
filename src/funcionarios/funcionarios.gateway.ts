import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/funcionarios' })
export class FuncionariosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Cliente conectado ao WS de funcionários:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Cliente desconectado do WS de funcionários:', client.id);
  }

  emitFuncionarioCriado(data: any) {
    this.server.emit('funcionarioCriado', data);
  }

  emitFuncionarioAtualizado(data: any) {
    this.server.emit('funcionarioAtualizado', data);
  }

  emitFuncionarioRemovido(data: any) {
    this.server.emit('funcionarioRemovido', data);
  }
}
