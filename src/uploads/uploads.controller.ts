import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { JwtAuthGuard } from '@/jwt-guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadsService.create(createUploadDto);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        callback(null, filename);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Tipo de arquivo não permitido'), false);
      }
    }
  }))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() fileUploadDto: FileUploadDto
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const createUploadDto: CreateUploadDto = {
      ordem_id: fileUploadDto.ordem_id,
      cliente_id: fileUploadDto.cliente_id,
      url_arquivo: `/uploads/${file.filename}`,
      tipo_arquivo: fileUploadDto.tipo_arquivo || file.mimetype
    };

    return this.uploadsService.create(createUploadDto);
  }

  @Get()
  findAll() {
    return this.uploadsService.findAll();
  }

  @Get('ordem/:ordemId')
  findByOrdemId(@Param('ordemId', ParseIntPipe) ordemId: number) {
    return this.uploadsService.findByOrdemId(ordemId);
  }

  @Get('cliente/:clienteId')
  findByClienteId(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.uploadsService.findByClienteId(clienteId);
  }

  @Get('tipo/:tipo')
  findByTipoArquivo(@Param('tipo') tipo: string) {
    return this.uploadsService.findByTipoArquivo(tipo);
  }

  @Get('periodo')
  findByPeriodo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string
  ) {
    return this.uploadsService.findByPeriodo(new Date(dataInicio), new Date(dataFim));
  }

  @Get('recentes')
  getUploadsRecentes(@Query('limit') limit: number = 10) {
    return this.uploadsService.getUploadsRecentes(limit);
  }

  @Get('estatisticas')
  getEstatisticas() {
    return this.uploadsService.getEstatisticas();
  }

  @Get('search')
  searchByFileName(@Query('filename') filename: string) {
    return this.uploadsService.searchByFileName(filename);
  }

  @Get('arquivos')
  getArquivosPorOrdemECliente(
    @Query('ordemId') ordemId?: number,
    @Query('clienteId') clienteId?: number
  ) {
    return this.uploadsService.getArquivosPorOrdemECliente(ordemId, clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uploadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(id, updateUploadDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploadsService.remove(id);
  }
}