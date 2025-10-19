import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { CargosGateway } from './cargos.gateway';

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargosRepository: Repository<Cargo>,
    private readonly cargosGateway: CargosGateway,
  ) {}

  async findAll(): Promise<Cargo[]> {
    return this.cargosRepository.find();
  }

  async findOne(id: number): Promise<Cargo> {
    const cargo = await this.cargosRepository.findOne({ where: { id } });
    if (!cargo) throw new NotFoundException('Cargo não encontrado');
    return cargo;
  }

  async create(data: Partial<Cargo>): Promise<Cargo> {
    const cargo = this.cargosRepository.create(data);
    const saved = await this.cargosRepository.save(cargo);
    this.cargosGateway.emitChange('cargo_created', saved);
    return saved;
  }

  async update(id: number, data: Partial<Cargo>): Promise<Cargo> {
    const cargo = await this.findOne(id);
    Object.assign(cargo, data);
    const updated = await this.cargosRepository.save(cargo);
    this.cargosGateway.emitChange('cargo_updated', updated);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const cargo = await this.findOne(id);
    await this.cargosRepository.remove(cargo);
    this.cargosGateway.emitChange('cargo_deleted', { id });
  }
}
