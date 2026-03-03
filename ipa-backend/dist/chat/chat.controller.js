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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getMessages(userId, otherUserId) {
        return this.chatService.getMessages(Number(userId), Number(otherUserId));
    }
    async sendMessage(body) {
        return this.chatService.sendMessage(body);
    }
    async uploadFile(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        return {
            fileUrl: `/uploads/chat/${file.filename}`,
            fileName: file.originalname,
        };
    }
    async getPeers(studentId) {
        return this.chatService.getPeers(Number(studentId));
    }
    async getUnreadCount(userId) {
        return this.chatService.getUnreadCount(Number(userId));
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages', description: 'Retrieve conversation messages between two users' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: 'number', description: 'Current user ID', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'otherUserId', type: 'number', description: 'Other user ID', example: 2 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of messages' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('otherUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send message', description: 'Send a text or file message to another user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                senderId: { type: 'number', example: 1 },
                receiverId: { type: 'number', example: 2 },
                content: { type: 'string', example: 'Hello, how are you?', description: 'Text message content (optional if file is sent)' },
                fileUrl: { type: 'string', example: '/uploads/chat/file.pdf', description: 'File URL from upload endpoint (optional)' },
                fileName: { type: 'string', example: 'document.pdf', description: 'Original file name (optional)' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file', description: 'Upload a file for chat message (max 20MB)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File uploaded successfully, returns fileUrl and fileName' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No file uploaded or file too large' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'chat'),
            filename: (_req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
                cb(null, unique + (0, path_1.extname)(file.originalname));
            },
        }),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('peers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat peers', description: 'Get list of users available for chat (supervisor and fellow students)' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', type: 'number', description: 'Student ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of available chat peers' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getPeers", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread message count', description: 'Get count of unread messages for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: 'number', description: 'User ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns unread message count' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
