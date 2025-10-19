import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Financeiro } from './entities/financeiro.entity';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private readonly financeiroRepository: Repository<Financeiro>,
  ) {}

  async create(createFinanceiroDto: CreateFinanceiroDto): Promise<Financeiro> {
    try {
      const financeiro = this.financeiroRepository.create({
        forma_pagamento: 'dinheiro',
        ...createFinanceiroDto
      });
      
      const savedFinanceiro = await this.financeiroRepository.save(financeiro);
      return await this.findOne(savedFinanceiro.id);
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao criar movimento financeiro: ${error.message}`);
    }
  }

  async findAll(): Promise<Financeiro[]> {
    try {
      return await this.financeiroRepository.find({
        relations: ['ordem_servico'],
        order: { data_movimento: 'DESC', id: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar movimentos financeiros: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Financeiro> {
    try {
      const financeiro = await this.financeiroRepository.findOne({
        where: { id },
        relations: ['ordem_servico'],
      });
      
      if (!financeiro) {
        throw new NotFoundException(`Movimento financeiro com ID ${id} não encontrado`);
      }
      
      return financeiro;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar movimento financeiro ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateFinanceiroDto: UpdateFinanceiroDto): Promise<Financeiro> {
    try {
      const financeiro = await this.findOne(id);
      await this.financeiroRepository.update(id, updateFinanceiroDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar movimento financeiro ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const financeiro = await this.findOne(id);
      await this.financeiroRepository.remove(financeiro);
      return { message: `Movimento financeiro com ID ${id} removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover movimento financeiro ${id}: ${error.message}`);
    }
  }

  async findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Financeiro[]> {
    try {
      return await this.financeiroRepository.find({
        where: {
          data_movimento: Between(dataInicio, dataFim)
        },
        relations: ['ordem_servico'],
        order: { data_movimento: 'ASC', id: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar movimentos por período: ${error.message}`);
    }
  }

  async findByTipo(tipo: 'receita' | 'despesa'): Promise<Financeiro[]> {
    try {
      return await this.financeiroRepository.find({
        where: { tipo },
        relations: ['ordem_servico'],
        order: { data_movimento: 'DESC', id: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar movimentos do tipo ${tipo}: ${error.message}`);
    }
  }

  async findByOrdemId(ordemId: number): Promise<Financeiro[]> {
    try {
      return await this.financeiroRepository.find({
        where: { ordem_id: ordemId },
        relations: ['ordem_servico'],
        order: { id: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar movimentos da ordem ${ordemId}: ${error.message}`);
    }
  }

  async calcularTotalPorTipo(dataInicio?: Date, dataFim?: Date): Promise<{ receita: number, despesa: number, saldo: number }> {
    try {
      let whereCondition = {};
      
      if (dataInicio && dataFim) {
        whereCondition = {
          data_movimento: Between(dataInicio, dataFim)
        };
      }

      const movimentos = await this.financeiroRepository.find({ where: whereCondition });
      
      const totais = movimentos.reduce((acc, movimento) => {
        if (movimento.tipo === 'receita') {
          acc.receita += Number(movimento.valor);
        } else {
          acc.despesa += Number(movimento.valor);
        }
        return acc;
      }, { receita: 0, despesa: 0 });

      return {
        ...totais,
        saldo: totais.receita - totais.despesa
      };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular totais: ${error.message}`);
    }
  }

  async calcularTotalPorFormaPagamento(dataInicio?: Date, dataFim?: Date): Promise<{ [key: string]: number }> {
    try {
      let whereCondition = {};
      
      if (dataInicio && dataFim) {
        whereCondition = {
          data_movimento: Between(dataInicio, dataFim),
          tipo: 'receita' // Apenas receitas têm forma de pagamento
        };
      } else {
        whereCondition = { tipo: 'receita' };
      }

      const movimentos = await this.financeiroRepository.find({ where: whereCondition });
      
      return movimentos.reduce((acc, movimento) => {
        const forma = movimento.forma_pagamento;
        acc[forma] = (acc[forma] || 0) + Number(movimento.valor);
        return acc;
      }, {});
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular totais por forma de pagamento: ${error.message}`);
    }
  }

  async criarReceitaDeOrdem(ordemId: number, valor: number, formaPagamento: string, descricao?: string): Promise<Financeiro> {
    try {
      const movimento = this.financeiroRepository.create({
        tipo: 'receita',
        descricao: descricao || `Receita da Ordem de Serviço #${ordemId}`,
        valor,
        data_movimento: new Date(),
        forma_pagamento: formaPagamento as any,
        ordem_id: ordemId
      });

      return await this.financeiroRepository.save(movimento);
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao criar receita da ordem: ${error.message}`);
    }
  }
}