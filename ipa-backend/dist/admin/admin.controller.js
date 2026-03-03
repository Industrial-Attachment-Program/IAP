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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getUsers() {
        return this.adminService.getUsers();
    }
    async getActivity() {
        return this.adminService.getActivity();
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(Number(id));
    }
    async addUser(body) {
        return this.adminService.addUser(body);
    }
    async toggleActivation(body) {
        return this.adminService.toggleActivation(body.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users', description: 'Retrieve list of all users in the system (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of users with their profiles' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system activity', description: 'Retrieve system-wide activity statistics and metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns activity statistics including user counts, task stats, etc.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Delete)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user', description: 'Delete a user from the system by ID' }),
    (0, swagger_1.ApiQuery)({ name: 'id', type: 'number', description: 'User ID to delete', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Add new user', description: 'Create a new user account (student or supervisor)' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('toggle-activation'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle user activation', description: 'Activate or deactivate a user account' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activation status toggled' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleActivation", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
