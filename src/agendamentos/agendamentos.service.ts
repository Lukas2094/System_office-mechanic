import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepository: Repository<Agendamento>,
  ) {}

  async create(createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
    try {
      // Validar se a data é futura
      const dataAgendamento = new Date(createAgendamentoDto.data_agendamento);
      if (dataAgendamento <= new Date()) {
        throw new BadRequestException('A data do agendamento deve ser futura');
      }

      // Verificar conflito de horário para o funcionário
      if (createAgendamentoDto.funcionario_id) {
        const conflito = await this.verificarConflitoHorario(
          createAgendamentoDto.funcionario_id,
          dataAgendamento
        );
        if (conflito) {
          throw new BadRequestException('Já existe um agendamento para este funcionário neste horário');
        }
      }

      const agendamento = this.agendamentoRepository.create(createAgendamentoDto);
      const savedAgendamento = await this.agendamentoRepository.save(agendamento);
      return await this.findOne(savedAgendamento.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  async findAll(): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Agendamento> {
    try {
      const agendamento = await this.agendamentoRepository.findOne({
        where: { id },
        relations: ['cliente', 'veiculo', 'funcionario'],
      });
      
      if (!agendamento) {
        throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
      }
      
      return agendamento;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar agendamento ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateAgendamentoDto: UpdateAgendamentoDto): Promise<Agendamento> {
    try {
      const agendamento = await this.findOne(id);
      
      // Validar se a data é futura (se foi alterada)
      if (updateAgendamentoDto.data_agendamento) {
        const dataAgendamento = new Date(updateAgendamentoDto.data_agendamento);
        if (dataAgendamento <= new Date()) {
          throw new BadRequestException('A data do agendamento deve ser futura');
        }

        // Verificar conflito de horário para o funcionário
        const funcionarioId = updateAgendamentoDto.funcionario_id || agendamento.funcionario_id;
        if (funcionarioId) {
          const conflito = await this.verificarConflitoHorario(
            funcionarioId,
            dataAgendamento,
            id // excluir o próprio agendamento da verificação
          );
          if (conflito) {
            throw new BadRequestException('Já existe um agendamento para este funcionário neste horário');
          }
        }
      }

      await this.agendamentoRepository.update(id, updateAgendamentoDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar agendamento ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const agendamento = await this.findOne(id);
      await this.agendamentoRepository.remove(agendamento);
      return { message: `Agendamento com ID ${id} removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover agendamento ${id}: ${error.message}`);
    }
  }

  async findByCliente(clienteId: number): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        where: { cliente_id: clienteId },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos do cliente: ${error.message}`);
    }
  }

  async findByFuncionario(funcionarioId: number): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        where: { funcionario_id: funcionarioId },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos do funcionário: ${error.message}`);
    }
  }

  async findByStatus(status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        where: { status },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos por status: ${error.message}`);
    }
  }

  async findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        where: {
          data_agendamento: Between(dataInicio, dataFim)
        },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos por período: ${error.message}`);
    }
  }

  async getAgendamentosHoje(): Promise<Agendamento[]> {
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

      return await this.agendamentoRepository.find({
        where: {
          data_agendamento: Between(inicioDia, fimDia)
        },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos de hoje: ${error.message}`);
    }
  }

  async getAgendamentosFuturos(): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository.find({
        where: {
          data_agendamento: MoreThanOrEqual(new Date())
        },
        relations: ['cliente', 'veiculo', 'funcionario'],
        order: { data_agendamento: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos futuros: ${error.message}`);
    }
  }

  async atualizarStatus(
    id: number,
    status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'
  ): Promise<Agendamento> {
    try {
      await this.agendamentoRepository.update(id, { status: status as any });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar status: ${error.message}`);
    }
  }

  async getEstatisticas(): Promise<any> {
    try {
      const [
        total,
        pendentes,
        confirmados,
        concluidos,
        cancelados,
        agendamentosHoje
      ] = await Promise.all([
        this.agendamentoRepository.count(),
        this.agendamentoRepository.count({ where: { status: 'pendente' } }),
        this.agendamentoRepository.count({ where: { status: 'confirmado' } }),
        this.agendamentoRepository.count({ where: { status: 'concluido' } }),
        this.agendamentoRepository.count({ where: { status: 'cancelado' } }),
        this.getAgendamentosHoje()
      ]);

      return {
        total,
        por_status: {
          pendentes,
          confirmados,
          concluidos,
          cancelados
        },
        agendamentos_hoje: agendamentosHoje.length,
        proximos_agendamentos: agendamentosHoje.slice(0, 5)
      };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular estatísticas: ${error.message}`);
    }
  }

  private async verificarConflitoHorario(
    funcionarioId: number, 
    dataAgendamento: Date, 
    excludeAgendamentoId?: number
  ): Promise<boolean> {
    const inicio = new Date(dataAgendamento);
    const fim = new Date(dataAgendamento.getTime() + 60 * 60 * 1000); // +1 hora

    let query = this.agendamentoRepository
      .createQueryBuilder('agendamento')
      .where('agendamento.funcionario_id = :funcionarioId', { funcionarioId })
      .andWhere('agendamento.status IN (:...status)', { 
        status: ['pendente', 'confirmado'] 
      })
      .andWhere(
        '(agendamento.data_agendamento BETWEEN :inicio AND :fim OR ' +
        'DATE_ADD(agendamento.data_agendamento, INTERVAL 1 HOUR) BETWEEN :inicio AND :fim)',
        { inicio, fim }
      );

    if (excludeAgendamentoId) {
      query = query.andWhere('agendamento.id != :excludeId', { excludeId: excludeAgendamentoId });
    }

    const conflito = await query.getOne();
    return !!conflito;
  }

  async searchByClienteNome(nome: string): Promise<Agendamento[]> {
    try {
      return await this.agendamentoRepository
        .createQueryBuilder('agendamento')
        .leftJoinAndSelect('agendamento.cliente', 'cliente')
        .leftJoinAndSelect('agendamento.veiculo', 'veiculo')
        .leftJoinAndSelect('agendamento.funcionario', 'funcionario')
        .where('cliente.nome LIKE :nome', { nome: `%${nome}%` })
        .orderBy('agendamento.data_agendamento', 'DESC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar agendamentos por nome do cliente: ${error.message}`);
    }
  }
}