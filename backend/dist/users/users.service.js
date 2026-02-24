"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const student_profile_schema_1 = require("./schemas/student-profile.schema");
const activity_service_1 = require("../activity/activity.service");
const activity_schema_1 = require("../activity/schemas/activity.schema");
let UsersService = class UsersService {
    constructor(userModel, profileModel, activityService) {
        this.userModel = userModel;
        this.profileModel = profileModel;
        this.activityService = activityService;
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateProfileDto.first_name) {
            user.first_name = updateProfileDto.first_name;
        }
        if (updateProfileDto.last_name) {
            user.last_name = updateProfileDto.last_name;
        }
        if (updateProfileDto.phone) {
            user.phone = updateProfileDto.phone;
        }
        if (user.role === user_schema_1.UserRole.STUDENT && (updateProfileDto.academic_level ||
            updateProfileDto.risk_level ||
            updateProfileDto.points_gamification !== undefined)) {
            let profile = await this.profileModel.findOne({ userId }).exec();
            if (!profile) {
                profile = new this.profileModel({ userId });
            }
            if (updateProfileDto.academic_level)
                profile.academic_level = updateProfileDto.academic_level;
            if (updateProfileDto.risk_level)
                profile.risk_level = updateProfileDto.risk_level;
            if (updateProfileDto.points_gamification !== undefined)
                profile.points_gamification = updateProfileDto.points_gamification;
            await profile.save();
        }
        await user.save();
        await this.activityService.logActivity(userId, activity_schema_1.ActivityAction.PROFILE_UPDATE);
        return this.getProfile(userId);
    }
    async getUsersByRole(role) {
        let query;
        if (role === user_schema_1.UserRole.INSTRUCTOR) {
            query = { role: { $in: [user_schema_1.UserRole.INSTRUCTOR, 'teacher'] } };
        }
        else {
            query = { role };
        }
        const users = await this.userModel.find(query).select('-password').exec();
        if (role === user_schema_1.UserRole.STUDENT) {
            const userIds = users.map(u => u._id);
            const profiles = await this.profileModel.find({ userId: { $in: userIds } }).exec();
            const profileMap = new Map();
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
                };
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
    async updateUserById(id, dto) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.first_name)
            user.first_name = dto.first_name;
        if (dto.last_name)
            user.last_name = dto.last_name;
        if (dto.phone)
            user.phone = dto.phone;
        if (dto.role)
            user.role = dto.role;
        if (dto.status)
            user.status = dto.status;
        await user.save();
        if (user.role === user_schema_1.UserRole.STUDENT && (dto.academic_level ||
            dto.risk_level ||
            dto.points_gamification !== undefined)) {
            let profile = await this.profileModel.findOne({ userId: id }).exec();
            if (!profile) {
                profile = new this.profileModel({ userId: id });
            }
            if (dto.academic_level)
                profile.academic_level = dto.academic_level;
            if (dto.risk_level)
                profile.risk_level = dto.risk_level;
            if (dto.points_gamification !== undefined)
                profile.points_gamification = dto.points_gamification;
            await profile.save();
        }
        await this.activityService.logActivity(id, activity_schema_1.ActivityAction.PROFILE_UPDATE);
        return { success: true };
    }
    async deleteUserById(id) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.profileModel.deleteOne({ userId: id }).exec();
        await this.userModel.deleteOne({ _id: id }).exec();
        await this.activityService.logActivity(id, activity_schema_1.ActivityAction.PROFILE_UPDATE);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(student_profile_schema_1.StudentProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        activity_service_1.ActivityService])
], UsersService);
//# sourceMappingURL=users.service.js.map