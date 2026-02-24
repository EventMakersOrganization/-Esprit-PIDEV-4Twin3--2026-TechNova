import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { StudentManagementComponent } from './student-management/student-management.component';
import { TeacherManagementComponent } from './teacher-management/teacher-management.component';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { JwtInterceptor } from './jwt.interceptor';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/students', component: StudentManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/instructors', component: TeacherManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['student'] } },
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    AdminDashboardComponent,
    StudentDashboardComponent
    ,StudentManagementComponent,TeacherManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    AuthService,
    AuthGuard,
    RoleGuard,
    JwtInterceptor
  ]
})
export class UserManagementModule { }
