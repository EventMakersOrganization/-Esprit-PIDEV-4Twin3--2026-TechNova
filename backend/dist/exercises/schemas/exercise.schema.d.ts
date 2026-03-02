import { Document, Types } from 'mongoose';
export type ExerciseDocument = Exercise & Document;
export declare enum Difficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export declare enum ExerciseType {
    QUIZ = "quiz",
    MCQ = "MCQ",
    PROBLEM = "problem"
}
export declare class Exercise {
    courseId: Types.ObjectId;
    difficulty: Difficulty;
    content: string;
    correctAnswer: string;
    type: ExerciseType;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ExerciseSchema: import("mongoose").Schema<Exercise, import("mongoose").Model<Exercise, any, any, any, Document<unknown, any, Exercise> & Exercise & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Exercise, Document<unknown, {}, import("mongoose").FlatRecord<Exercise>> & import("mongoose").FlatRecord<Exercise> & {
    _id: Types.ObjectId;
}>;
