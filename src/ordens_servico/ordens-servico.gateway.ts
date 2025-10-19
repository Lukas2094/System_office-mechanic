import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OrdensServicoService } from './ordens-servico.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';

@WebSocketGateway({ cors: true, namespace: '/ordens' })
export class OrdensServicoGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ordensService: OrdensServicoService) {}

  // criar via WS
  @SubscribeMessage('createOrdem')
  async handleCreate(@MessageBody() payload: CreateOrdemServicoDto) {
    const ordem = await this.ordensService.create(payload);
    this.server.emit('ordemCriada', ordem);
    return ordem;
  }

  // exemplo de evento para atualização (client pode emitir)
  @SubscribeMessage('updateOrdem')
  async handleUpdate(@MessageBody() payload: { id: number; data: any }) {
    const ordem = await this.ordensService.update(payload.id, payload.data);
    this.server.emit('ordemAtualizada', ordem);
    return ordem;
  }

  // faturamento via WS
  @SubscribeMessage('faturarOrdem')
  async handleFaturar(@MessageBody() payload: { id: number }) {
    const ordem = await this.ordensService.faturar(payload.id);
    this.server.emit('ordemFaturada', ordem);
    return ordem;
  }
}
