import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { LiaisonsService } from './liaisons.service';

@ApiTags('Liaisons')
@ApiBearerAuth('JWT-auth')
@Controller('liaisons')
export class LiaisonsController {
    constructor(private readonly liaisonsService: LiaisonsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all liaisons', description: 'Retrieve list of all liaison officers' })
    @ApiResponse({ status: 200, description: 'Returns array of liaisons with their profiles' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll() {
        return this.liaisonsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get liaison by ID', description: 'Retrieve specific liaison officer information' })
    @ApiParam({ name: 'id', type: 'number', description: 'Liaison ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns liaison details' })
    @ApiResponse({ status: 404, description: 'Liaison not found' })
    async findOne(@Param('id') id: string) {
        return this.liaisonsService.findOne(Number(id));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update liaison', description: 'Update liaison officer profile information' })
    @ApiParam({ name: 'id', type: 'number', description: 'Liaison ID', example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                phone: { type: 'string', example: '+250788123456' },
                department: { type: 'string', example: 'Career Guidance' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Liaison updated successfully' })
    @ApiResponse({ status: 404, description: 'Liaison not found' })
    async update(@Param('id') id: string, @Body() body: any) {
        return this.liaisonsService.update(Number(id), body);
    }
}
