import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity.js';
import { CartItem } from './entities/cart-item.entity.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { ProductsClientModule } from '../products-client/products-client.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductsClientModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
