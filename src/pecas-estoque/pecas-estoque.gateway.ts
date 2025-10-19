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
import { PecasEstoqueService } from './pecas-estoque.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/pecas-estoque'
})
@Injectable()
export class PecasEstoqueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PecasEstoqueGateway.name);

  constructor(private readonly pecasEstoqueService: PecasEstoqueService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('peca-estoque:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando nova peça: ${payload.nome}`);
      
      const peca = await this.pecasEstoqueService.create(payload);
      
      this.server.emit('peca-estoque:created', peca);
      client.emit('peca-estoque:create:success', peca);
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.pecasEstoqueService.getEstatisticas();
      this.server.emit('peca-estoque:estatisticas:updated', estatisticas);
      
      return { success: true, data: peca };
    } catch (error) {
      this.logger.error(`Erro ao criar peça: ${error.message}`);
      client.emit('peca-estoque:create:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando peça ${payload.id}`);
      
      const peca = await this.pecasEstoqueService.update(payload.id, payload.data);
      
      this.server.emit('peca-estoque:updated', peca);
      client.emit('peca-estoque:update:success', peca);
      
      // Emitir atualização de estatísticas se quantidade foi alterada
      if (payload.data.quantidade !== undefined) {
        const estatisticas = await this.pecasEstoqueService.getEstatisticas();
        this.server.emit('peca-estoque:estatisticas:updated', estatisticas);
      }
      
      return { success: true, data: peca };
    } catch (error) {
      this.logger.error(`Erro ao atualizar peça ${payload.id}: ${error.message}`);
      client.emit('peca-estoque:update:error', { error: error.message, id: payload.id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:delete')
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number
  ) {
    try {
      this.logger.log(`Removendo peça ${id}`);
      
      const result = await this.pecasEstoqueService.remove(id);
      
      this.server.emit('peca-estoque:deleted', { id, message: result.message });
      client.emit('peca-estoque:delete:success', { id, message: result.message });
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.pecasEstoqueService.getEstatisticas();
      this.server.emit('peca-estoque:estatisticas:updated', estatisticas);
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao remover peça ${id}: ${error.message}`);
      client.emit('peca-estoque:delete:error', { error: error.message, id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:atualizar-estoque')
  async handleAtualizarEstoque(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; quantidade: number; operacao: 'entrada' | 'saida' }
  ) {
    try {
      this.logger.log(`Atualizando estoque da peça ${payload.id}`);
      
      const peca = await this.pecasEstoqueService.atualizarEstoque(
        payload.id, 
        payload.quantidade, 
        payload.operacao
      );
      
      this.server.emit('peca-estoque:estoque-updated', peca);
      client.emit('peca-estoque:atualizar-estoque:success', peca);
      
      // Emitir atualização de estatísticas
      const estatisticas = await this.pecasEstoqueService.getEstatisticas();
      this.server.emit('peca-estoque:estatisticas:updated', estatisticas);
      
      // Emitir alerta se estoque ficou baixo
      if (peca.abaixo_estoque_minimo) {
        this.server.emit('peca-estoque:alerta-estoque-baixo', peca);
      }
      
      return { success: true, data: peca };
    } catch (error) {
      this.logger.error(`Erro ao atualizar estoque: ${error.message}`);
      client.emit('peca-estoque:atualizar-estoque:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:search')
  async handleSearch(
    @ConnectedSocket() client: Socket,
    @MessageBody() nome: string
  ) {
    try {
      const pecas = await this.pecasEstoqueService.searchByName(nome);
      client.emit('peca-estoque:search:results', pecas);
      return { success: true, data: pecas };
    } catch (error) {
      this.logger.error(`Erro na busca: ${error.message}`);
      client.emit('peca-estoque:search:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:get-estoque-baixo')
  async handleGetEstoqueBaixo(@ConnectedSocket() client: Socket) {
    try {
      const pecas = await this.pecasEstoqueService.getEstoqueBaixo();
      client.emit('peca-estoque:estoque-baixo', pecas);
      return { success: true, data: pecas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estoque baixo: ${error.message}`);
      client.emit('peca-estoque:get-estoque-baixo:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:get-estatisticas')
  async handleGetEstatisticas(@ConnectedSocket() client: Socket) {
    try {
      const estatisticas = await this.pecasEstoqueService.getEstatisticas();
      client.emit('peca-estoque:estatisticas', estatisticas);
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      client.emit('peca-estoque:get-estatisticas:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('peca-estoque:get-by-codigo')
  async handleGetByCodigo(
    @ConnectedSocket() client: Socket,
    @MessageBody() codigo: string
  ) {
    try {
      const peca = await this.pecasEstoqueService.findByCodigoInterno(codigo);
      client.emit('peca-estoque:found-by-codigo', peca);
      return { success: true, data: peca };
    } catch (error) {
      this.logger.error(`Erro ao buscar por código: ${error.message}`);
      client.emit('peca-estoque:get-by-codigo:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}