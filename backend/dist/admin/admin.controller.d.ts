import { UsersService } from '../users/users.service';
import { AdminUpdateUserDto } from '../users/dto/admin-update-user.dto';
export declare class AdminController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getStudents(): Promise<any[]>;
    getInstructors(): Promise<any[]>;
    updateUser(id: string, dto: AdminUpdateUserDto): Promise<{
        success: boolean;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
}
