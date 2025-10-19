import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['senha'] as const)
) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;
}