import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cliente } from '@/clientes/entities/cliente.entity';
import { Veiculo } from '@/veiculos/entities/veiculo.entity';
import { Funcionario } from '@/funcionarios/entities/funcionario.entity';
import { ServicoOs } from '@/servicos-OS/entities/servico-os.entity';

@Entity('ordens_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => (cliente as any).veiculos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Veiculo, (veiculo) => (veiculo as any).id, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'veiculo_id' })
  veiculo: Veiculo;

  @ManyToOne(() => Funcionario, (funcionario) => (funcionario as any).id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'funcionario_id' })
  funcionario?: Funcionario | null;

  @OneToMany(() => ServicoOs, (servicoOs) => servicoOs.ordem_servico)
  servicos: ServicoOs[];

  @CreateDateColumn({ name: 'data_abertura', type: 'datetime' })
  dataAbertura: Date;

  @Column({ name: 'data_fechamento', type: 'datetime', nullable: true })
  dataFechamento?: Date;

  @Column({
    type: 'enum',
    enum: ['aberta', 'em_andamento', 'concluida', 'faturada', 'cancelada'],
    default: 'aberta',
  })
  status: 'aberta' | 'em_andamento' | 'concluida' | 'faturada' | 'cancelada';

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal: number;
}
