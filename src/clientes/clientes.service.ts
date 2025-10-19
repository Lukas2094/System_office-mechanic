import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Veiculo } from '@/veiculos/entities/veiculo.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
  ) {}

  create(dto: CreateClienteDto) {
    const cliente = this.clienteRepository.create(dto);
    return this.clienteRepository.save(cliente);
  }

  findAll() {
    return this.clienteRepository.find();
  }

  findOne(id: number) {
    return this.clienteRepository.findOneBy({ id });
  }

  async findByCliente(@Param('id') id: number) {
    return this.veiculoRepository.find({
      where: { cliente: { id } },
      relations: ['cliente'],
    });
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.clienteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.clienteRepository.delete(id);
    return { deleted: true };
  }
}
