export interface JwtPayload {
  sub: number;
  username: string;
  funcionario_id?: number;
  cargo_id?: number;
}

export interface LoginResponse {
  access_token: string;
  usuario: {
    id: number;
    username: string;
    funcionario_id?: number;
    cargo_id?: number;
    ativo: boolean;
  };
}