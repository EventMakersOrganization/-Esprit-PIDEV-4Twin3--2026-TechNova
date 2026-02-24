import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/schemas/activity.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private activityService: ActivityService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { email, password, first_name, last_name, phone } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      first_name,
      last_name,
      phone,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT, // Default role
    });

    await user.save();
    return { message: 'User registered successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Log activity
    await this.activityService.logActivity(user._id, ActivityAction.LOGIN);

    return {
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    };
  }
}
