import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  STAFF_ROLES,
  type LoginDto,
  type PinLoginDto,
  type RegisterDto,
  type SessionUser,
} from '@nodedr-restaurant/types';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from './two-factor.service';

interface UserWithRole {
  id: string;
  restaurantId: string;
  name: string;
  roleId: string;
  role: {
    name: string;
    permissions: Array<{ permission: { key: string } }>;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly twoFactor: TwoFactorService,
  ) {}

  async hasAnyRestaurant(): Promise<boolean> {
    const restaurant = await this.prisma.restaurant.findFirst({
      select: { id: true },
    });
    return restaurant !== null;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, isActive: true },
      include: {
        restaurant: true,
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check SaaS License & Subscription Validity
    if (user.restaurant?.subscriptionStatus === 'SUSPENDED') {
      throw new UnauthorizedException(
        'LICENSE_SUSPENDED: Your OrderRestro license has been suspended. Please contact support.',
      );
    }
    if (
      user.restaurant?.subscriptionExpiresAt &&
      new Date(user.restaurant.subscriptionExpiresAt).getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'LICENSE_EXPIRED: Your OrderRestro subscription has expired. Please contact support to renew.',
      );
    }

    // Only asked for after the password is right, so the response never
    // reveals which emails exist or which accounts use two-factor.
    if (user.twoFactorEnabled) {
      await this.twoFactor.verifyLogin(user, dto.totp);
    }

    return this.issueSession(user);
  }

  async register(dto: RegisterDto & { plan?: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

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

    // Default 14-day trial for public registrations
    const trialExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const owner = await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: dto.restaurantName,
          subscriptionPlan: dto.plan ?? 'GROWTH',
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: trialExpiry,
        },
      });
      const branch = await tx.branch.create({
        data: { restaurantId: restaurant.id, name: dto.branchName },
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
        if (roleName === 'OWNER') {
          ownerRoleId = role.id;
        }

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
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      await tx.userBranch.create({
        data: { userId: user.id, branchId: branch.id },
      });

      return user;
    });

    return this.issueSession(owner);
  }

  async pinLogin(dto: PinLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId },
      include: {
        restaurant: true,
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user || !user.isActive || !user.pinHash) {
      throw new UnauthorizedException('PIN login not available for this user');
    }

    if (user.restaurant?.subscriptionStatus === 'SUSPENDED') {
      throw new UnauthorizedException(
        'LICENSE_SUSPENDED: Your OrderRestro license has been suspended.',
      );
    }
    if (
      user.restaurant?.subscriptionExpiresAt &&
      new Date(user.restaurant.subscriptionExpiresAt).getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'LICENSE_EXPIRED: Your OrderRestro subscription has expired.',
      );
    }

    if (user.twoFactorEnabled) {
      throw new UnauthorizedException(
        'PIN login is off for accounts with two-factor authentication - sign in with your password',
      );
    }

    const valid = await bcrypt.compare(dto.pin, user.pinHash);
    if (!valid) {
      throw new UnauthorizedException('Incorrect PIN');
    }

    return this.issueSession(user);
  }

  issueSession(user: UserWithRole): {
    token: string;
    user: SessionUser;
  } {
    const payload = {
      sub: user.id,
      restaurantId: user.restaurantId,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
    };
    const token = this.jwt.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        restaurantId: user.restaurantId,
        name: user.name,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions: user.role.permissions.map((rp) => rp.permission.key),
      },
    };
  }
}
