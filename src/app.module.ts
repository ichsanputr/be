import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { KnexModule } from 'nest-knexjs';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    KnexModule.forRoot({
      config: {
        client: 'mysql',
        version: '5.7',
        useNullAsDefault: true,
        connection: {
          host: "localhost",
          port: 3306,
          database: "socketio",
          user: "ichsan",
          password: "123",
        },
        debug: false
      },
    }),
    AuthModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [],
})

export class AppModule {
}
