import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdemServico } from './entities/ordem-servico.entity';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { Cliente } from '@/clientes/entities/cliente.entity';
import { Veiculo } from '@/veiculos/entities/veiculo.entity';
import { Funcionario } from '@/funcionarios/entities/funcionario.entity';

@Injectable()
export class OrdensServicoService {
  constructor(
    @InjectRepository(OrdemServico)
    private readonly ordemRepo: Repository<OrdemServico>,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,

    @InjectRepository(Veiculo)
    private readonly veiculoRepo: Repository<Veiculo>,

    @InjectRepository(Funcionario)
    private readonly funcionarioRepo: Repository<Funcionario>,
  ) {}

  async create(dto: CreateOrdemServicoDto): Promise<OrdemServico> {
    const cliente = await this.clienteRepo.findOne({ where: { id: dto.cliente_id } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const veiculo = await this.veiculoRepo.findOne({ where: { id: dto.veiculo_id } });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    let funcionario: Funcionario | null = null;
    if (dto.funcionario_id) {
      funcionario = await this.funcionarioRepo.findOne({ where: { id: dto.funcionario_id } });
      if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    }

    const ordem = this.ordemRepo.create({
      cliente,
      veiculo,
      funcionario: funcionario ?? null,
      status: dto.status ?? 'aberta',
      observacoes: dto.observacoes,
      valorTotal: dto.valor_total ?? 0,
    });

    return this.ordemRepo.save(ordem);
  }

  findAll(): Promise<OrdemServico[]> {
    return this.ordemRepo.find({ relations: ['cliente', 'veiculo', 'funcionario'] });
  }

  async findOne(id: number): Promise<OrdemServico> {
    const ordem = await this.ordemRepo.findOne({ where: { id }, relations: ['cliente', 'veiculo', 'funcionario'] });
    if (!ordem) throw new NotFoundException('Ordem de serviço não encontrada');
    return ordem;
  }

  async update(id: number, dto: UpdateOrdemServicoDto): Promise<OrdemServico> {
    const ordem = await this.findOne(id);

    if (dto.cliente_id) {
      const cliente = await this.clienteRepo.findOne({ where: { id: dto.cliente_id } });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');
      ordem.cliente = cliente;
    }

    if (dto.veiculo_id) {
      const veiculo = await this.veiculoRepo.findOne({ where: { id: dto.veiculo_id } });
      if (!veiculo) throw new NotFoundException('Veículo não encontrado');
      ordem.veiculo = veiculo;
    }

    if (dto.funcionario_id !== undefined) {
      if (dto.funcionario_id === null) {
        ordem.funcionario = null;
      } else {
        const funcionario = await this.funcionarioRepo.findOne({ where: { id: dto.funcionario_id } });
        if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
        ordem.funcionario = funcionario;
      }
    }

    if (dto.status) {
      ordem.status = dto.status;
      if (dto.status === 'concluida' || dto.status === 'cancelada' || dto.status === 'faturada') {
        ordem.dataFechamento = new Date();
      } else {
        ordem.dataFechamento = undefined;
      }
    }

    if (dto.observacoes !== undefined) ordem.observacoes = dto.observacoes;
    if (dto.valor_total !== undefined) ordem.valorTotal = dto.valor_total;

    await this.ordemRepo.save(ordem);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const ordem = await this.findOne(id);
    await this.ordemRepo.remove(ordem);
    return { deleted: true };
  }

  // método helper para faturar
  async faturar(id: number): Promise<OrdemServico> {
    const ordem = await this.findOne(id);
    ordem.status = 'faturada';
    ordem.dataFechamento = new Date();
    await this.ordemRepo.save(ordem);
    return this.findOne(id);
  }
}
