import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Veiculo } from '../../veiculos/entities/veiculo.entity';
import { Funcionario } from '../../funcionarios/entities/funcionario.entity';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id' })
  cliente_id: number;

  @Column({ name: 'veiculo_id' })
  veiculo_id: number;

  @Column({ name: 'funcionario_id', nullable: true })
  funcionario_id: number;

  @Column({ name: 'data_agendamento', type: 'datetime' })
  data_agendamento: Date;

  @Column({ 
    type: 'enum', 
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
    default: 'pendente'
  })
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: 'veiculo_id' })
  veiculo: Veiculo;

  @ManyToOne(() => Funcionario)
  @JoinColumn({ name: 'funcionario_id' })
  funcionario: Funcionario;

  // Campo virtual para verificar se está no passado
  get isPassado(): boolean {
    return new Date() > this.data_agendamento;
  }

  // Campo virtual para verificar se é hoje
  get isHoje(): boolean {
    const hoje = new Date();
    const agendamento = new Date(this.data_agendamento);
    return hoje.toDateString() === agendamento.toDateString();
  }

  // Campo virtual para verificar se está pendente e no futuro
  get isAgendamentoFuturo(): boolean {
    return this.status === 'pendente' && new Date() < this.data_agendamento;
  }
}