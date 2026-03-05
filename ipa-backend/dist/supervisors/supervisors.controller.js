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
exports.SupervisorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supervisors_service_1 = require("./supervisors.service");
let SupervisorsController = class SupervisorsController {
    constructor(supervisorsService) {
        this.supervisorsService = supervisorsService;
    }
    async findAll() {
        return this.supervisorsService.findAll();
    }
    async findOne(id) {
        return this.supervisorsService.findOne(Number(id));
    }
    async update(id, body) {
        return this.supervisorsService.update(Number(id), body);
    }
};
exports.SupervisorsController = SupervisorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all supervisors', description: 'Retrieve list of all supervisors' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns array of supervisors with their profiles' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupervisorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supervisor by ID', description: 'Retrieve specific supervisor information' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Supervisor ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns supervisor details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Supervisor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupervisorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update supervisor', description: 'Update supervisor profile information' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Supervisor ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone: { type: 'string', example: '+250788123456' },
                department: { type: 'string', example: 'Software Engineering' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supervisor updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Supervisor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupervisorsController.prototype, "update", null);
exports.SupervisorsController = SupervisorsController = __decorate([
    (0, swagger_1.ApiTags)('Supervisors'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('supervisors'),
    __metadata("design:paramtypes", [supervisors_service_1.SupervisorsService])
], SupervisorsController);
