import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    STUDENT = "student",
<<<<<<< HEAD
    TEACHER = "teacher",
=======
    INSTRUCTOR = "instructor",
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended"
}
export declare class User {
<<<<<<< HEAD
    name: string;
=======
    first_name: string;
    last_name: string;
    phone: string;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
<<<<<<< HEAD
=======
    updatedAt: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
