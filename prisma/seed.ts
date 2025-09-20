import { PrismaClient, UserRole, UserStatus, TicketStatus, TicketType, TicketPriority, ChannelType, ChannelStatus, SLAStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Single-tenant architecture - no company needed
  console.log('✅ Single-tenant setup - no company creation needed');

  // Create departments
  const cskh = await prisma.department.create({
    data: {
      name: 'Chăm sóc khách hàng',
      description: 'Phòng chăm sóc khách hàng',
    },
  });

  const tech = await prisma.department.create({
    data: {
      name: 'Kỹ thuật',
      description: 'Phòng kỹ thuật',
    },
  });

  console.log('✅ Created departments');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@athenafs.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      companyId: company.id,
    },
  });

  const csAdmin = await prisma.user.create({
    data: {
      email: 'csadmin@demo.com',
      password: hashedPassword,
      firstName: 'CS',
      lastName: 'Admin',
      role: UserRole.CS_ADMIN,
      status: UserStatus.ACTIVE,
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
      role: UserRole.CS_AGENT,
      status: UserStatus.ACTIVE,
      companyId: company.id,
      departmentId: cskh.id,
    },
  });

  // Update department leader
  await prisma.department.update({
    where: { id: cskh.id },
    data: { leaderId: csAdmin.id },
  });

  console.log('✅ Created users');

  // Create sample customer
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

  // Create SLA
  const sla = await prisma.sLA.create({
    data: {
      name: 'Standard SLA',
      description: 'Standard service level agreement',
      ticketType: TicketType.INQUIRY,
      priority: TicketPriority.MEDIUM,
      firstResponseTimeHours: 2,
      resolutionTimeHours: 24,
      businessHoursOnly: true,
      status: SLAStatus.ACTIVE,
      companyId: company.id,
    },
  });

  console.log('✅ Created SLA');

  // Create channel
  const emailChannel = await prisma.channel.create({
    data: {
      name: 'Email Support',
      type: ChannelType.EMAIL,
      status: ChannelStatus.ACTIVE,
      config: {
        email: 'support@demo.com',
        provider: 'gmail',
      },
      companyId: company.id,
    },
  });

  // Assign agent to channel
  await prisma.channelAgent.create({
    data: {
      channelId: emailChannel.id,
      userId: csAgent.id,
    },
  });

  console.log('✅ Created channel and assigned agent');

  // Create sample ticket
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: 'EMAIL000001',
      title: 'Yêu cầu hỗ trợ tài khoản',
      description: 'Khách hàng cần hỗ trợ đăng nhập tài khoản',
      type: TicketType.INQUIRY,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.WAIT,
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

  // Create SLA tracking for the ticket
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
