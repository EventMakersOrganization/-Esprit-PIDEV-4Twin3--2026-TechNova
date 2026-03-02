import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        user: {
            id: any;
<<<<<<< HEAD
            name: string;
            email: string;
=======
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
            role: import("./schemas/user.schema").UserRole;
            status: import("./schemas/user.schema").UserStatus;
        };
        profile: {
<<<<<<< HEAD
            academicLevel: string;
            enrolledCourse: string;
            preferences: Record<string, any>;
            averageScore: number;
=======
            academic_level: string;
            risk_level: "LOW" | "MEDIUM" | "HIGH";
            points_gamification: number;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
        };
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        user: {
            id: any;
<<<<<<< HEAD
            name: string;
            email: string;
=======
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
            role: import("./schemas/user.schema").UserRole;
            status: import("./schemas/user.schema").UserStatus;
        };
        profile: {
<<<<<<< HEAD
            academicLevel: string;
            enrolledCourse: string;
            preferences: Record<string, any>;
            averageScore: number;
=======
            academic_level: string;
            risk_level: "LOW" | "MEDIUM" | "HIGH";
            points_gamification: number;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
        };
    }>;
}
