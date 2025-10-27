import { PartialType } from '@nestjs/mapped-types';
import { CreateServicoOsDto } from './create-servico-os.dto';

export class UpdateServicoOsDto extends PartialType(CreateServicoOsDto) { }