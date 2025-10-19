import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funcionario } from './entities/funcionario.entity';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { FuncionariosGateway } from './funcionarios.gateway';
import { Cargo } from '@/cargos/entities/cargo.entity';

@Injectable()
export class FuncionariosService {
  constructor(
    @InjectRepository(Funcionario)
    private readonly funcionarioRepository: Repository<Funcionario>,
    private readonly gateway: FuncionariosGateway,
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
  ) {}

  async create(dto: CreateFuncionarioDto) {
    const funcionario = this.funcionarioRepository.create(dto);
    const saved = await this.funcionarioRepository.save(funcionario);
    this.gateway.emitFuncionarioCriado(saved);
    return saved;
  }

  findAll() {
    return this.funcionarioRepository.find({ relations: ['cargo'] });
  }

  findOne(id: number) {
    return this.funcionarioRepository.findOne({
      where: { id },
      relations: ['cargo'],
    });
  }

  async update(id: number, dto: UpdateFuncionarioDto) {
    await this.funcionarioRepository.update(id, dto);
    const updated = await this.findOne(id);
    this.gateway.emitFuncionarioAtualizado(updated);
    return updated;
  }

  async remove(id: number) {
    await this.funcionarioRepository.delete(id);
    this.gateway.emitFuncionarioRemovido({ id });
    return { deleted: true };
  }

  async setCargo(funcionarioId: number, cargoId: number | null) {
    const funcionario = await this.funcionarioRepository.findOne({ where: { id: funcionarioId }, relations: ['cargo'] });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    if (cargoId === null) {
      funcionario.cargo = null;
      await this.funcionarioRepository.save(funcionario);
      this.gateway.emitFuncionarioAtualizado(funcionario);
      return funcionario;
    }

    const cargo = await this.cargoRepo.findOne({ where: { id: cargoId } });
    if (!cargo) throw new NotFoundException('Cargo não encontrado');

    funcionario.cargo = cargo;
    const saved = await this.funcionarioRepository.save(funcionario);
    this.gateway.emitFuncionarioAtualizado(saved);
    return saved;
  }
}
