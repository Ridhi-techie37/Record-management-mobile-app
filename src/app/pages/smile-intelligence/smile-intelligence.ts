import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmileScanResult, SmileScanService } from '../../services/smile-intelligence/smile-scan.service';

@Component({
  selector: 'app-smile-intelligence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smile-intelligence.html',
  styleUrl: './smile-intelligence.css'
})
export class SmileIntelligence implements OnDestroy {
  patientIdInput = '';
  selectedImage: File | null = null;
  previewUrl: string | null = null;

  loading = false;
  historyLoading = false;
  error = '';
  historyError = '';

  latestResult: SmileScanResult | null = null;
  history: SmileScanResult[] = [];

  constructor(private readonly smileScanService: SmileScanService) {}

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage = file;
    this.latestResult = null;
    this.error = '';

    if (!file) {
      this.previewUrl = null;
      return;
    }
    this.releasePreviewUrl();
    this.previewUrl = URL.createObjectURL(file);
  }

  analyze(): void {
    const patientId = parseInt(this.patientIdInput.trim(), 10);
    if (!patientId || patientId <= 0) {
      this.error = 'Please enter a valid Patient ID.';
      return;
    }
    if (!this.selectedImage) {
      this.error = 'Please select an image.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.smileScanService.scanSmile(patientId, this.selectedImage).subscribe({
      next: (result) => {
        this.latestResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : err?.message || 'Analysis failed';
        this.loading = false;
      }
    });
  }

  loadHistory(): void {
    const patientId = parseInt(this.patientIdInput.trim(), 10);
    if (!patientId || patientId <= 0) {
      this.historyError = 'Please enter a valid Patient ID.';
      return;
    }

    this.historyLoading = true;
    this.historyError = '';
    this.history = [];
    this.smileScanService.getByPatientId(patientId).subscribe({
      next: (items) => {
        this.history = items ?? [];
        this.historyLoading = false;
      },
      error: (err) => {
        this.historyError = typeof err === 'string' ? err : err?.message || 'Failed to load history';
        this.historyLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.releasePreviewUrl();
  }

  private releasePreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }
}
