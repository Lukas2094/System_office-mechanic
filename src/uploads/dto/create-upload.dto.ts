import { IsString, IsInt, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateUploadDto {
  @IsOptional()
  @IsInt()
  ordem_id?: number;

  @IsOptional()
  @IsInt()
  cliente_id?: number;

  @IsString()
  @IsNotEmpty()
  url_arquivo: string;

  @IsOptional()
  @IsString()
  tipo_arquivo?: string;
}