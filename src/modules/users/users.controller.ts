import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Tipo_usuario } from '@prisma/client';
import { AuthRegisterDto } from 'src/auth/dto/authRegisterDto.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  public async registrarUsuario(@Body() usuario: AuthRegisterDto){
    return await this.usersService.signUp(usuario);
  }
  @Get(':id')
  public async obtenerUsuario(@Param('id') id: string) {
    return await this.usersService.obtenerUsuario(+id);
  }
  @Get('lista-rol/:rol')
  public async obtenerUsuariosByRol(@Param('rol') rol: string){
    const rolUsuario = Tipo_usuario[rol.toUpperCase() as keyof typeof Tipo_usuario];

    if (!rolUsuario) {
      throw new Error('Rol inválido');
    }
    return await this.usersService.obtenerUsuariosByRol(rolUsuario);
  }

  @UseGuards(AuthGuard) // Asegura que el usuario esté autenticado
  @Patch('change-password')
  async changePassword(
    @Req() req: any, // Obtener datos del usuario autenticado
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id; // Extrae el ID del usuario del token JWT
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}
