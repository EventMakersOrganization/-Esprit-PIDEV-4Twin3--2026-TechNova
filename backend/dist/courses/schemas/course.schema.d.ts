import { Document, Types } from 'mongoose';
export type CourseDocument = Course & Document;
export declare class Module {
    title: string;
    description: string;
    order: number;
}
export declare const ModuleSchema: import("mongoose").Schema<Module, import("mongoose").Model<Module, any, any, any, Document<unknown, any, Module> & Module & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Module, Document<unknown, {}, import("mongoose").FlatRecord<Module>> & import("mongoose").FlatRecord<Module> & {
    _id: Types.ObjectId;
}>;
export declare class Course {
    title: string;
    description: string;
    level: string;
    instructorId: Types.ObjectId;
    modules: Module[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const CourseSchema: import("mongoose").Schema<Course, import("mongoose").Model<Course, any, any, any, Document<unknown, any, Course> & Course & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Course, Document<unknown, {}, import("mongoose").FlatRecord<Course>> & import("mongoose").FlatRecord<Course> & {
    _id: Types.ObjectId;
}>;
