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
import { UsuariosService } from './usuarios.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/usuarios'
})
@Injectable()
export class UsuariosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UsuariosGateway.name);

  constructor(private readonly usuariosService: UsuariosService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('usuario:login')
  async handleLogin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { username: string; senha: string }
  ) {
    try {
      this.logger.log(`Tentativa de login: ${payload.username}`);
      
      const result = await this.usuariosService.login(payload);
      
      client.emit('usuario:login:success', result);
      
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Erro no login: ${error.message}`);
      client.emit('usuario:login:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('usuario:get-all')
  async handleGetAll(@ConnectedSocket() client: Socket) {
    try {
      const usuarios = await this.usuariosService.findAll();
      client.emit('usuario:list', usuarios);
      return { success: true, data: usuarios };
    } catch (error) {
      this.logger.error(`Erro ao buscar usuários: ${error.message}`);
      client.emit('usuario:get-all:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('usuario:create')
  async handleCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    try {
      this.logger.log(`Criando novo usuário: ${payload.username}`);
      
      const usuario = await this.usuariosService.create(payload);
      
      this.server.emit('usuario:created', usuario);
      client.emit('usuario:create:success', usuario);
      
      return { success: true, data: usuario };
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error.message}`);
      client.emit('usuario:create:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
  

  @SubscribeMessage('usuario:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; data: any }
  ) {
    try {
      this.logger.log(`Atualizando usuário ${payload.id}`);
      
      const usuario = await this.usuariosService.update(payload.id, payload.data);
      
      this.server.emit('usuario:updated', usuario);
      client.emit('usuario:update:success', usuario);
      
      return { success: true, data: usuario };
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário ${payload.id}: ${error.message}`);
      client.emit('usuario:update:error', { error: error.message, id: payload.id });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('usuario:change-password')
  async handleChangePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: number; oldPassword: string; newPassword: string }
  ) {
    try {
      this.logger.log(`Alterando senha do usuário ${payload.id}`);
      
      const result = await this.usuariosService.changePassword(
        payload.id, 
        payload.oldPassword, 
        payload.newPassword
      );
      
      client.emit('usuario:change-password:success', result);
      
      return { success: true, message: result.message };
    } catch (error) {
      this.logger.error(`Erro ao alterar senha: ${error.message}`);
      client.emit('usuario:change-password:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('usuario:get-estatisticas')
  async handleGetEstatisticas(@ConnectedSocket() client: Socket) {
    try {
      const estatisticas = await this.usuariosService.getEstatisticas();
      client.emit('usuario:estatisticas', estatisticas);
      return { success: true, data: estatisticas };
    } catch (error) {
      this.logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      client.emit('usuario:get-estatisticas:error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}