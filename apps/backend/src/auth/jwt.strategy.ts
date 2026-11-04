import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { SessionUser } from '@nodedr-restaurant/types';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
}

const cookieExtractor = (req: {
  cookies?: Record<string, string>;
}): string | null => {
  return req.cookies?.['nodedr_session'] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        restaurant: true,
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session no longer valid');
    }

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

    return {
      id: user.id,
      restaurantId: user.restaurantId,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.key),
    };
  }
}
