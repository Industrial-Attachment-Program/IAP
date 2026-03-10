import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        studentId: number;
        supervisorId: number;
        rating: number;
        comment?: string;
        knowledgeWirelessOps?: number;
        knowledgeWirelessEst?: number;
        knowledgeWirelessMaint?: number;
        knowledgeApplication?: number;
        responsibility?: number;
        cooperativeness?: number;
        complianceEtiquette?: number;
        safetyAwareness?: number;
        safetyCompliance?: number;
        safetyArrangement?: number;
    }) {
        const { studentId, supervisorId, rating, comment, ...scores } = data;

        if (!studentId || !supervisorId || rating === undefined) {
            throw new BadRequestException('studentId, supervisorId and rating are required');
        }

        return this.prisma.rating.create({
            data: {
                studentId: Number(studentId),
                supervisorId: Number(supervisorId),
                rating: Number(rating),
                comment,
                ...scores
            },
        });
    }

    async findByStudent(studentId: number) {
        return this.prisma.rating.findMany({
            where: { studentId: Number(studentId) },
            include: {
                supervisor: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
