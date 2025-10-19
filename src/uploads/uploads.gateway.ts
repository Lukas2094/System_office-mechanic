import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/uploads'
})
@Injectable()
export class UploadsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UploadsGateway.name);

  constructor(private readonly uploadsService: UploadsService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('upload:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando novo upload`);
      
      const upload = await this.uploadsService.create(payload);
      
      this.server.emit('upload:created', upload);
      client.emit('upload:create:success', upload);
      
      // Emitir para salas específicas
      if (upload.ordem_id) {
        this.server.to(`ordem-${upload.ordem_id}`).emit('upload:created:ordem', upload);
      }
      if (upload.cliente_id) {
        this.server.to(`cliente-${upload.cliente_id}`).emit('upload:created:cliente', upload);
      }
      
      return { success: true, data: upload };
    } catch (error) {
      this.logger.error(`Erro ao criar upload: ${error.message}`);
      client.emit('upload:create:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando upload ${payload.id}`);
      
      const upload = await this.uploadsService.update(payload.id, payload.data);
      
      this.server.emit('upload:updated', upload);
      client.emit('upload:update:success', upload);
      
      return { success: true, data: upload };
    } catch (error) {
      this.logger.error(`Erro ao atualizar upload ${payload.id}: ${error.message}`);
      client.emit('upload:update:error', { error: error.message, id: payload.id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:delete')
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number
  ) {
    try {
      this.logger.log(`Removendo upload ${id}`);
      
      const result = await this.uploadsService.remove(id);
      
      this.server.emit('upload:deleted', { id, message: result.message });
      client.emit('upload:delete:success', { id, message: result.message });
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao remover upload ${id}: ${error.message}`);
      client.emit('upload:delete:error', { error: error.message, id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:get-by-ordem')
  async handleGetByOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      const uploads = await this.uploadsService.findByOrdemId(ordemId);
      client.emit('upload:list-by-ordem', { ordem_id: ordemId, uploads });
      return { success: true, data: uploads };
    } catch (error) {
      this.logger.error(`Erro ao buscar uploads da ordem ${ordemId}: ${error.message}`);
      client.emit('upload:get-by-ordem:error', { error: error.message, ordem_id: ordemId });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:get-by-cliente')
  async handleGetByCliente(
    @ConnectedSocket() client: Socket,
    @MessageBody() clienteId: number
  ) {
    try {
      const uploads = await this.uploadsService.findByClienteId(clienteId);
      client.emit('upload:list-by-cliente', { cliente_id: clienteId, uploads });
      return { success: true, data: uploads };
    } catch (error) {
      this.logger.error(`Erro ao buscar uploads do cliente ${clienteId}: ${error.message}`);
      client.emit('upload:get-by-cliente:error', { error: error.message, cliente_id: clienteId });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:get-recentes')
  async handleGetRecentes(
    @ConnectedSocket() client: Socket,
    @MessageBody() limit: number = 10
  ) {
    try {
      const uploads = await this.uploadsService.getUploadsRecentes(limit);
      client.emit('upload:list-recentes', uploads);
      return { success: true, data: uploads };
    } catch (error) {
      this.logger.error(`Erro ao buscar uploads recentes: ${error.message}`);
      client.emit('upload:get-recentes:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:get-estatisticas')
  async handleGetEstatisticas(@ConnectedSocket() client: Socket) {
    try {
      const estatisticas = await this.uploadsService.getEstatisticas();
      client.emit('upload:estatisticas', estatisticas);
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      client.emit('upload:get-estatisticas:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:join-ordem')
  handleJoinOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      client.join(`ordem-${ordemId}`);
      this.logger.log(`Client ${client.id} joined ordem-${ordemId}`);
      client.emit('upload:join-ordem:success', { ordem_id: ordemId });
      return { success: true, ordem_id: ordemId };
    } catch (error) {
      client.emit('upload:join-ordem:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('upload:join-cliente')
  handleJoinCliente(
    @ConnectedSocket() client: Socket,
    @MessageBody() clienteId: number
  ) {
    try {
      client.join(`cliente-${clienteId}`);
      this.logger.log(`Client ${client.id} joined cliente-${clienteId}`);
      client.emit('upload:join-cliente:success', { cliente_id: clienteId });
      return { success: true, cliente_id: clienteId };
    } catch (error) {
      client.emit('upload:join-cliente:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}