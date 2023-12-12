import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';

@Injectable()
export class HitRequestMiddleware implements NestMiddleware {
  constructor(
    @InjectConnection() private readonly knex: Knex,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const access_token_user = req.headers['authorization'].replace('Bearer ', '')

    const user = await this.knex.table('users')
      .where('access_token', access_token_user)
      .first();

    if (!user) {
      throw new UnauthorizedException('Not valid access token')
    }

    await this.knex.table('users')
      .where('access_token', access_token_user)
      .increment('hit_request', 1)

    next();
  }
}