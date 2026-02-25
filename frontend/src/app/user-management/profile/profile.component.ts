import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

interface ProfileData {
  user: {
    id: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role: string;
    status: string;
  };
  profile: {
    academic_level: string;
    risk_level: string;
    points_gamification: number;
  } | null;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profileData: ProfileData | null = null;
  isEditing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      phone: [''],
      academic_level: [''],
      risk_level: ['LOW'],
      points_gamification: [0]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<ProfileData>('http://localhost:3000/api/user/profile').subscribe({
      next: (data) => {
        this.profileData = data;
        this.profileForm.patchValue({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          phone: (data.user as any).phone || '',
          academic_level: data.profile?.academic_level || '',
          risk_level: data.profile?.risk_level || 'LOW',
          points_gamification: data.profile?.points_gamification || 0
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile.';
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.http.put('http://localhost:3000/api/user/profile', this.profileForm.value).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully!';
          this.isEditing = false;
          this.loadProfile();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update profile.';
        }
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
