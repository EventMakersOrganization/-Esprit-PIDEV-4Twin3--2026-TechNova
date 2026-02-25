import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UserRow {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-teacher-management',
  templateUrl: './teacher-management.component.html',
  styleUrls: []
})
export class TeacherManagementComponent implements OnInit {
  teachers: UserRow[] = [];
  editing: Record<string, boolean> = {};
  editModels: Record<string, Partial<UserRow>> = {};
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.http.get<UserRow[]>('http://localhost:3000/api/admin/instructors').subscribe({
      next: data => this.teachers = data,
      error: () => this.error = 'Failed to load instructors'
    });
  }

  startEdit(t: UserRow) {
    this.editing[t.id] = true;
    this.editModels[t.id] = { first_name: t.first_name, last_name: t.last_name, phone: t.phone || '', status: t.status } as any;
  }

  cancelEdit(id: string) {
    delete this.editing[id];
    delete this.editModels[id];
  }

  save(id: string) {
    const body = this.editModels[id];
    this.http.put(`http://localhost:3000/api/admin/user/${id}`, body).subscribe({
      next: () => {
        this.cancelEdit(id);
        this.loadTeachers();
      },
      error: () => this.error = 'Failed to update'
    });
  }

  deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    this.http.delete(`http://localhost:3000/api/admin/user/${id}`).subscribe({
      next: () => this.loadTeachers(),
      error: () => this.error = 'Failed to delete user'
    });
  }
}
