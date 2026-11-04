import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  STAFF_ROLES,
} from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateDemoLeadDto {
  restaurantName: string;
  contactName: string;
  phone: string;
  city?: string;
  interestedPlan?: string;
}

export interface CreateRestaurantDto {
  name: string;
  branchName: string;
  ownerName: string;
  email: string;
  password: string;
  plan: string;
  validityDays: number;
}

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Leads
  async createLead(dto: CreateDemoLeadDto) {
    return this.prisma.demoLead.create({
      data: {
        restaurantName: dto.restaurantName,
        contactName: dto.contactName,
        phone: dto.phone,
        city: dto.city ?? null,
        interestedPlan: dto.interestedPlan ?? 'GROWTH',
        status: 'NEW',
      },
    });
  }

  async getLeads() {
    return this.prisma.demoLead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLead(id: string, dto: { status?: string; notes?: string }) {
    const lead = await this.prisma.demoLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.demoLead.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }

  // 2. Overview KPIs
  async getOverview() {
    const totalRestaurants = await this.prisma.restaurant.count();
    const activeRestaurants = await this.prisma.restaurant.count({
      where: {
        subscriptionStatus: 'ACTIVE',
        OR: [
          { subscriptionExpiresAt: null },
          { subscriptionExpiresAt: { gte: new Date() } },
        ],
      },
    });
    const expiredRestaurants = await this.prisma.restaurant.count({
      where: {
        subscriptionExpiresAt: { lt: new Date() },
      },
    });
    const suspendedRestaurants = await this.prisma.restaurant.count({
      where: { subscriptionStatus: 'SUSPENDED' },
    });
    const totalLeads = await this.prisma.demoLead.count();
    const newLeads = await this.prisma.demoLead.count({
      where: { status: 'NEW' },
    });

    return {
      totalRestaurants,
      activeRestaurants,
      expiredRestaurants,
      suspendedRestaurants,
      totalLeads,
      newLeads,
    };
  }

  // 3. Restaurants Management
  async getRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        branches: { select: { id: true, name: true } },
        users: {
          select: { id: true, email: true, name: true, role: { select: { name: true } } },
        },
      },
    });

    return restaurants.map((r) => {
      const owner =
        r.users.find((u) => u.role?.name === 'OWNER') || r.users[0] || null;
      return {
        id: r.id,
        name: r.name,
        currency: r.currency,
        subscriptionPlan: r.subscriptionPlan,
        subscriptionStatus: r.subscriptionStatus,
        subscriptionExpiresAt: r.subscriptionExpiresAt,
        createdAt: r.createdAt,
        branchesCount: r.branches.length,
        usersCount: r.users.length,
        ownerEmail: owner?.email ?? 'N/A',
        ownerName: owner?.name ?? 'N/A',
      };
    });
  }

  async createRestaurant(dto: CreateRestaurantDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    // Ensure permissions exist
    for (const permission of PERMISSIONS) {
      await this.prisma.permission.upsert({
        where: { key: permission.key },
        update: {},
        create: permission,
      });
    }
    const allPermissions = await this.prisma.permission.findMany();
    const permissionByKey = new Map(allPermissions.map((p) => [p.key, p]));

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const pinHash = await bcrypt.hash('1234', 12);

    const days = dto.validityDays || (dto.plan === 'TRIAL' ? 7 : 365);
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: dto.name,
          subscriptionPlan: dto.plan || 'GROWTH',
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expiryDate,
        },
      });

      const branch = await tx.branch.create({
        data: {
          restaurantId: restaurant.id,
          name: dto.branchName || 'Main Branch',
        },
      });

      let ownerRoleId = '';
      for (const roleName of STAFF_ROLES) {
        const role = await tx.role.create({
          data: {
            restaurantId: restaurant.id,
            name: roleName,
            label: roleName.replace(/_/g, ' '),
          },
        });
        if (roleName === 'OWNER') ownerRoleId = role.id;

        const grantedKeys = DEFAULT_ROLE_PERMISSIONS[roleName];
        await tx.rolePermission.createMany({
          data: grantedKeys
            .map((key) => permissionByKey.get(key))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .map((permission) => ({
              roleId: role.id,
              permissionId: permission.id,
            })),
        });
      }

      const user = await tx.user.create({
        data: {
          restaurantId: restaurant.id,
          roleId: ownerRoleId,
          name: dto.ownerName,
          email: dto.email,
          passwordHash,
          pinHash,
        },
      });

      await tx.userBranch.create({
        data: { userId: user.id, branchId: branch.id },
      });

      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        ownerEmail: user.email,
        plan: restaurant.subscriptionPlan,
        expiresAt: restaurant.subscriptionExpiresAt,
      };
    });
  }

  async updateLicense(
    restaurantId: string,
    dto: { plan?: string; status?: string; extendDays?: number; newExpiryDate?: string },
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    let expiresAt = restaurant.subscriptionExpiresAt;
    if (dto.extendDays) {
      const base = expiresAt && expiresAt.getTime() > Date.now() ? expiresAt.getTime() : Date.now();
      expiresAt = new Date(base + dto.extendDays * 24 * 60 * 60 * 1000);
    } else if (dto.newExpiryDate) {
      expiresAt = new Date(dto.newExpiryDate);
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(dto.plan ? { subscriptionPlan: dto.plan } : {}),
        ...(dto.status ? { subscriptionStatus: dto.status } : {}),
        ...(expiresAt !== undefined ? { subscriptionExpiresAt: expiresAt } : {}),
      },
    });
  }

  async resetPassword(restaurantId: string, newPassword: string) {
    const ownerUser = await this.prisma.user.findFirst({
      where: { restaurantId, role: { name: 'OWNER' } },
    });
    if (!ownerUser) throw new NotFoundException('Owner user not found for this restaurant');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: ownerUser.id },
      data: { passwordHash },
    });

    return { success: true, email: ownerUser.email };
  }
}

