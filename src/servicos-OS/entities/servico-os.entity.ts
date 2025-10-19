import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrdemServico } from '../../ordens_servico/entities/ordem-servico.entity';

@Entity('servicos_os')
export class ServicoOs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ordem_id' })
  ordem_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descricao: string;

  @Column('decimal', { precision: 10, scale: 2, default: 1.00 })
  quantidade: number;

  @Column('decimal', { name: 'valor_unitario', precision: 10, scale: 2, default: 0.00 })
  valor_unitario: number;

  @Column({ type: 'enum', enum: ['servico', 'peca'], default: 'servico' })
  tipo: 'servico' | 'peca';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => OrdemServico, (ordemServico) => ordemServico.id)
  @JoinColumn({ name: 'ordem_id' })
  ordem_servico: OrdemServico;

  // Campo virtual para cálculo do total
  get total(): number {
    return this.quantidade * this.valor_unitario;
  }
}