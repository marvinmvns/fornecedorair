import { PartialType } from '@nestjs/swagger';
import { CreateAirConditionerDto } from './create-air-conditioner.dto';

export class UpdateAirConditionerDto extends PartialType(CreateAirConditionerDto) {}
