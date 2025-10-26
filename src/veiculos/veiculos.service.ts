import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from './entities/veiculo.entity';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { Cliente } from '@/clientes/entities/cliente.entity';
import { VeiculosGateway } from './veiculos.gateway';

@Injectable()
export class VeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private veiculosRepo: Repository<Veiculo>,
    @InjectRepository(Cliente)
    private clientesRepo: Repository<Cliente>,
    @Inject(forwardRef(() => VeiculosGateway))
    private veiculosGateway: VeiculosGateway,
  ) {}

  async create(dto: CreateVeiculoDto): Promise<Veiculo> {
    const cliente = await this.clientesRepo.findOne({ where: { id: dto.cliente_id } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const veiculo = this.veiculosRepo.create({ ...dto, cliente });
    const veiculoSalvo = await this.veiculosRepo.save(veiculo);
    
    // Emitir evento WebSocket
    this.veiculosGateway.server.emit('veiculoCriado', veiculoSalvo);
    
    return veiculoSalvo;
  }

  findAll(): Promise<Veiculo[]> {
    return this.veiculosRepo.find({ relations: ['cliente'] });
  }

  async findOne(id: number): Promise<Veiculo> {
    const veiculo = await this.veiculosRepo.findOne({ where: { id }, relations: ['cliente'] });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return veiculo;
  }

  async update(id: number, dto: UpdateVeiculoDto): Promise<Veiculo> {
    const veiculoExistente = await this.findOne(id);
    await this.veiculosRepo.update(id, dto);
    const veiculoAtualizado = await this.findOne(id);
    
    this.veiculosGateway.server.emit('veiculoAtualizado', veiculoAtualizado);
    
    return veiculoAtualizado;
  }

  async remove(id: number): Promise<void> {
    const veiculo = await this.findOne(id);
    await this.veiculosRepo.remove(veiculo);
    
    this.veiculosGateway.server.emit('veiculoRemovido', id);
  }

  async findByCliente(clienteId: number): Promise<Veiculo[]> {
    const veiculos = await this.veiculosRepo.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente'],
    });
    return veiculos;
  }
}