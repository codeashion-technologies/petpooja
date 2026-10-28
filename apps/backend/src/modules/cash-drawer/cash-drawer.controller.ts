import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  closeShiftSchema,
  drawerTransactionSchema,
  openShiftSchema,
  type CloseShiftDto,
  type DrawerTransactionDto,
  type OpenShiftDto,
  type SessionUser,
} from '@nodedr-restaurant/types';
import { Auth } from '../../common/decorators/auth.decorator';
import { AuditAction } from '../../audit/audit-action';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { CashDrawerService } from './cash-drawer.service';

@ApiTags('cash-drawer')
@Controller('v1/cash-drawer')
export class CashDrawerController {
  constructor(
    private readonly cashDrawer: CashDrawerService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  private access(u: SessionUser, branchId: string) {
    return this.branchAccess.assertAccess(u.restaurantId, branchId);
  }

  @Auth('cash_drawer.manage')
  @Get('current')
  async getCurrentShift(
    @CurrentUser() u: SessionUser,
    @Query('branchId') branchId: string,
  ) {
    await this.access(u, branchId);
    return this.cashDrawer.getCurrentShift(branchId);
  }

  @Auth('cash_drawer.manage')
  @AuditAction('cash_drawer.opened', 'CashDrawerShift')
  @Post('open')
  @UsePipes(new ZodValidationPipe(openShiftSchema))
  async openShift(
    @CurrentUser() u: SessionUser,
    @Query('branchId') branchId: string,
    @Body() body: OpenShiftDto,
  ) {
    await this.access(u, branchId);
    return this.cashDrawer.openShift(branchId, u.id, body);
  }

  @Auth('cash_drawer.manage')
  @AuditAction('cash_drawer.transaction', 'CashDrawerTransaction')
  @Post('transaction')
  @UsePipes(new ZodValidationPipe(drawerTransactionSchema))
  async addTransaction(
    @CurrentUser() u: SessionUser,
    @Query('branchId') branchId: string,
    @Body() body: DrawerTransactionDto,
  ) {
    await this.access(u, branchId);
    return this.cashDrawer.addTransaction(branchId, u.id, body);
  }

  @Auth('cash_drawer.manage')
  @AuditAction('cash_drawer.closed', 'CashDrawerShift')
  @Post('close')
  @UsePipes(new ZodValidationPipe(closeShiftSchema))
  async closeShift(
    @CurrentUser() u: SessionUser,
    @Query('branchId') branchId: string,
    @Body() body: CloseShiftDto,
  ) {
    await this.access(u, branchId);
    return this.cashDrawer.closeShift(branchId, u.id, body);
  }

  @Auth('cash_drawer.manage')
  @Get('shifts')
  async listShifts(
    @CurrentUser() u: SessionUser,
    @Query('branchId') branchId: string,
    @Query('limit') limit?: string,
  ) {
    await this.access(u, branchId);
    return this.cashDrawer.listShifts(
      branchId,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
