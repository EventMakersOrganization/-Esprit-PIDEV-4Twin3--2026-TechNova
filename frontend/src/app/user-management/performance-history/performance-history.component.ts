import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-performance-history',
  templateUrl: './performance-history.component.html',
  styleUrls: ['./performance-history.component.css']
})
export class PerformanceHistoryComponent implements OnInit {

  @Input() performances: any[] = [];
  
  Math = Math; 

  // Filtres
  selectedTopic = 'all';
  selectedDifficulty = 'all';
  sortBy = 'date_desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  topics: string[] = [];

  ngOnInit(): void {
    this.extractTopics();
  }

  ngOnChanges(): void {
    this.extractTopics();
  }

  extractTopics(): void {
    const all = this.performances.map(p => p.topic || 'general');
    this.topics = ['all', ...new Set(all)];
  }

  get filtered(): any[] {
    let data = [...this.performances];

    // Filtre topic
    if (this.selectedTopic !== 'all') {
      data = data.filter(p =>
        (p.topic || 'general') === this.selectedTopic
      );
    }

    // Filtre difficulty
    if (this.selectedDifficulty !== 'all') {
      data = data.filter(p =>
        (p.difficulty || 'beginner') === this.selectedDifficulty
      );
    }

    // Sort
    data.sort((a, b) => {
      if (this.sortBy === 'date_desc')
        return new Date(b.attemptDate).getTime() -
               new Date(a.attemptDate).getTime();
      if (this.sortBy === 'date_asc')
        return new Date(a.attemptDate).getTime() -
               new Date(b.attemptDate).getTime();
      if (this.sortBy === 'score_desc')
        return b.score - a.score;
      if (this.sortBy === 'score_asc')
        return a.score - b.score;
      return 0;
    });

    return data;
  }

  get paginated(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filtered.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-red-500 bg-red-50';
  }

  getScoreBadge(score: number): string {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Work';
  }

  getDifficultyColor(difficulty: string): string {
    if (difficulty === 'advanced')
      return 'text-green-700 bg-green-100';
    if (difficulty === 'intermediate')
      return 'text-blue-700 bg-blue-100';
    return 'text-orange-700 bg-orange-100';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(minutes: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  resetFilters(): void {
    this.selectedTopic = 'all';
    this.selectedDifficulty = 'all';
    this.sortBy = 'date_desc';
    this.currentPage = 1;
  }
}