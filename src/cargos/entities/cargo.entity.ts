import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;
}
