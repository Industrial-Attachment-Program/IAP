import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiaisonsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const liaisons = await this.prisma.liaisonOfficer.findMany({
            include: {
                user: true,
                students: {
                    include: { user: true }
                }
            }
        });
        return { liaisons };
    }

    async findOne(id: number) {
        const liaison = await this.prisma.liaisonOfficer.findUnique({
            where: { id },
            include: {
                user: true,
                students: {
                    include: { user: true }
                }
            }
        });
        if (!liaison) {
            throw new NotFoundException('Liaison Officer not found');
        }
        return { liaison };
    }

    async update(id: number, data: any) {
        const updated = await this.prisma.liaisonOfficer.update({
            where: { id },
            data
        });
        return { message: 'Liaison Officer updated successfully', liaison: updated };
    }
}
