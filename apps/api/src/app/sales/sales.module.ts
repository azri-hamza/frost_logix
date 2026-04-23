import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [DatabaseModule, BatchesModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}