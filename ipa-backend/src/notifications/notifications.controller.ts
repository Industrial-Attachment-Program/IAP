import { Controller, Delete, Get, Request, UseGuards, Param, Body, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @ApiOperation({ summary: 'Get my notifications', description: 'Retrieve all notifications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns array of notifications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyNotifications(@Request() req: any) {
    return this.notificationsService.findUserNotifications(req.user.userId, req.user.role);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all notifications', description: 'Delete all notifications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'All notifications cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearNotifications(@Request() req: any) {
    return this.notificationsService.clearNotifications(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification', description: 'Delete a specific notification by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Notification ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create notification', description: 'Create a new notification (user-specific or role-based broadcast)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1, description: 'Target user ID (optional for role-based)' },
        targetRole: { type: 'string', enum: ['ADMIN', 'SUPERVISOR', 'STUDENT'], example: 'STUDENT', description: 'Target role for broadcast (optional)' },
        title: { type: 'string', example: 'New Task Assigned' },
        message: { type: 'string', example: 'You have been assigned a new task' },
        type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TASK', 'MESSAGE'], example: 'TASK' },
        link: { type: 'string', example: '/tasks/123', description: 'Optional link for actionable notifications' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createNotification(@Body() data: any) {
    return this.notificationsService.createNotification(data);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', type: 'number', description: 'Notification ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id));
  }
}
