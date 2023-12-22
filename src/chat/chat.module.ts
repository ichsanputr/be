import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [JwtModule.register({ secret: 'hard!to-guess_secret' }), HttpModule],
    controllers: [ChatController],
    providers: [ChatGateway]
})
export class ChatModule {}