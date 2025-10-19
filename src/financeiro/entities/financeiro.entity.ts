import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrdemServico } from '../../ordens_servico/entities/ordem-servico.entity';

@Entity('financeiro')
export class Financeiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['receita', 'despesa'] })
  tipo: 'receita' | 'despesa';

  @Column({ type: 'varchar', length: 200, nullable: true })
  descricao: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ name: 'data_movimento', type: 'date' })
  data_movimento: Date;

  @Column({ 
    name: 'forma_pagamento', 
    type: 'enum', 
    enum: ['dinheiro', 'cartao', 'pix', 'boleto'],
    default: 'dinheiro'
  })
  forma_pagamento: 'dinheiro' | 'cartao' | 'pix' | 'boleto';

  @Column({ name: 'ordem_id', nullable: true })
  ordem_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => OrdemServico, (ordemServico) => ordemServico.id)
  @JoinColumn({ name: 'ordem_id' })
  ordem_servico: OrdemServico;
}