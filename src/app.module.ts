import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import { AuthModule } from './auth/auth.module';
import { IlmuwanIslamModule } from './ilmuwan_islam/ilmuwan_islam.module';
import { HitRequestMiddleware } from './hitrequest.middleware';
import { WebModule } from './web/web.module';

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
        debug: true
      },
    }),
    AuthModule,
    WebModule,
    IlmuwanIslamModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HitRequestMiddleware)
      .exclude(
        'auth/(.*)',
        'web/(.*)',
      )
      .forRoutes('/*');
  }
}
