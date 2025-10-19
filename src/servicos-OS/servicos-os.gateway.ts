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
import { ServicosOsService } from './servicos-os.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/servicos-os'
})
@Injectable()
export class ServicosOsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ServicosOsGateway.name);

  constructor(private readonly servicosOsService: ServicosOsService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('servico-os:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando novo serviço/peça para ordem ${payload.ordem_id}`);
      
      const servico = await this.servicosOsService.create(payload);
      
      // Emitir para todos os clientes
      this.server.emit('servico-os:created', servico);
      
      // Emitir atualização do total da ordem
      const total = await this.servicosOsService.calcularTotalOrdem(payload.ordem_id);
      this.server.emit(`ordem:total:${payload.ordem_id}`, { 
        ordem_id: payload.ordem_id, 
        total 
      });
      
      // Emitir contagem por tipo
      const contagem = await this.servicosOsService.contarPorTipo(payload.ordem_id);
      this.server.emit(`ordem:contagem:${payload.ordem_id}`, {
        ordem_id: payload.ordem_id,
        ...contagem
      });

      // Confirmar para o cliente que criou
      client.emit('servico-os:create:success', servico);
      
      return { success: true, data: servico };
    } catch (error) {
      this.logger.error(`Erro ao criar serviço/peça: ${error.message}`);
      client.emit('servico-os:create:error', { 
        error: error.message,
        payload 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando serviço/peça ${payload.id}`);
      
      const servico = await this.servicosOsService.update(payload.id, payload.data);
      
      // Emitir para todos os clientes
      this.server.emit('servico-os:updated', servico);
      
      // Atualizar total e contagem da ordem
      const ordemId = payload.data.ordem_id || servico.ordem_id;
      const [total, contagem] = await Promise.all([
        this.servicosOsService.calcularTotalOrdem(ordemId),
        this.servicosOsService.contarPorTipo(ordemId)
      ]);
      
      this.server.emit(`ordem:total:${ordemId}`, { 
        ordem_id: ordemId, 
        total 
      });
      
      this.server.emit(`ordem:contagem:${ordemId}`, {
        ordem_id: ordemId,
        ...contagem
      });

      client.emit('servico-os:update:success', servico);
      
      return { success: true, data: servico };
    } catch (error) {
      this.logger.error(`Erro ao atualizar serviço/peça ${payload.id}: ${error.message}`);
      client.emit('servico-os:update:error', { 
        error: error.message,
        id: payload.id 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:delete')
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number
  ) {
    try {
      this.logger.log(`Removendo serviço/peça ${id}`);
      
      const servico = await this.servicosOsService.findOne(id);
      const result = await this.servicosOsService.remove(id);
      
      // Emitir para todos os clientes
      this.server.emit('servico-os:deleted', { id, message: result.message });
      
      // Atualizar total e contagem da ordem
      const [total, contagem] = await Promise.all([
        this.servicosOsService.calcularTotalOrdem(servico.ordem_id),
        this.servicosOsService.contarPorTipo(servico.ordem_id)
      ]);
      
      this.server.emit(`ordem:total:${servico.ordem_id}`, { 
        ordem_id: servico.ordem_id, 
        total 
      });
      
      this.server.emit(`ordem:contagem:${servico.ordem_id}`, {
        ordem_id: servico.ordem_id,
        ...contagem
      });

      client.emit('servico-os:delete:success', { id, message: result.message });
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao remover serviço/peça ${id}: ${error.message}`);
      client.emit('servico-os:delete:error', { 
        error: error.message,
        id 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:find-by-ordem')
  async handleFindByOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      this.logger.log(`Buscando serviços/peças da ordem ${ordemId}`);
      
      const servicos = await this.servicosOsService.findByOrdemId(ordemId);
      client.emit('servico-os:list-by-ordem', { 
        ordem_id: ordemId, 
        servicos 
      });
      
      return { success: true, data: servicos };
    } catch (error) {
      this.logger.error(`Erro ao buscar serviços/peças da ordem ${ordemId}: ${error.message}`);
      client.emit('servico-os:find-by-ordem:error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:get-total')
  async handleGetTotal(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      const total = await this.servicosOsService.calcularTotalOrdem(ordemId);
      client.emit('servico-os:total', { 
        ordem_id: ordemId, 
        total 
      });
      
      return { success: true, data: { ordem_id: ordemId, total } };
    } catch (error) {
      this.logger.error(`Erro ao calcular total da ordem ${ordemId}: ${error.message}`);
      client.emit('servico-os:get-total:error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:get-contagem')
  async handleGetContagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      const contagem = await this.servicosOsService.contarPorTipo(ordemId);
      client.emit('servico-os:contagem', { 
        ordem_id: ordemId, 
        ...contagem 
      });
      
      return { success: true, data: { ordem_id: ordemId, ...contagem } };
    } catch (error) {
      this.logger.error(`Erro ao obter contagem da ordem ${ordemId}: ${error.message}`);
      client.emit('servico-os:get-contagem:error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:get-estatisticas')
  async handleGetEstatisticas(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      const [servicos, total, contagem] = await Promise.all([
        this.servicosOsService.findByOrdemId(ordemId),
        this.servicosOsService.calcularTotalOrdem(ordemId),
        this.servicosOsService.contarPorTipo(ordemId)
      ]);

      const estatisticas = {
        ordem_id: ordemId,
        total,
        contagem,
        quantidade_itens: servicos.length,
        servicos: servicos
      };

      client.emit('servico-os:estatisticas', estatisticas);
      
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas da ordem ${ordemId}: ${error.message}`);
      client.emit('servico-os:get-estatisticas:error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:join-ordem')
  handleJoinOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      client.join(`ordem-${ordemId}`);
      this.logger.log(`Client ${client.id} joined ordem-${ordemId}`);
      client.emit('servico-os:join-success', { ordem_id: ordemId });
      return { success: true, ordem_id: ordemId };
    } catch (error) {
      client.emit('servico-os:join-error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('servico-os:leave-ordem')
  handleLeaveOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() ordemId: number
  ) {
    try {
      client.leave(`ordem-${ordemId}`);
      this.logger.log(`Client ${client.id} left ordem-${ordemId}`);
      client.emit('servico-os:leave-success', { ordem_id: ordemId });
      return { success: true, ordem_id: ordemId };
    } catch (error) {
      client.emit('servico-os:leave-error', { 
        error: error.message,
        ordem_id: ordemId 
      });
      return { success: false, error: error.message };
    }
  }
}