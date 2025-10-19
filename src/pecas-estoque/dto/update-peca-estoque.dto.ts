import { PartialType } from '@nestjs/mapped-types';
import { CreatePecaEstoqueDto } from './create-peca-estoque.dto';

export class UpdatePecaEstoqueDto extends PartialType(CreatePecaEstoqueDto) {}