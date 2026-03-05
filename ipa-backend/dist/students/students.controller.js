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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const students_service_1 = require("./students.service");
let StudentsController = class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async findAll(query) {
        return this.studentsService.findAll(query);
    }
    async updateProfile(body) {
        return this.studentsService.updateProfile(body);
    }
    async findByToken(token) {
        return this.studentsService.findByToken(token);
    }
    async completeProfile(body) {
        return this.studentsService.completeProfile(body);
    }
    async uploadStudents(file) {
        return this.studentsService.uploadStudents(file);
    }
    async sendInvites(body) {
        return this.studentsService.sendInvites(body);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all students', description: 'Retrieve list of students with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'supervisorId', required: false, type: 'number', description: 'Filter by supervisor ID' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: 'string', description: 'Search by name or student number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of students' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('update'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student profile', description: 'Update student profile information' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                fullName: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '+250788123456' },
                email: { type: 'string', example: 'john@example.com' },
                address: { type: 'string', example: 'Kigali, Rwanda' },
                companyName: { type: 'string', example: 'Tech Corp' },
                companyAddress: { type: 'string', example: 'KG 123 St' },
                supervisorName: { type: 'string', example: 'Jane Smith' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('complete-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student by token', description: 'Retrieve student information using profile completion token' }),
    (0, swagger_1.ApiQuery)({ name: 'token', type: 'string', description: 'Profile completion token from email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns student information' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invalid or expired token' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findByToken", null);
__decorate([
    (0, common_1.Post)('complete-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete student profile', description: 'Complete student profile using token from invitation email' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'profile-token-from-email' },
                password: { type: 'string', example: 'newPassword123' },
                fullName: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '+250788123456' },
                address: { type: 'string', example: 'Kigali, Rwanda' },
                sex: { type: 'string', example: 'Male' },
                idOrPassport: { type: 'string', example: 'ID123456' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token or data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload students from Excel', description: 'Bulk upload students using Excel file' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "uploadStudents", null);
__decorate([
    (0, common_1.Post)('send-invites'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Send profile completion invites', description: 'Send profile completion emails to selected students' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                studentIds: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invites sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "sendInvites", null);
exports.StudentsController = StudentsController = __decorate([
    (0, swagger_1.ApiTags)('Students'),
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
