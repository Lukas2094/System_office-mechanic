export class CreateVeiculoDto {
  cliente_id: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  chassi: string;
  cor: string;
  motor?: string;
  quilometragem?: number;
  observacoes?: string;
}
