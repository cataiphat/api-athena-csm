"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const company = await prisma.company.create({
        data: {
            name: 'AthenaFS Demo Company',
            description: 'Demo company for testing CMS system',
            settings: {
                timezone: 'Asia/Ho_Chi_Minh',
                businessHours: {
                    start: '08:00',
                    end: '17:00',
                    days: [1, 2, 3, 4, 5],
                },
            },
        },
    });
    console.log('✅ Created company:', company.name);
    const cskh = await prisma.department.create({
        data: {
            name: 'Chăm sóc khách hàng',
            description: 'Phòng chăm sóc khách hàng',
            companyId: company.id,
        },
    });
    const tech = await prisma.department.create({
        data: {
            name: 'Kỹ thuật',
            description: 'Phòng kỹ thuật',
            companyId: company.id,
        },
    });
    console.log('✅ Created departments');
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@athenafs.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: client_1.UserRole.SUPER_ADMIN,
            status: client_1.UserStatus.ACTIVE,
            companyId: company.id,
        },
    });
    const csAdmin = await prisma.user.create({
        data: {
            email: 'csadmin@demo.com',
            password: hashedPassword,
            firstName: 'CS',
            lastName: 'Admin',
            role: client_1.UserRole.CS_ADMIN,
            status: client_1.UserStatus.ACTIVE,
            companyId: company.id,
            departmentId: cskh.id,
        },
    });
    const csAgent = await prisma.user.create({
        data: {
            email: 'agent@demo.com',
            password: hashedPassword,
            firstName: 'CS',
            lastName: 'Agent',
            role: client_1.UserRole.CS_AGENT,
            status: client_1.UserStatus.ACTIVE,
            companyId: company.id,
            departmentId: cskh.id,
        },
    });
    await prisma.department.update({
        where: { id: cskh.id },
        data: { leaderId: csAdmin.id },
    });
    console.log('✅ Created users');
    const customer = await prisma.customer.create({
        data: {
            cif: 'CIF000001',
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            phone: '0901234567',
            email: 'customer@example.com',
            address: 'Hà Nội, Việt Nam',
            idNumber: '123456789',
            companyId: company.id,
        },
    });
    console.log('✅ Created customer');
    const sla = await prisma.sLA.create({
        data: {
            name: 'Standard SLA',
            description: 'Standard service level agreement',
            ticketType: client_1.TicketType.INQUIRY,
            priority: client_1.TicketPriority.MEDIUM,
            firstResponseTimeHours: 2,
            resolutionTimeHours: 24,
            businessHoursOnly: true,
            status: client_1.SLAStatus.ACTIVE,
            companyId: company.id,
        },
    });
    console.log('✅ Created SLA');
    const emailChannel = await prisma.channel.create({
        data: {
            name: 'Email Support',
            type: client_1.ChannelType.EMAIL,
            status: client_1.ChannelStatus.ACTIVE,
            config: {
                email: 'support@demo.com',
                provider: 'gmail',
            },
            companyId: company.id,
        },
    });
    await prisma.channelAgent.create({
        data: {
            channelId: emailChannel.id,
            userId: csAgent.id,
        },
    });
    console.log('✅ Created channel and assigned agent');
    const ticket = await prisma.ticket.create({
        data: {
            ticketNumber: 'EMAIL000001',
            title: 'Yêu cầu hỗ trợ tài khoản',
            description: 'Khách hàng cần hỗ trợ đăng nhập tài khoản',
            type: client_1.TicketType.INQUIRY,
            priority: client_1.TicketPriority.MEDIUM,
            status: client_1.TicketStatus.WAIT,
            source: 'EMAIL',
            customerId: customer.id,
            creatorId: csAgent.id,
            companyId: company.id,
            departmentId: cskh.id,
            channelId: emailChannel.id,
            slaId: sla.id,
            tags: ['account', 'login'],
        },
    });
    const now = new Date();
    const firstResponseDue = new Date(now.getTime() + sla.firstResponseTimeHours * 60 * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + sla.resolutionTimeHours * 60 * 60 * 1000);
    await prisma.sLATracking.create({
        data: {
            ticketId: ticket.id,
            slaId: sla.id,
            firstResponseDue,
            resolutionDue,
        },
    });
    console.log('✅ Created sample ticket with SLA tracking');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample accounts created:');
    console.log('Super Admin: superadmin@athenafs.com / password123');
    console.log('CS Admin: csadmin@demo.com / password123');
    console.log('CS Agent: agent@demo.com / password123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map