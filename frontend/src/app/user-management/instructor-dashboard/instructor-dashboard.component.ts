import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.css']
})
export class InstructorDashboardComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

