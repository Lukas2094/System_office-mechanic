import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtPayload, LoginResponse } from './jwt-payload.interface';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Verificar se username já existe
      const existingUser = await this.usuarioRepository.findOne({
        where: { username: createUsuarioDto.username }
      });
      if (existingUser) {
        throw new BadRequestException('Username já está em uso');
      }

      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        senha_hash: createUsuarioDto.senha // Será hasheado no entity
      });

      const savedUsuario = await this.usuarioRepository.save(usuario);
      return await this.findOne(savedUsuario.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      return await this.usuarioRepository.find({
        relations: ['funcionario', 'cargo'],
        order: { username: 'ASC' }
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
        relations: ['funcionario', 'cargo'],
      });
      
      if (!usuario) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }
      
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar usuário ${id}: ${error.message}`);
    }
  }

  async findByUsername(username: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { username },
        relations: ['funcionario', 'cargo'],
      });
      
      if (!usuario) {
        throw new NotFoundException(`Usuário ${username} não encontrado`);
      }
      
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao buscar usuário por username: ${error.message}`);
    }
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    try {
      const usuario = await this.findOne(id);
      
      // Verificar se novo username já existe (se foi alterado)
      if (updateUsuarioDto.username && updateUsuarioDto.username !== usuario.username) {
        const existingUser = await this.usuarioRepository.findOne({
          where: { username: updateUsuarioDto.username }
        });
        if (existingUser) {
          throw new BadRequestException('Username já está em uso');
        }
      }

      const updateData: any = { ...updateUsuarioDto };
      if (updateUsuarioDto.senha) {
        updateData.senha_hash = updateUsuarioDto.senha; // Será hasheado no entity
      }

      await this.usuarioRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao atualizar usuário ${id}: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const usuario = await this.findOne(id);
      await this.usuarioRepository.remove(usuario);
      return { message: `Usuário com ID ${id} removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao remover usuário ${id}: ${error.message}`);
    }
  }

  async login(loginUsuarioDto: LoginUsuarioDto): Promise<LoginResponse> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { username: loginUsuarioDto.username },
        relations: ['funcionario', 'cargo'],
      });

      if (!usuario) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (!usuario.ativo) {
        throw new UnauthorizedException('Usuário inativo');
      }

      const isPasswordValid = await usuario.validatePassword(loginUsuarioDto.senha);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Atualizar último login
      await this.usuarioRepository.update(usuario.id, { 
        ultimo_login: new Date() 
      });

      const payload: JwtPayload = {
        sub: usuario.id,
        username: usuario.username,
        funcionario_id: usuario.funcionario_id,
        cargo_id: usuario.cargo_id,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          funcionario_id: usuario.funcionario_id,
          cargo_id: usuario.cargo_id,
          ativo: usuario.ativo,
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro no login: ${error.message}`);
    }
  }

  async validateUser(payload: JwtPayload): Promise<Usuario> {
    try {
      return await this.findOne(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const usuario = await this.findOne(id);
      
      const isOldPasswordValid = await usuario.validatePassword(oldPassword);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Senha atual incorreta');
      }

      await this.usuarioRepository.update(id, { 
        senha_hash: newPassword // Será hasheado no entity
      });

      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao alterar senha: ${error.message}`);
    }
  }

  async deactivateUser(id: number): Promise<Usuario> {
    try {
      await this.usuarioRepository.update(id, { ativo: false });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao desativar usuário: ${error.message}`);
    }
  }

  async activateUser(id: number): Promise<Usuario> {
    try {
      await this.usuarioRepository.update(id, { ativo: true });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erro ao ativar usuário: ${error.message}`);
    }
  }

  async getEstatisticas(): Promise<any> {
    try {
      const [total, ativos, inativos, ultimosLogin] = await Promise.all([
        this.usuarioRepository.count(),
        this.usuarioRepository.count({ where: { ativo: true } }),
        this.usuarioRepository.count({ where: { ativo: false } }),
        this.usuarioRepository.find({
          where: { ultimo_login: Not(IsNull()) },
          order: { ultimo_login: 'DESC' },
          take: 5,
          relations: ['funcionario']
        })
      ]);

      return {
        total,
        ativos,
        inativos,
        ultimos_login: ultimosLogin.map(user => ({
          id: user.id,
          username: user.username,
          funcionario: user.funcionario?.nome,
          ultimo_login: user.ultimo_login
        }))
      };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao calcular estatísticas: ${error.message}`);
    }
  }
}