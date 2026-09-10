import { Module } from '@nestjs/common';
import { OrdersProxyController } from './orders-proxy.controller';
import { CartProxyController } from './cart-proxy.controller';

@Module({
  controllers: [OrdersProxyController, CartProxyController]
})
export class CheckoutModule {}
