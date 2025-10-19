import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, Not, IsNull } from 'typeorm';
import { Upload } from './entities/upload.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  async create(createUploadDto: CreateUploadDto): Promise<Upload> {
    try {
      // Validar que pelo menos uma referência existe
      if (!createUploadDto.ordem_id && !createUploadDto.cliente_id) {
        throw new BadRequestException('É necessário informar ordem_id ou cliente_id');
      }

      const upload = this.uploadRepository.create(createUploadDto);
      const savedUpload = await this.uploadRepository.save(upload);
      return await this.findOne(savedUpload.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao criar upload: ${error.message}`);
    }
  }

  async findAll(): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Upload> {
    try {
      const upload = await this.uploadRepository.findOne({
        where: { id },
        relations: ['ordem_servico', 'cliente'],
      });
      
      if (!upload) {
        throw new NotFoundException(`Upload com ID ${id} não encontrado`);
      }
      
      return upload;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar upload ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateUploadDto: UpdateUploadDto): Promise<Upload> {
    try {
      const upload = await this.findOne(id);
      
      // Validar que pelo menos uma referência existe
      if (updateUploadDto.ordem_id === null && updateUploadDto.cliente_id === null) {
        throw new BadRequestException('É necessário informar ordem_id ou cliente_id');
      }

      await this.uploadRepository.update(id, updateUploadDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar upload ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const upload = await this.findOne(id);
      await this.uploadRepository.remove(upload);
      return { message: `Upload com ID ${id} removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover upload ${id}: ${error.message}`);
    }
  }

  async findByOrdemId(ordemId: number): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        where: { ordem_id: ordemId },
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads da ordem ${ordemId}: ${error.message}`);
    }
  }

  async findByClienteId(clienteId: number): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        where: { cliente_id: clienteId },
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads do cliente ${clienteId}: ${error.message}`);
    }
  }

  async findByTipoArquivo(tipoArquivo: string): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        where: { tipo_arquivo: Like(`%${tipoArquivo}%`) },
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads por tipo: ${error.message}`);
    }
  }

  async findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        where: {
          data_upload: Between(dataInicio, dataFim)
        },
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads por período: ${error.message}`);
    }
  }

  async getUploadsRecentes(limit: number = 10): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' },
        take: limit
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar uploads recentes: ${error.message}`);
    }
  }

  async getEstatisticas(): Promise<any> {
    try {
      const [
        total,
        porOrdem,
        porCliente,
        recentes,
        porTipo
      ] = await Promise.all([
        this.uploadRepository.count(),
        this.uploadRepository.count({ where: { ordem_id: Not(IsNull()) } }),
        this.uploadRepository.count({ where: { cliente_id: Not(IsNull()) } }),
        this.getUploadsRecentes(5),
        this.uploadRepository
          .createQueryBuilder('upload')
          .select('upload.tipo_arquivo', 'tipo')
          .addSelect('COUNT(*)', 'quantidade')
          .groupBy('upload.tipo_arquivo')
          .getRawMany()
      ]);

      return {
        total,
        por_referencia: {
          ordens: porOrdem,
          clientes: porCliente
        },
        por_tipo: porTipo,
        uploads_recentes: recentes.map(upload => ({
          id: upload.id,
          url_arquivo: upload.url_arquivo,
          tipo_arquivo: upload.tipo_arquivo,
          data_upload: upload.data_upload,
          ordem_id: upload.ordem_id,
          cliente_id: upload.cliente_id
        }))
      };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular estatísticas: ${error.message}`);
    }
  }

  async searchByFileName(filename: string): Promise<Upload[]> {
    try {
      return await this.uploadRepository.find({
        where: { url_arquivo: Like(`%${filename}%`) },
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar arquivos por nome: ${error.message}`);
    }
  }

  async getArquivosPorOrdemECliente(ordemId?: number, clienteId?: number): Promise<Upload[]> {
    try {
      const where: any = {};
      
      if (ordemId) {
        where.ordem_id = ordemId;
      }
      
      if (clienteId) {
        where.cliente_id = clienteId;
      }

      return await this.uploadRepository.find({
        where,
        relations: ['ordem_servico', 'cliente'],
        order: { data_upload: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar arquivos: ${error.message}`);
    }
  }
}