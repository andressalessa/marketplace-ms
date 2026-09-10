import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string; email: string; role: string };

    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can create products');
    }

    return this.productsService.create(createProductDto, user.id);
  }

  @Public()
  @Get()
  async findAll(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Public()
  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string): Promise<Product[]> {
    return await this.productsService.findBySeller(sellerId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }
}
