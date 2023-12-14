import { Controller, Get } from '@nestjs/common';
import * as DATA from './data.json'

@Controller('ilmuwan-islam')
export class IlmuwanIslamController {
  constructor() {}

  @Get('/')
  async listAll() {
    return {
      message: 'success',
      data: DATA.data,
      total_data: DATA.data.length
    };
  }
}