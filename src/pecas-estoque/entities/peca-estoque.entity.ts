import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pecas_estoque')
export class PecaEstoque {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'codigo_interno', type: 'varchar', length: 50, unique: true, nullable: true })
  codigo_interno: string;

  @Column({ name: 'codigo_fornecedor', type: 'varchar', length: 50, nullable: true })
  codigo_fornecedor: string;

  @Column({ type: 'int', default: 0 })
  quantidade: number;

  @Column({ name: 'preco_custo', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  preco_custo: number;

  @Column({ name: 'preco_venda', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  preco_venda: number;

  @Column({ name: 'estoque_minimo', type: 'int', default: 0 })
  estoque_minimo: number;

  @Column({ name: 'fornecedor_id', type: 'int', nullable: true })
  fornecedor_id: number;

  @CreateDateColumn({ name: 'data_cadastro' })
  data_cadastro: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Campo virtual para verificar se está abaixo do estoque mínimo
  get abaixo_estoque_minimo(): boolean {
    return this.quantidade <= this.estoque_minimo;
  }

  // Campo virtual para calcular o lucro
  get lucro(): number {
    return this.preco_venda - this.preco_custo;
  }

  // Campo virtual para calcular a margem de lucro em percentual
  get margem_lucro(): number {
    if (this.preco_custo === 0) return 0;
    return ((this.preco_venda - this.preco_custo) / this.preco_custo) * 100;
  }

  // Campo virtual para valor total em estoque
  get valor_total_estoque(): number {
    return this.quantidade * this.preco_custo;
  }
}