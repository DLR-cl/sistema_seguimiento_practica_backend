import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database/database.service';

@Injectable()
export class UsersService {

  constructor(private readonly databaseService : DatabaseService){
  }
  async create(createUserDto: CreateUserDto) {

    try {

      // no user create (mover a otra función)
      const find_user = await this.databaseService.usuario.findUnique({
        where: {
          rut: createUserDto.rut,
        }
      });

      if(find_user){
        throw new HttpException('Ya existe un usuario creado con estos datos', HttpStatus.BAD_REQUEST);
      };

      // si no existe ese usuario
      const create_user = await this.databaseService.usuario.create({data: find_user});
      return {
        status: HttpStatus.OK,
        message: 'Creación correcta del usuario',
        data: create_user,
      }
    } catch(error) {
      throw new HttpException('Error al crear un usuario', HttpStatus.BAD_REQUEST);
    }

  };

  findAll() {
    return this.databaseService.usuario.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
