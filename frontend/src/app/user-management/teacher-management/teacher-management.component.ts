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

  filterText = '';
  filterStatus = 'Status: All';

  get filteredTeachers(): UserRow[] {
    return this.teachers.filter(t => {
      const text = this.filterText.toLowerCase();
      if (text) {
        const match =
          t.first_name?.toLowerCase().includes(text) ||
          t.last_name?.toLowerCase().includes(text) ||
          t.email.toLowerCase().includes(text);
        if (!match) return false;
      }
      if (this.filterStatus !== 'Status: All') {
        if (t.status !== this.filterStatus) return false;
      }
      return true;
    });
  }

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
    this.editModels[t.id] = { first_name: t.first_name, last_name: t.last_name, email: t.email, phone: t.phone || '', status: t.status } as any;
  }

  cancelEdit(id: string) {
    delete this.editing[id];
    delete this.editModels[id];
  }

  save(id: string) {
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
        this.cancelEdit(id);
        this.loadTeachers();
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
      next: () => this.loadTeachers(),
      error: () => this.error = 'Failed to delete user'
    });
  }
}
