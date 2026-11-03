import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SuperAdminService,
  type CreateDemoLeadDto,
  type CreateRestaurantDto,
} from './super-admin.service';

const SUPER_ADMIN_PIN = process.env.SUPER_ADMIN_PIN || 'admin123';

@Controller('v1')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // --- Public Demo Lead Request ---
  @Post('leads/demo-request')
  async createDemoLead(@Body() dto: CreateDemoLeadDto) {
    return this.superAdminService.createLead(dto);
  }

  // --- Super Admin Authentication Check ---
  @Post('super-admin/auth/verify')
  async verifyAdmin(@Body('pin') pin: string) {
    if (pin !== SUPER_ADMIN_PIN) {
      throw new UnauthorizedException('Invalid Super Admin credentials');
    }
    return { success: true, token: 'super-admin-authorized' };
  }

  private checkSuperAdminAuth(authHeader?: string) {
    if (!authHeader || !authHeader.includes('super-admin-authorized')) {
      throw new UnauthorizedException('Super Admin Authorization required');
    }
  }

  // --- Super Admin Operations ---
  @Get('super-admin/overview')
  async getOverview(@Headers('authorization') auth?: string) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.getOverview();
  }

  @Get('super-admin/leads')
  async getLeads(@Headers('authorization') auth?: string) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.getLeads();
  }

  @Patch('super-admin/leads/:id')
  async updateLead(
    @Param('id') id: string,
    @Body() dto: { status?: string; notes?: string },
    @Headers('authorization') auth?: string,
  ) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.updateLead(id, dto);
  }

  @Get('super-admin/restaurants')
  async getRestaurants(@Headers('authorization') auth?: string) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.getRestaurants();
  }

  @Post('super-admin/restaurants')
  async createRestaurant(
    @Body() dto: CreateRestaurantDto,
    @Headers('authorization') auth?: string,
  ) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.createRestaurant(dto);
  }

  @Patch('super-admin/restaurants/:id/license')
  async updateLicense(
    @Param('id') id: string,
    @Body() dto: { plan?: string; status?: string; extendDays?: number; newExpiryDate?: string },
    @Headers('authorization') auth?: string,
  ) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.updateLicense(id, dto);
  }

  @Patch('super-admin/restaurants/:id/password')
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
    @Headers('authorization') auth?: string,
  ) {
    this.checkSuperAdminAuth(auth);
    return this.superAdminService.resetPassword(id, newPassword);
  }
}

