import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@WebSocketGateway({ cors: true })
export class ClientesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly clientesService: ClientesService) {}

  @SubscribeMessage('createCliente')
  async handleCreate(@MessageBody() data: CreateClienteDto) {
    const cliente = await this.clientesService.create(data);
    this.server.emit('clienteCriado', cliente);
    return cliente;
  }
}
