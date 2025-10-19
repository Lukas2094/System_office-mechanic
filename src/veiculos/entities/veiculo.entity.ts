import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Cliente } from '@/clientes/entities/cliente.entity';

@Entity('veiculos')
export class Veiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.veiculos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: number;

  @Column()
  placa: string;

  @Column()
  chassi: string;

  @Column()
  cor: string;

  @Column({ nullable: true })
  motor: string;

  @Column({ type: 'int', nullable: true })
  quilometragem: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'data_cadastro' })
  dataCadastro: Date;
}