import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    stock: 10,
    sellerId: '123e4567-e89b-12d3-a456-426614174001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save product with sellerId and isActive=true', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
      };
      const sellerId = '123e4567-e89b-12d3-a456-426614174001';

      const createdProduct = { ...mockProduct, ...createProductDto, sellerId };
      productRepository.create.mockReturnValue(createdProduct as Product);
      productRepository.save.mockResolvedValue(createdProduct as Product);

      const result = await service.create(createProductDto, sellerId);

      expect(productRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        sellerId,
        isActive: true,
      });
      expect(productRepository.save).toHaveBeenCalledWith(createdProduct);
      expect(result).toEqual(createdProduct);
      expect(result.isActive).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should find active products ordered by createdAt DESC', async () => {
      const products = [mockProduct];
      productRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(products);
    });
  });

  describe('findBySeller', () => {
    it('should find products by seller with isActive filter', async () => {
      const sellerId = '123e4567-e89b-12d3-a456-426614174001';
      const products = [mockProduct];
      productRepository.find.mockResolvedValue(products);

      const result = await service.findBySeller(sellerId);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { sellerId, isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Product with ID "non-existent-id" not found',
      );
    });
  });
});
