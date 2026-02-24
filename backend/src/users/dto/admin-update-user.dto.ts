import { IsOptional, IsString, IsIn, IsInt } from 'class-validator';
import { UserRole, UserStatus } from '../schemas/user.schema';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @IsOptional()
  @IsString()
  academic_level?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsInt()
  points_gamification?: number;
}
