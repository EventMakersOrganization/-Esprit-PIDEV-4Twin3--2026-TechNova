import { Document, Types } from 'mongoose';
export type StudentProfileDocument = StudentProfile & Document;
export declare class StudentProfile {
    userId: Types.ObjectId;
<<<<<<< HEAD
    academicLevel: string;
    enrolledCourse: string;
    preferences: Record<string, any>;
    averageScore: number;
=======
    academic_level: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    points_gamification: number;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
}
export declare const StudentProfileSchema: import("mongoose").Schema<StudentProfile, import("mongoose").Model<StudentProfile, any, any, any, Document<unknown, any, StudentProfile> & StudentProfile & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, StudentProfile, Document<unknown, {}, import("mongoose").FlatRecord<StudentProfile>> & import("mongoose").FlatRecord<StudentProfile> & {
    _id: Types.ObjectId;
}>;
