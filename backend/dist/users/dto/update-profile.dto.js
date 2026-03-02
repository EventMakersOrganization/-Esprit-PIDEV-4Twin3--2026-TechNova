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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
<<<<<<< HEAD
], UpdateProfileDto.prototype, "name", void 0);
=======
], UpdateProfileDto.prototype, "first_name", void 0);
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
<<<<<<< HEAD
], UpdateProfileDto.prototype, "academicLevel", void 0);
=======
], UpdateProfileDto.prototype, "last_name", void 0);
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
<<<<<<< HEAD
], UpdateProfileDto.prototype, "enrolledCourse", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "preferences", void 0);
=======
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "academic_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['LOW', 'MEDIUM', 'HIGH']),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "risk_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "points_gamification", void 0);
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
//# sourceMappingURL=update-profile.dto.js.map