import { Component, OnInit } from '@angular/core';
import { RecordsService } from '../../services/records.service';
import { Record } from '../../models/record';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {
  records: Record[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private recordsService: RecordsService) { }

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.error = null;

    this.recordsService.getRecords().subscribe({
      next: (records) => {
        this.records = records;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load records. Please try again later.';
        this.loading = false;
        console.error('Error loading records:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
}