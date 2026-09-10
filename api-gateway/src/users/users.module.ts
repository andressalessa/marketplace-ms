import { Module } from '@nestjs/common';
import { UsersProxyController } from './users-proxy.controller';
import { AuthProxyController } from './auth-proxy.controller';

@Module({
  controllers: [UsersProxyController, AuthProxyController],
})
export class UsersModule {}
