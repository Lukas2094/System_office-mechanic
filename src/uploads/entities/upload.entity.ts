import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrdemServico } from '../../ordens_servico/entities/ordem-servico.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ordem_id', nullable: true })
  ordem_id: number;

  @Column({ name: 'cliente_id', nullable: true })
  cliente_id: number;

  @Column({ name: 'url_arquivo', type: 'varchar', length: 255 })
  url_arquivo: string;

  @Column({ name: 'tipo_arquivo', type: 'varchar', length: 50, nullable: true })
  tipo_arquivo: string;

  @CreateDateColumn({ name: 'data_upload' })
  data_upload: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relações
  @ManyToOne(() => OrdemServico)
  @JoinColumn({ name: 'ordem_id' })
  ordem_servico: OrdemServico;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // Campo virtual para obter extensão do arquivo
  get extensao(): string {
    return this.url_arquivo.split('.').pop()?.toLowerCase() || '';
  }

  // Campo virtual para verificar tipo de arquivo
  get isImagem(): boolean {
    const imagens = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imagens.includes(this.extensao);
  }

  get isDocumento(): boolean {
    const documentos = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    return documentos.includes(this.extensao);
  }

  get isVideo(): boolean {
    const videos = ['mp4', 'avi', 'mov', 'wmv'];
    return videos.includes(this.extensao);
  }
}