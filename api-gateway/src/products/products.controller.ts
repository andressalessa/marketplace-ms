import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProxyService } from '../proxy/service/proxy.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ServicesEnum } from '../common/enums/services.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: any,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: { userId: string; email: string; role: string },
  ) {
    return this.proxyService.proxyRequest(
      ServicesEnum.PRODUCTS,
      'POST',
      '/products',
      body,
      { authorization },
      user,
    );
  }

  @Get()
  async findAll() {
    return this.proxyService.proxyRequest(
      ServicesEnum.PRODUCTS,
      'GET',
      '/products',
    );
  }

  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string) {
    return this.proxyService.proxyRequest(
      ServicesEnum.PRODUCTS,
      'GET',
      `/products/seller/${sellerId}`,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proxyService.proxyRequest(
      ServicesEnum.PRODUCTS,
      'GET',
      `/products/${id}`,
    );
  }
}
