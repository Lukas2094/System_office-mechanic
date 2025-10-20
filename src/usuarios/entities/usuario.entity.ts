import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Funcionario } from '../../funcionarios/entities/funcionario.entity';
import { Cargo } from '../../cargos/entities/cargo.entity';
import * as bcrypt from 'bcrypt';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'funcionario_id', nullable: true })
  funcionario_id: number;

  @Column({ name: 'cargo_id', nullable: true })
  cargo_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  senha_hash: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'ultimo_login', type: 'datetime', nullable: true })
  ultimo_login: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Funcionario, { nullable: true })
  @JoinColumn({ name: 'funcionario_id' })
  funcionario: Funcionario;

  @ManyToOne(() => Cargo, { nullable: true })
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.senha_hash && !this.senha_hash.startsWith('$2b$')) {
      this.senha_hash = await bcrypt.hash(this.senha_hash, 10);
    }
  }

  async validatePassword(senha: string): Promise<boolean> {
    return await bcrypt.compare(senha, this.senha_hash);
  }
}