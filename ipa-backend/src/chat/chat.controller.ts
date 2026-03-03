import { Controller, Get, Post, Query, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    @ApiOperation({ summary: 'Get messages', description: 'Retrieve conversation messages between two users' })
    @ApiQuery({ name: 'userId', type: 'number', description: 'Current user ID', example: 1 })
    @ApiQuery({ name: 'otherUserId', type: 'number', description: 'Other user ID', example: 2 })
    @ApiResponse({ status: 200, description: 'Returns array of messages' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMessages(
        @Query('userId') userId: string,
        @Query('otherUserId') otherUserId: string,
    ) {
        return this.chatService.getMessages(Number(userId), Number(otherUserId));
    }

    @Post()
    @ApiOperation({ summary: 'Send message', description: 'Send a text or file message to another user' })
    @ApiBody({
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
    })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async sendMessage(
        @Body() body: { senderId: number; receiverId: number; content?: string; fileUrl?: string; fileName?: string },
    ) {
        return this.chatService.sendMessage(body);
    }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload file', description: 'Upload a file for chat message (max 20MB)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'File uploaded successfully, returns fileUrl and fileName' })
    @ApiResponse({ status: 400, description: 'No file uploaded or file too large' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(process.cwd(), 'uploads', 'chat'),
                filename: (_req, file, cb) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
                    cb(null, unique + extname(file.originalname));
                },
            }),
            limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file uploaded');
        return {
            fileUrl: `/uploads/chat/${file.filename}`,
            fileName: file.originalname,
        };
    }

    @Get('peers')
    @ApiOperation({ summary: 'Get chat peers', description: 'Get list of users available for chat (supervisor and fellow students)' })
    @ApiQuery({ name: 'studentId', type: 'number', description: 'Student ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns array of available chat peers' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getPeers(@Query('studentId') studentId: string) {
        return this.chatService.getPeers(Number(studentId));
    }

    @Get('unread')
    @ApiOperation({ summary: 'Get unread message count', description: 'Get count of unread messages for a user' })
    @ApiQuery({ name: 'userId', type: 'number', description: 'User ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns unread message count' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUnreadCount(@Query('userId') userId: string) {
        return this.chatService.getUnreadCount(Number(userId));
    }
}
