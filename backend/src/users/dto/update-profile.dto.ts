import { IsOptional, IsString, IsIn, IsInt } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  academic_level?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsInt()
  points_gamification?: number;
}
