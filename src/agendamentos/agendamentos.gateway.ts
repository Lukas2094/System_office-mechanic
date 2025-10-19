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
import { AgendamentosService } from './agendamentos.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/agendamentos'
})
@Injectable()
export class AgendamentosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AgendamentosGateway.name);

  constructor(private readonly agendamentosService: AgendamentosService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('agendamento:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando novo agendamento para cliente ${payload.cliente_id}`);
      
      const agendamento = await this.agendamentosService.create(payload);
      
      this.server.emit('agendamento:created', agendamento);
      client.emit('agendamento:create:success', agendamento);
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.agendamentosService.getEstatisticas();
      this.server.emit('agendamento:estatisticas:updated', estatisticas);
      
      // Emitir para sala do funcionário se houver
      if (agendamento.funcionario_id) {
        this.server.to(`funcionario-${agendamento.funcionario_id}`).emit('agendamento:novo', agendamento);
      }
      
      return { success: true, data: agendamento };
    } catch (error) {
      this.logger.error(`Erro ao criar agendamento: ${error.message}`);
      client.emit('agendamento:create:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando agendamento ${payload.id}`);
      
      const agendamento = await this.agendamentosService.update(payload.id, payload.data);
      
      this.server.emit('agendamento:updated', agendamento);
      client.emit('agendamento:update:success', agendamento);
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.agendamentosService.getEstatisticas();
      this.server.emit('agendamento:estatisticas:updated', estatisticas);
      
      return { success: true, data: agendamento };
    } catch (error) {
      this.logger.error(`Erro ao atualizar agendamento ${payload.id}: ${error.message}`);
      client.emit('agendamento:update:error', { error: error.message, id: payload.id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:delete')
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number
  ) {
    try {
      this.logger.log(`Removendo agendamento ${id}`);
      
      const result = await this.agendamentosService.remove(id);
      
      this.server.emit('agendamento:deleted', { id, message: result.message });
      client.emit('agendamento:delete:success', { id, message: result.message });
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.agendamentosService.getEstatisticas();
      this.server.emit('agendamento:estatisticas:updated', estatisticas);
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao remover agendamento ${id}: ${error.message}`);
      client.emit('agendamento:delete:error', { error: error.message, id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:update-status')
  async handleUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado' }
  ) {
    try {
      this.logger.log(`Atualizando status do agendamento ${payload.id} para ${payload.status}`);
      
      const agendamento = await this.agendamentosService.atualizarStatus(payload.id, payload.status);
      
      this.server.emit('agendamento:status-updated', agendamento);
      client.emit('agendamento:update-status:success', agendamento);
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.agendamentosService.getEstatisticas();
      this.server.emit('agendamento:estatisticas:updated', estatisticas);
      
      return { success: true, data: agendamento };
    } catch (error) {
      this.logger.error(`Erro ao atualizar status: ${error.message}`);
      client.emit('agendamento:update-status:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:get-hoje')
  async handleGetHoje(@ConnectedSocket() client: Socket) {
    try {
      const agendamentos = await this.agendamentosService.getAgendamentosHoje();
      client.emit('agendamento:list-hoje', agendamentos);
      return { success: true, data: agendamentos };
    } catch (error) {
      this.logger.error(`Erro ao buscar agendamentos de hoje: ${error.message}`);
      client.emit('agendamento:get-hoje:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:get-futuros')
  async handleGetFuturos(@ConnectedSocket() client: Socket) {
    try {
      const agendamentos = await this.agendamentosService.getAgendamentosFuturos();
      client.emit('agendamento:list-futuros', agendamentos);
      return { success: true, data: agendamentos };
    } catch (error) {
      this.logger.error(`Erro ao buscar agendamentos futuros: ${error.message}`);
      client.emit('agendamento:get-futuros:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:get-estatisticas')
  async handleGetEstatisticas(@ConnectedSocket() client: Socket) {
    try {
      const estatisticas = await this.agendamentosService.getEstatisticas();
      client.emit('agendamento:estatisticas', estatisticas);
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      client.emit('agendamento:get-estatisticas:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:join-funcionario')
  handleJoinFuncionario(
    @ConnectedSocket() client: Socket,
    @MessageBody() funcionarioId: number
  ) {
    try {
      client.join(`funcionario-${funcionarioId}`);
      this.logger.log(`Client ${client.id} joined funcionario-${funcionarioId}`);
      client.emit('agendamento:join-funcionario:success', { funcionario_id: funcionarioId });
      return { success: true, funcionario_id: funcionarioId };
    } catch (error) {
      client.emit('agendamento:join-funcionario:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('agendamento:search')
  async handleSearch(
    @ConnectedSocket() client: Socket,
    @MessageBody() nome: string
  ) {
    try {
      const agendamentos = await this.agendamentosService.searchByClienteNome(nome);
      client.emit('agendamento:search:results', agendamentos);
      return { success: true, data: agendamentos };
    } catch (error) {
      this.logger.error(`Erro na busca: ${error.message}`);
      client.emit('agendamento:search:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}