import { Controller, Get } from '@nestjs/common';
import * as IlmuwanIslam from '../ilmuwan_islam/data.json'

@Controller('web')
export class WebController {

  @Get('/apis')
  listApis() {
    return {
      data: [
        {
          name: "Ilmuwan Islam",
          description: IlmuwanIslam.data.length + " Ilmuwan yang tenar pada masanya",
        }
      ]
    };
  }
}