import { IsArray, IsString } from 'class-validator';

export class DispatchSuppliersDto {
  @IsArray()
  @IsString({ each: true })
  supplierIds: string[];
}
