import { IsInt, IsOptional, IsString } from 'class-validator';

export class FileUploadDto {
  @IsOptional()
  @IsInt()
  ordem_id?: number;

  @IsOptional()
  @IsInt()
  cliente_id?: number;

  @IsOptional()
  @IsString()
  tipo_arquivo?: string;
}