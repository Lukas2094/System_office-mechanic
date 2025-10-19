import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';

@WebSocketGateway()
export class VeiculosGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly veiculosService: VeiculosService) {}

  @SubscribeMessage('createVeiculo')
  async create(@MessageBody() data: CreateVeiculoDto) {
    const veiculo = await this.veiculosService.create(data);
    this.server.emit('veiculoCriado', veiculo);
    return veiculo;
  }
}
