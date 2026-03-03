import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    @ApiOperation({ summary: 'Get all users', description: 'Retrieve list of all users in the system (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns array of users with their profiles' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getUsers() {
        return this.adminService.getUsers();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get system activity', description: 'Retrieve system-wide activity statistics and metrics' })
    @ApiResponse({ status: 200, description: 'Returns activity statistics including user counts, task stats, etc.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getActivity() {
        return this.adminService.getActivity();
    }

    @Delete('users')
    @ApiOperation({ summary: 'Delete user', description: 'Delete a user from the system by ID' })
    @ApiQuery({ name: 'id', type: 'number', description: 'User ID to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Query('id') id: string) {
        return this.adminService.deleteUser(Number(id));
    }

    @Post('add-user')
    @ApiOperation({ summary: 'Add new user', description: 'Create a new user account (student or supervisor)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'student@example.com' },
                name: { type: 'string', example: 'John Doe' },
                role: { type: 'string', enum: ['STUDENT', 'SUPERVISOR', 'ADMIN'], example: 'STUDENT' },
                studentNumber: { type: 'string', example: 'STU2024001', description: 'Required for students' },
                supervisorId: { type: 'number', example: 1, description: 'Required for students' }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async addUser(@Body() body: any) {
        return this.adminService.addUser(body);
    }

    @Post('toggle-activation')
    @ApiOperation({ summary: 'Toggle user activation', description: 'Activate or deactivate a user account' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'User activation status toggled' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async toggleActivation(@Body() body: { id: number }) {
        return this.adminService.toggleActivation(body.id);
    }
}
