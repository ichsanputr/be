import { Controller, Post, Get, Req, Body, UnauthorizedException } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth.dto';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private jwtService: JwtService,
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
      message: "Success",
      access_token: await this.jwtService.signAsync({
        user_id: users.id
      })
    };
  }

  @Get('/profile')
  async getProfile(@Req() req) {
    const jwtService = new JwtService()

    const userData = await jwtService.verifyAsync(
      req.headers.authorization.replace('Bearer ', ''),
      {
        secret: 'hard!to-guess_secret'
      }
    );

    const user = await this.knex.table('users').where({id : userData.user_id}).first();

    return {
      message: "Success",
      data: {user}
    };
  }
}