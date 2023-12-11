import { Module } from '@nestjs/common';
import { IlmuwanIslamController } from './ilmuwan_islam.controller';

@Module({
    controllers: [IlmuwanIslamController]
})
export class IlmuwanIslamModule {}