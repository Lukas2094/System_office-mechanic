import { Veiculo } from '@/veiculos/entities/veiculo.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'enum', enum: ['PF', 'PJ'], default: 'PF' })
  tipo: 'PF' | 'PJ';

  @Column({ length: 20, unique: true })
  cpf_cnpj: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  endereco: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 2, nullable: true })
  estado: string;

  @Column({ length: 10, nullable: true })
  cep: string;

  @CreateDateColumn({ name: 'data_cadastro' })
  dataCadastro: Date;

  @OneToMany(() => Veiculo, (veiculo) => veiculo.cliente)
  veiculos: Veiculo[];
}
