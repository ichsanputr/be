import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(8000, { cors: true, namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('MessageGateway');

  @WebSocketServer() ws: Server;
  clients = []

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const jwtService = new JwtService()

    const { user_id } = await jwtService.verifyAsync(
      client.handshake.headers.token.toString(),
      {
        secret: 'hard!to-guess_secret'
      }
    );

    this.clients.push({ id: client.id, user_id })
    this.logger.log(`Client Connected: ${client}`);
  }

  biDirectional(userid_target: string, roomid: string) {
    let user_target = ''

    this.clients.forEach(v => {
      console.log(v)
      if (v.user_id == userid_target) {
        user_target = v.id
      }
    })

    if (user_target != '') {
      console.log("kontoll")
      console.log(user_target)
      this.ws.to(user_target).emit("notifyReloadChat", roomid)
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    this.ws.emit('tes', payload)
  }
}