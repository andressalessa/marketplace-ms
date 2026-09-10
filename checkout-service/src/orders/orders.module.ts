import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentResultConsumerService } from './payment-result-consumer/payment-result-consumer.service';
import { CartModule } from '../cart/cart.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CartModule, EventsModule],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentResultConsumerService],
})
export class OrdersModule {}
