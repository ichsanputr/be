import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    KnexModule.forRoot({
      config: {
        client: 'mysql',
        version: '5.7',
        useNullAsDefault: true,
        connection: {
          host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
          port: 4000,
          database: "ruangdata",
          user: "3xDtKQ4MJjQrGHb.root",
          password: "wmnhRszFvHYaL5bs",
          ssl: true
        },
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
