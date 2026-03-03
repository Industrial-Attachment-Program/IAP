"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getMyNotifications(req) {
        return this.notificationsService.findUserNotifications(req.user.userId, req.user.role);
    }
    async clearNotifications(req) {
        return this.notificationsService.clearNotifications(req.user.userId);
    }
    async deleteNotification(id) {
        return this.notificationsService.deleteNotification(Number(id));
    }
    async createNotification(data) {
        return this.notificationsService.createNotification(data);
    }
    async markAsRead(id) {
        return this.notificationsService.markAsRead(Number(id));
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my notifications', description: 'Retrieve all notifications for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of notifications' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Delete)('clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all notifications', description: 'Delete all notifications for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications cleared' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "clearNotifications", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification', description: 'Delete a specific notification by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Notification ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create notification', description: 'Create a new notification (user-specific or role-based broadcast)' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read', description: 'Mark a specific notification as read' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Notification ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
