import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [JwtModule.register({ secret: 'hard!to-guess_secret' }), HttpModule],
    controllers: [AuthController]
})
export class AuthModule {}