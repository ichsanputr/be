import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule.register({ secret: 'hard!to-guess_secret' })],
    controllers: [AuthController]
})
export class AuthModule {}