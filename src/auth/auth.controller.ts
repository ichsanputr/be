import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthLoginDto, AuthRegisterDto } from './dto/auth.dto';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from '@lukeed/uuid';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private jwtService: JwtService,
    private readonly http: HttpService
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

  @Post('/register')
  async registerUser(@Body() body: AuthRegisterDto) {
    const randInt = Math.floor(Math.random() * 1078) + 1
    const users = await this.knex.table('users')
      .insert({
        id: uuid(),
        username: body.username,
        password: body.password,
        package: body.package,
        hit_request: 0,
        google_id: '',
        access_token: uuid() + randInt.toString()
      });

    if (!users) {
      throw new InternalServerErrorException()
    }

    return {
      message: "Success"
    };
  }

  @Post('/google/register')
  async googleRegister(@Body() body: { code: String }) {
    const data = await firstValueFrom(
      this.http.post('https://oauth2.googleapis.com/token', {
        code: body.code,
        client_id: '676048652820-4mo55iv0sh18eglm89q1f4vpp471jk91.apps.googleusercontent.com',
        client_secret: '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',
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code'
      }).pipe(
        catchError(() => {
          throw 'An error happened!';
        }),
      )
    );

    const resp = await firstValueFrom(
      this.http.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${data.data.access_token}`
        }
      }).pipe(
        catchError((err) => {
          console.log(err)
          throw 'An error happened!';
        }),
      )
    );

    const randInt = Math.floor(Math.random() * 1078) + 1

    await this.knex.table('users')
      .insert({
        id: uuid(),
        username: resp.data.name,
        password: 1,
        package: 'free',
        hit_request: 0,
        google_id: resp.data.sub.toString(),
        access_token: uuid() + randInt.toString()
      });

    return {
      message: "Success",
    };
  }

  @Post('/google/verify')
  async googleVerify(@Body() body: { code: String }) {
    console.log("google verify run")
    const data = await firstValueFrom(
      this.http.post('https://oauth2.googleapis.com/token', {
        code: body.code,
        client_id: '676048652820-4mo55iv0sh18eglm89q1f4vpp471jk91.apps.googleusercontent.com',
        client_secret: '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',
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code'
      }).pipe(
        catchError((err) => {
          console.log(err)
          throw err;
        }),
      )
    );

    const resp = await firstValueFrom(
      this.http.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${data.data.access_token}`
        }
      }).pipe(
        catchError((err) => {
          console.log(err)
          throw err;
        }),
      )
    );

    const user = await this.knex.table('users')
      .where('username', resp.data.name)
      .where('google_id', resp.data.sub)
      .first();

    if (!user) {
      throw new UnauthorizedException('Wrong authentication')
    }

    return {
      message: "Success",
      access_token: await this.jwtService.signAsync({
        user_id: user.id
      })
    };
  }

  @Post('/profile')
  async getProfile(@Body() body: { access_token: string }) {
    const jwtService = new JwtService()

    const userData = await jwtService.verifyAsync(
      body.access_token,
      {
        secret: 'hard!to-guess_secret'
      }
    );

    const user = await this.knex.table('users')
      .where('id', userData.user_id)
      .select();

    if (!user) {
      throw new InternalServerErrorException()
    }

    return {
      message: "Success",
      data: user
    };
  }
}