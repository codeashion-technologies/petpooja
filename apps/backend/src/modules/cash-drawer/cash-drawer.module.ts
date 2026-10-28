import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { CashDrawerController } from './cash-drawer.controller';
import { CashDrawerService } from './cash-drawer.service';

@Module({
  imports: [AuditModule],
  controllers: [CashDrawerController],
  providers: [CashDrawerService, BranchAccessService],
  exports: [CashDrawerService],
})
export class CashDrawerModule {}
