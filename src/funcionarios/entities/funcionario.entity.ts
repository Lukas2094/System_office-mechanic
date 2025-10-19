import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Cargo } from '@/cargos/entities/cargo.entity';

@Entity('funcionarios')
export class Funcionario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @ManyToOne(() => Cargo, (cargo) => cargo.id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cargo_id' })
  cargo?: Cargo | null;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salario: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  ativo: boolean;

  @CreateDateColumn({ name: 'data_cadastro' })
  dataCadastro: Date;
}
