import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private jwtService: JwtService,
    private readonly chatGateway: ChatGateway
  ) { }

  @Get('/users')
  async listUsers(@Req() req) {
    const jwtService = new JwtService()

    const userData = await jwtService.verifyAsync(
      req.headers.authorization.replace('Bearer ', ''),
      {
        secret: 'hard!to-guess_secret'
      }
    );

    const users = await this.knex.table('users')
      .whereNot({ id: userData.user_id })
      .select();

    const usersData = await Promise.all(users.map(async v => {
      const { id } = await this.knex.table('chat')
        .havingIn('user1', [userData.user_id, v.id])
        .havingIn('user2', [userData.user_id, v.id])
        .first();

      return {
        ...v,
        chat_id: id
      }
    }))

    return {
      message: "Success",
      data: usersData
    };
  }

  @Post('/pair')
  async getPairChats(@Body() body: { chat_id: string }, @Req() req) {
    const jwtService = new JwtService()

    const { user_id } = await jwtService.verifyAsync(
      req.headers.authorization.replace('Bearer ', ''),
      {
        secret: 'hard!to-guess_secret'
      }
    );

    const pair2_id = await this.knex.table('chat')
      .where({ id: body.chat_id })
      .first();

    let user2 

    if (pair2_id.user1 == user_id){
      user2 = pair2_id.user2
    } else {
      user2 = pair2_id.user1
    }

    const pair_name = await this.knex.table('users')
      .where({ id: user2 })
      .column('username')
      .first();

    let chats = await this.knex.table('chats')
      .where({ chat_id: body.chat_id })
      .orderBy('created_at')
      .select();

    chats = chats.map(v => {
      if (v.user_id == user_id) {
        v.is_me = 1
      } else {
        v.is_me = 0
      }

      return {
        ...v
      }
    })

    return {
      message: "Success",
      data: {
        pair_name: pair_name.username,
        chats
      }
    };
  }

  @Post('/message')
  async addChatPair(@Body() body: { chat_id: string, message: string }, @Req() req) {
    const jwtService = new JwtService()

    const { user_id } = await jwtService.verifyAsync(
      req.headers.authorization.replace('Bearer ', ''),
      {
        secret: 'hard!to-guess_secret'
      }
    );

    await this.knex.table('chats')
      .insert({
        id: randomUUID(),
        user_id,
        message: body.message,
        chat_id: body.chat_id,
        created_at: new Date()
      })

    let userid_2
    const chat = await this.knex.table('chat')
      .where({id: body.chat_id})
      .first()

    if (chat.user1 == user_id){
      userid_2 = chat.user2
    } else {
      userid_2 = chat.user1
    }
    
    this.chatGateway.biDirectional(userid_2, body.chat_id)

    return {
      message: "Success",
    };
  }
}