import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VeiculosGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => VeiculosService))
    private readonly veiculosService: VeiculosService,
  ) {}

  @SubscribeMessage('createVeiculo')
  async create(@MessageBody() data: CreateVeiculoDto, @ConnectedSocket() client: Socket) {
    try {
      const veiculo = await this.veiculosService.create(data);
      // Confirmação individual para o cliente que fez a requisição
      client.emit('veiculoCriadoSuccess', veiculo);
      return { success: true, data: veiculo };
    } catch (error) {
      client.emit('veiculoError', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('updateVeiculo')
  async update(
    @MessageBody() data: { id: number; updateData: UpdateVeiculoDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const veiculo = await this.veiculosService.update(data.id, data.updateData);
      
      this.server.emit('veiculoAtualizado', veiculo);
      
      this.server.emit('atualizarListaVeiculosCliente', {
        clienteId: veiculo.cliente.id,
        veiculo: veiculo
      });
      
      client.emit('veiculoAtualizadoSuccess', veiculo);
      return { success: true, data: veiculo };
    } catch (error) {
      client.emit('veiculoError', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('deleteVeiculo')
  async remove(@MessageBody() id: number, @ConnectedSocket() client: Socket) {
    try {
      await this.veiculosService.remove(id);
      // Confirmação individual para o cliente que fez a requisição
      client.emit('veiculoRemovidoSuccess', id);
      return { success: true, id };
    } catch (error) {
      client.emit('veiculoError', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getVeiculos')
  async findAll(@ConnectedSocket() client: Socket) {
    try {
      const veiculos = await this.veiculosService.findAll();
      client.emit('veiculosListados', veiculos);
      return { success: true, data: veiculos };
    } catch (error) {
      client.emit('veiculoError', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getVeiculosByCliente')
  async findByCliente(@MessageBody() clienteId: number, @ConnectedSocket() client: Socket) {
    try {
      const veiculos = await this.veiculosService.findByCliente(clienteId);
      client.emit('veiculosClienteListados', veiculos);
      return { success: true, data: veiculos };
    } catch (error) {
      client.emit('veiculoError', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}