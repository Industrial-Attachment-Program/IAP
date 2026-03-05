import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SupervisorsService } from './supervisors.service';

@ApiTags('Supervisors')
@ApiBearerAuth('JWT-auth')
@Controller('supervisors')
export class SupervisorsController {
    constructor(private readonly supervisorsService: SupervisorsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all supervisors', description: 'Retrieve list of all supervisors' })
    @ApiResponse({ status: 200, description: 'Returns array of supervisors with their profiles' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll() {
        return this.supervisorsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get supervisor by ID', description: 'Retrieve specific supervisor information' })
    @ApiParam({ name: 'id', type: 'number', description: 'Supervisor ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns supervisor details' })
    @ApiResponse({ status: 404, description: 'Supervisor not found' })
    async findOne(@Param('id') id: string) {
        return this.supervisorsService.findOne(Number(id));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update supervisor', description: 'Update supervisor profile information' })
    @ApiParam({ name: 'id', type: 'number', description: 'Supervisor ID', example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                phone: { type: 'string', example: '+250788123456' },
                department: { type: 'string', example: 'Software Engineering' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Supervisor updated successfully' })
    @ApiResponse({ status: 404, description: 'Supervisor not found' })
    async update(@Param('id') id: string, @Body() body: any) {
        return this.supervisorsService.update(Number(id), body);
    }
}
