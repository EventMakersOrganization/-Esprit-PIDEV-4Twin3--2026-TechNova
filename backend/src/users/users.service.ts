import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { StudentProfile, StudentProfileDocument } from './schemas/student-profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/schemas/activity.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name) private profileModel: Model<StudentProfileDocument>,
    private activityService: ActivityService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileModel.findOne({ userId }).exec();
    return {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      profile: profile
        ? {
            academic_level: profile.academic_level,
            risk_level: profile.risk_level,
            points_gamification: profile.points_gamification,
          }
        : null,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (updateProfileDto.first_name) {
      user.first_name = updateProfileDto.first_name;
    }
    if (updateProfileDto.last_name) {
      user.last_name = updateProfileDto.last_name;
    }
    if (updateProfileDto.phone) {
      user.phone = updateProfileDto.phone;
    }
    // Only create/update student profile when user role is STUDENT
    if (
      user.role === UserRole.STUDENT && (
        updateProfileDto.academic_level ||
        updateProfileDto.risk_level ||
        updateProfileDto.points_gamification !== undefined
      )
    ) {
      let profile = await this.profileModel.findOne({ userId }).exec();
      if (!profile) {
        profile = new this.profileModel({ userId });
      }
      if (updateProfileDto.academic_level) profile.academic_level = updateProfileDto.academic_level;
      if (updateProfileDto.risk_level) profile.risk_level = updateProfileDto.risk_level as any;
      if (updateProfileDto.points_gamification !== undefined) profile.points_gamification = updateProfileDto.points_gamification as any;
      await profile.save();
    }

    await user.save();

    // Log activity
    await this.activityService.logActivity(userId, ActivityAction.PROFILE_UPDATE);

    return this.getProfile(userId);
  }

  async getUsersByRole(role: string) {
    // for backward compatibility treat 'instructor' as including legacy 'teacher' role
    let query: any;
    if (role === UserRole.INSTRUCTOR) {
      query = { role: { $in: [UserRole.INSTRUCTOR, 'teacher'] } };
    } else {
      query = { role };
    }

    const users = await this.userModel.find(query).select('-password').exec();

    // If requesting students, include their student profiles
    if (role === UserRole.STUDENT) {
      const userIds = users.map(u => u._id);
      const profiles = await this.profileModel.find({ userId: { $in: userIds } }).exec();
      const profileMap = new Map<string, StudentProfileDocument>();
      profiles.forEach(p => profileMap.set(String(p.userId), p));

      return users.map(u => {
        const p = profileMap.get(String(u._id));
        return {
          id: u._id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          academic_level: p ? p.academic_level : undefined,
          risk_level: p ? p.risk_level : undefined,
          points_gamification: p ? p.points_gamification : undefined,
        } as any;
      });
    }

    return users.map(u => ({
      id: u._id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async updateUserById(id: string, dto: any) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.first_name) user.first_name = dto.first_name;
    if (dto.last_name) user.last_name = dto.last_name;
    if (dto.phone) user.phone = dto.phone;
    if (dto.role) user.role = dto.role;
    if (dto.status) user.status = dto.status;

    await user.save();

    // Only create/update student profile when user role is STUDENT
    if (
      user.role === UserRole.STUDENT && (
        dto.academic_level ||
        dto.risk_level ||
        dto.points_gamification !== undefined
      )
    ) {
      let profile = await this.profileModel.findOne({ userId: id }).exec();
      if (!profile) {
        profile = new this.profileModel({ userId: id });
      }
      if (dto.academic_level) profile.academic_level = dto.academic_level;
      if (dto.risk_level) profile.risk_level = dto.risk_level as any;
      if (dto.points_gamification !== undefined) profile.points_gamification = dto.points_gamification as any;
      await profile.save();
    }

    await this.activityService.logActivity(id, ActivityAction.PROFILE_UPDATE);

    return { success: true };
  }

  async deleteUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.profileModel.deleteOne({ userId: id }).exec();
    await this.userModel.deleteOne({ _id: id }).exec();

    await this.activityService.logActivity(id, ActivityAction.PROFILE_UPDATE);

    return { success: true };
  }
}
