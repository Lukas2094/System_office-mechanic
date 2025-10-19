import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicoOs } from './entities/servico-os.entity';
import { CreateServicoOsDto } from './dto/create-servico-os.dto';
import { UpdateServicoOsDto } from './dto/update-servico-os.dto';

@Injectable()
export class ServicosOsService {
  constructor(
    @InjectRepository(ServicoOs)
    private readonly servicoOsRepository: Repository<ServicoOs>,
  ) {}

  async create(createServicoOsDto: CreateServicoOsDto): Promise<ServicoOs> {
    try {
      const servicoData = {
        quantidade: 1.00,
        valor_unitario: 0.00,
        tipo: 'servico' as 'servico' | 'peca',
        ...createServicoOsDto
      };
      
      const servico = this.servicoOsRepository.create(servicoData);
      const savedServico = await this.servicoOsRepository.save(servico);
      
      return await this.findOne(savedServico.id);
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao criar serviço/peça: ${error.message}`);
    }
  }

  async findAll(): Promise<ServicoOs[]> {
    try {
      return await this.servicoOsRepository.find({
        relations: ['ordem_servico'],
        order: { id: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar serviços/peças: ${error.message}`);
    }
  }

  async findByOrdemId(ordemId: number): Promise<ServicoOs[]> {
    try {
      return await this.servicoOsRepository.find({
        where: { ordem_id: ordemId },
        relations: ['ordem_servico'],
        order: { id: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar serviços/peças da ordem ${ordemId}: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<ServicoOs> {
    try {
      const servico = await this.servicoOsRepository.findOne({
        where: { id },
        relations: ['ordem_servico'],
      });
      
      if (!servico) {
        throw new NotFoundException(`Serviço/Peça com ID ${id} não encontrado`);
      }
      
      return servico;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar serviço/peça ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateServicoOsDto: UpdateServicoOsDto): Promise<ServicoOs> {
    try {
      const servico = await this.findOne(id);
      await this.servicoOsRepository.update(id, updateServicoOsDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar serviço/peça ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const servico = await this.findOne(id);
      await this.servicoOsRepository.remove(servico);
      return { message: `Serviço/Peça com ID ${id} removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover serviço/peça ${id}: ${error.message}`);
    }
  }

  async removeAllByOrdemId(ordemId: number): Promise<{ message: string }> {
    try {
      const servicos = await this.findByOrdemId(ordemId);
      await this.servicoOsRepository.remove(servicos);
      return { message: `Todos os serviços/peças da ordem ${ordemId} foram removidos` };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao remover serviços/peças da ordem ${ordemId}: ${error.message}`);
    }
  }

  async calcularTotalOrdem(ordemId: number): Promise<number> {
    try {
      const servicos = await this.findByOrdemId(ordemId);
      return servicos.reduce((total, servico) => {
        return total + (servico.quantidade * servico.valor_unitario);
      }, 0);
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular total da ordem ${ordemId}: ${error.message}`);
    }
  }

  async contarPorTipo(ordemId: number): Promise<{ servicos: number, pecas: number }> {
    try {
      const servicos = await this.findByOrdemId(ordemId);
      
      return servicos.reduce((acc, servico) => {
        if (servico.tipo === 'servico') {
          acc.servicos += 1;
        } else if (servico.tipo === 'peca') {
          acc.pecas += 1;
        }
        return acc;
      }, { servicos: 0, pecas: 0 });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao contar serviços/peças da ordem ${ordemId}: ${error.message}`);
    }
  }

  async buscarPorTipo(tipo: 'servico' | 'peca'): Promise<ServicoOs[]> {
    try {
      return await this.servicoOsRepository.find({
        where: { tipo },
        relations: ['ordem_servico'],
        order: { id: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar itens do tipo ${tipo}: ${error.message}`);
    }
  }

  async atualizarValorUnitario(id: number, novoValor: number): Promise<ServicoOs> {
    try {
      await this.servicoOsRepository.update(id, { valor_unitario: novoValor });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar valor do item ${id}: ${error.message}`);
    }
  }
}