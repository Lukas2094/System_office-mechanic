import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual } from 'typeorm';
import { PecaEstoque } from './entities/peca-estoque.entity';
import { CreatePecaEstoqueDto } from './dto/create-peca-estoque.dto';
import { UpdatePecaEstoqueDto } from './dto/update-peca-estoque.dto';

@Injectable()
export class PecasEstoqueService {
  constructor(
    @InjectRepository(PecaEstoque)
    private readonly pecaEstoqueRepository: Repository<PecaEstoque>,
  ) {}

  async create(createPecaEstoqueDto: CreatePecaEstoqueDto): Promise<PecaEstoque> {
    try {
      // Verificar se código interno já existe
      if (createPecaEstoqueDto.codigo_interno) {
        const existing = await this.pecaEstoqueRepository.findOne({
          where: { codigo_interno: createPecaEstoqueDto.codigo_interno }
        });
        if (existing) {
          throw new BadRequestException('Código interno já existe');
        }
      }

      const peca = this.pecaEstoqueRepository.create(createPecaEstoqueDto);
      const savedPeca = await this.pecaEstoqueRepository.save(peca);
      return await this.findOne(savedPeca.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao criar peça: ${error.message}`);
    }
  }

  async findAll(): Promise<PecaEstoque[]> {
    try {
      return await this.pecaEstoqueRepository.find({
        order: { nome: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar peças: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<PecaEstoque> {
    try {
      const peca = await this.pecaEstoqueRepository.findOne({
        where: { id }
      });
      
      if (!peca) {
        throw new NotFoundException(`Peça com ID ${id} não encontrada`);
      }
      
      return peca;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar peça ${id}: ${error.message}`);
    }
  }

  async findByCodigoInterno(codigo: string): Promise<PecaEstoque> {
    try {
      const peca = await this.pecaEstoqueRepository.findOne({
        where: { codigo_interno: codigo }
      });
      
      if (!peca) {
        throw new NotFoundException(`Peça com código interno ${codigo} não encontrada`);
      }
      
      return peca;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar peça por código: ${error.message}`);
    }
  }

  async update(id: number, updatePecaEstoqueDto: UpdatePecaEstoqueDto): Promise<PecaEstoque> {
    try {
      const peca = await this.findOne(id);
      
      // Verificar se novo código interno já existe (se foi alterado)
      if (updatePecaEstoqueDto.codigo_interno && updatePecaEstoqueDto.codigo_interno !== peca.codigo_interno) {
        const existing = await this.pecaEstoqueRepository.findOne({
          where: { codigo_interno: updatePecaEstoqueDto.codigo_interno }
        });
        if (existing) {
          throw new BadRequestException('Código interno já existe');
        }
      }

      await this.pecaEstoqueRepository.update(id, updatePecaEstoqueDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar peça ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const peca = await this.findOne(id);
      await this.pecaEstoqueRepository.remove(peca);
      return { message: `Peça com ID ${id} removida com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover peça ${id}: ${error.message}`);
    }
  }

  async searchByName(nome: string): Promise<PecaEstoque[]> {
    try {
      return await this.pecaEstoqueRepository.find({
        where: { nome: Like(`%${nome}%`) },
        order: { nome: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar peças por nome: ${error.message}`);
    }
  }

  async getEstoqueBaixo(): Promise<PecaEstoque[]> {
    try {
      return await this.pecaEstoqueRepository
        .createQueryBuilder('peca')
        .where('peca.quantidade <= peca.estoque_minimo')
        .orderBy('peca.quantidade', 'ASC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar peças com estoque baixo: ${error.message}`);
    }
  }

  async getEstoqueZero(): Promise<PecaEstoque[]> {
    try {
      return await this.pecaEstoqueRepository.find({
        where: { quantidade: 0 },
        order: { nome: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar peças com estoque zero: ${error.message}`);
    }
  }

  async atualizarEstoque(id: number, quantidade: number, operacao: 'entrada' | 'saida'): Promise<PecaEstoque> {
    try {
      const peca = await this.findOne(id);
      
      let novaQuantidade = peca.quantidade;
      if (operacao === 'entrada') {
        novaQuantidade += quantidade;
      } else if (operacao === 'saida') {
        if (peca.quantidade < quantidade) {
          throw new BadRequestException('Estoque insuficiente');
        }
        novaQuantidade -= quantidade;
      }

      await this.pecaEstoqueRepository.update(id, { quantidade: novaQuantidade });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar estoque: ${error.message}`);
    }
  }

  async getEstatisticas(): Promise<any> {
    try {
      const [totalPecas, estoqueBaixo, estoqueZero, valorTotalEstoque] = await Promise.all([
        this.pecaEstoqueRepository.count(),
        this.pecaEstoqueRepository.count({ where: { quantidade: LessThanOrEqual(0) } }),
        this.pecaEstoqueRepository.count({ where: { quantidade: 0 } }),
        this.pecaEstoqueRepository
          .createQueryBuilder('peca')
          .select('SUM(peca.quantidade * peca.preco_custo)', 'valorTotal')
          .getRawOne()
      ]);

      const pecasComEstoqueBaixo = await this.getEstoqueBaixo();

      return {
        total_pecas: totalPecas,
        estoque_baixo: estoqueBaixo,
        estoque_zero: estoqueZero,
        valor_total_estoque: parseFloat(valorTotalEstoque.valorTotal) || 0,
        pecas_estoque_baixo: pecasComEstoqueBaixo.length,
        alertas_estoque: pecasComEstoqueBaixo.map(peca => ({
          id: peca.id,
          nome: peca.nome,
          quantidade: peca.quantidade,
          estoque_minimo: peca.estoque_minimo
        }))
      };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular estatísticas: ${error.message}`);
    }
  }

  async buscarPorFornecedor(fornecedorId: number): Promise<PecaEstoque[]> {
    try {
      return await this.pecaEstoqueRepository.find({
        where: { fornecedor_id: fornecedorId },
        order: { nome: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar peças do fornecedor: ${error.message}`);
    }
  }

  async atualizarPreco(id: number, precoCusto: number, precoVenda: number): Promise<PecaEstoque> {
    try {
      await this.pecaEstoqueRepository.update(id, { 
        preco_custo: precoCusto,
        preco_venda: precoVenda
      });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar preços: ${error.message}`);
    }
  }
}