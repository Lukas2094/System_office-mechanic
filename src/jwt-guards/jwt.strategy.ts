import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '@/usuarios/usuarios.service';
import { JwtPayload } from '@/usuarios/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usuariosService.validateUser(payload);
    if (!user || !user.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }
    return {
      sub: user.id,
      nome: user.nome,
      username: user.username,
      funcionario_id: user.funcionario_id,
      cargo_id: user.cargo_id,
    };
  }
}