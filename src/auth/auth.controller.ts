import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from '@lukeed/uuid';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private jwtService: JwtService
  ) { }

  @Post('/login')
  async checkLogin(@Body() body: AuthLoginDto) {
    const users = await this.knex.table('users')
      .where('username', body.username)
      .where('password', body.password)
      .first();

    if (!users) {
      throw new UnauthorizedException('Wrong authentication')
    }

    return {
      msg: "Success",
      access_token:  await this.jwtService.signAsync({
        user_id: users.id
      })
    };
  }

  @Post('/register')
  async registerUser(@Body() body: AuthRegisterDto) {
    const users = await this.knex.table('users')
      .insert({
        id: uuid(),
        username: body.username,
        password: body.password,
        package: body.package,
      });

    if (!users) {
      throw new InternalServerErrorException()
    }

    return {
      msg: "Success"
    };
  }
}