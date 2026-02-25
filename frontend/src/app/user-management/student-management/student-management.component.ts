import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UserRow {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  status: string;
  academic_level?: string;
  risk_level?: string;
  points_gamification?: number;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-student-management',
  templateUrl: './student-management.component.html',
  styleUrls: []
})
export class StudentManagementComponent implements OnInit {
  students: UserRow[] = [];
  editing: Record<string, boolean> = {};
  editModels: Record<string, Partial<UserRow>> = {};
  error = '';
  success = '';

  // filter inputs from template
  filterText = '';
  filterRole = 'All Roles';
  filterStatus = 'Status: All';

  get filteredStudents(): UserRow[] {
    return this.students.filter(s => {
      const text = this.filterText.toLowerCase();
      if (text) {
        const match =
          s.first_name?.toLowerCase().includes(text) ||
          s.last_name?.toLowerCase().includes(text) ||
          s.email.toLowerCase().includes(text);
        if (!match) return false;
      }
      if (this.filterStatus !== 'Status: All') {
        if (s.status !== this.filterStatus) return false;
      }
      // role filter not used since all are students, but included for completeness
      if (this.filterRole !== 'All Roles') {
        if (s.role !== this.filterRole.toLowerCase()) return false;
      }
      return true;
    });
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.http.get<UserRow[]>('http://localhost:3000/api/admin/students').subscribe({
      next: data => this.students = data,
      error: () => this.error = 'Failed to load students'
    });
  }

  startEdit(s: UserRow) {
    this.editing[s.id] = true;
    this.editModels[s.id] = {
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      phone: s.phone || '',
      academic_level: s.academic_level || '',
      risk_level: s.risk_level || 'LOW',
      points_gamification: s.points_gamification || 0,
      status: s.status
    } as any;
  }

  cancelEdit(id: string) {
    delete this.editing[id];
    delete this.editModels[id];
  }

  save(id: string) {
    // clone and strip empty values to satisfy backend validation
    const raw = this.editModels[id];
    const body: any = {};
    Object.keys(raw).forEach(k => {
      const v = (raw as any)[k];
      if (v !== '' && v !== null && v !== undefined) {
        body[k] = v;
      }
    });
    this.http.put(`http://localhost:3000/api/admin/user/${id}`, body).subscribe({
      next: () => {
        this.success = 'Updated successfully';
        this.cancelEdit(id);
        this.loadStudents();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        console.error('update error', err);
        this.error = 'Failed to update';
      }
    });
  }

  deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    this.http.delete(`http://localhost:3000/api/admin/user/${id}`).subscribe({
      next: () => this.loadStudents(),
      error: () => this.error = 'Failed to delete user'
    });
  }
}
