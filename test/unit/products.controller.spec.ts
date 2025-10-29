import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../src/modules/products/products.controller';
import { ProductsService } from '../../src/modules/products/products.service';
import { CreateProductDto } from '../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/modules/products/dto/update-product.dto';
import { PaginationDto } from '../../src/modules/products/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';

describe('ProductsController', () => {
    let controller: ProductsController;
    let productsService: jest.Mocked<ProductsService>;

    const mockUser: any = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'user',
    };

    const mockProduct: any = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        owner: mockUser,
    };

    const mockProductsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockAuthGuard = {
        canActivate: jest.fn(() => true),
    };

    const mockRolesGuard = {
        canActivate: jest.fn(() => true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue(mockAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<ProductsController>(ProductsController);
        productsService = module.get(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new product', async () => {
            const createProductDto: CreateProductDto = {
                name: 'New Product',
                description: 'New Description',
                price: 15.99,
            };

            productsService.create.mockResolvedValue(mockProduct);

            const result = await controller.create(createProductDto, mockUser);

            expect(result).toEqual(mockProduct);
            expect(productsService.create).toHaveBeenCalledWith(
                createProductDto,
                mockUser,
            );
        });

        it('should throw error when creation fails', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Invalid Product',
                description: 'Invalid Description',
                price: -10,
            };

            productsService.create.mockRejectedValue(
                new Error('Invalid product data'),
            );

            await expect(
                controller.create(createProductDto, mockUser),
            ).rejects.toThrow('Invalid product data');
        });
    });

    describe('findAll', () => {
        it('should return products list', async () => {
            const paginationDto: PaginationDto = {};
            const expectedResult = [mockProduct];

            productsService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll(paginationDto);

            expect(result).toEqual(expectedResult);
            expect(productsService.findAll).toHaveBeenCalledWith(paginationDto);
        });

        it('should handle empty results', async () => {
            const paginationDto: PaginationDto = {};

            productsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll(paginationDto);

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
            productsService.findOne.mockResolvedValue(mockProduct);

            const result = await controller.findOne('1');

            expect(result).toEqual(mockProduct);
            expect(productsService.findOne).toHaveBeenCalledWith('1');
        });

        it('should throw error when product not found', async () => {
            productsService.findOne.mockRejectedValue(
                new Error('Product not found'),
            );

            await expect(controller.findOne('999')).rejects.toThrow(
                'Product not found',
            );
        });
    });

    describe('update', () => {
        it('should update product', async () => {
            const updateProductDto: UpdateProductDto = {
                name: 'Updated Product',
            };
            const updatedProduct = { ...mockProduct, name: 'Updated Product' };

            productsService.update.mockResolvedValue(updatedProduct);

            const result = await controller.update('1', updateProductDto, mockUser);

            expect(result).toEqual(updatedProduct);
            expect(productsService.update).toHaveBeenCalledWith(
                '1',
                updateProductDto,
                mockUser,
            );
        });

        it('should throw error when update fails', async () => {
            const updateProductDto: UpdateProductDto = {
                name: 'Updated Product',
            };

            productsService.update.mockRejectedValue(new Error('Update failed'));

            await expect(
                controller.update('1', updateProductDto, mockUser),
            ).rejects.toThrow('Update failed');
        });
    });

    describe('remove', () => {
        it('should remove product', async () => {
            productsService.remove.mockResolvedValue(undefined);

            await controller.remove('1', mockUser);

            expect(productsService.remove).toHaveBeenCalledWith('1', mockUser);
        });

        it('should throw error when deletion fails', async () => {
            productsService.remove.mockRejectedValue(new Error('Delete failed'));

            await expect(controller.remove('1', mockUser)).rejects.toThrow(
                'Delete failed',
            );
        });
    });
});
