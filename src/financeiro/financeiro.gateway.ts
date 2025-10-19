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
import { FinanceiroService } from './financeiro.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/financeiro'
})
@Injectable()
export class FinanceiroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FinanceiroGateway.name);

  constructor(private readonly financeiroService: FinanceiroService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('financeiro:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando novo movimento financeiro`);
      
      const movimento = await this.financeiroService.create(payload);
      
      this.server.emit('financeiro:created', movimento);
      client.emit('financeiro:create:success', movimento);
      
      // Emitir atualização de totais
      const totais = await this.financeiroService.calcularTotalPorTipo();
      this.server.emit('financeiro:totais:updated', totais);
      
      return { success: true, data: movimento };
    } catch (error) {
      this.logger.error(`Erro ao criar movimento financeiro: ${error.message}`);
      client.emit('financeiro:create:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando movimento financeiro ${payload.id}`);
      
      const movimento = await this.financeiroService.update(payload.id, payload.data);
      
      this.server.emit('financeiro:updated', movimento);
      client.emit('financeiro:update:success', movimento);
      
      // Emitir atualização de totais
      const totais = await this.financeiroService.calcularTotalPorTipo();
      this.server.emit('financeiro:totais:updated', totais);
      
      return { success: true, data: movimento };
    } catch (error) {
      this.logger.error(`Erro ao atualizar movimento financeiro ${payload.id}: ${error.message}`);
      client.emit('financeiro:update:error', { error: error.message, id: payload.id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:delete')
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number
  ) {
    try {
      this.logger.log(`Removendo movimento financeiro ${id}`);
      
      const result = await this.financeiroService.remove(id);
      
      this.server.emit('financeiro:deleted', { id, message: result.message });
      client.emit('financeiro:delete:success', { id, message: result.message });
      
      // Emitir atualização de totais
      const totais = await this.financeiroService.calcularTotalPorTipo();
      this.server.emit('financeiro:totais:updated', totais);
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao remover movimento financeiro ${id}: ${error.message}`);
      client.emit('financeiro:delete:error', { error: error.message, id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:get-totais')
  async handleGetTotais(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { dataInicio?: string; dataFim?: string }
  ) {
    try {
      const inicio = payload?.dataInicio ? new Date(payload.dataInicio) : undefined;
      const fim = payload?.dataFim ? new Date(payload.dataFim) : undefined;
      
      const totais = await this.financeiroService.calcularTotalPorTipo(inicio, fim);
      client.emit('financeiro:totais', totais);
      
      return { success: true, data: totais };
    } catch (error) {
      this.logger.error(`Erro ao buscar totais: ${error.message}`);
      client.emit('financeiro:get-totais:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:get-by-periodo')
  async handleGetByPeriodo(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { dataInicio: string; dataFim: string }
  ) {
    try {
      const movimentos = await this.financeiroService.findByPeriodo(
        new Date(payload.dataInicio),
        new Date(payload.dataFim)
      );
      
      client.emit('financeiro:list-by-periodo', {
        dataInicio: payload.dataInicio,
        dataFim: payload.dataFim,
        movimentos
      });
      
      return { success: true, data: movimentos };
    } catch (error) {
      this.logger.error(`Erro ao buscar movimentos por período: ${error.message}`);
      client.emit('financeiro:get-by-periodo:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:get-estatisticas')
  async handleGetEstatisticas(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { dataInicio?: string; dataFim?: string }
  ) {
    try {
      const inicio = payload?.dataInicio ? new Date(payload.dataInicio) : undefined;
      const fim = payload?.dataFim ? new Date(payload.dataFim) : undefined;
      
      const [movimentos, totais, formasPagamento] = await Promise.all([
        this.financeiroService.findByPeriodo(inicio || new Date('2000-01-01'), fim || new Date()),
        this.financeiroService.calcularTotalPorTipo(inicio, fim),
        this.financeiroService.calcularTotalPorFormaPagamento(inicio, fim)
      ]);

      const estatisticas = {
        periodo: { dataInicio: inicio, dataFim: fim },
        totais,
        formas_pagamento: formasPagamento,
        quantidade_movimentos: movimentos.length,
        movimentos
      };

      client.emit('financeiro:estatisticas', estatisticas);
      
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      client.emit('financeiro:get-estatisticas:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('financeiro:criar-receita-ordem')
  async handleCriarReceitaOrdem(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { ordemId: number; valor: number; forma_pagamento: string; descricao?: string }
  ) {
    try {
      const movimento = await this.financeiroService.criarReceitaDeOrdem(
        payload.ordemId,
        payload.valor,
        payload.forma_pagamento,
        payload.descricao
      );
      
      this.server.emit('financeiro:created', movimento);
      client.emit('financeiro:criar-receita:success', movimento);
      
      // Emitir atualização de totais
      const totais = await this.financeiroService.calcularTotalPorTipo();
      this.server.emit('financeiro:totais:updated', totais);
      
      return { success: true, data: movimento };
    } catch (error) {
      this.logger.error(`Erro ao criar receita da ordem: ${error.message}`);
      client.emit('financeiro:criar-receita:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}