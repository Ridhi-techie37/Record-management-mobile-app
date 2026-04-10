import { Component, EventEmitter, OnDestroy, Output, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SmileScanService } from '../../../services/smile-intelligence/smile-scan.service';
import { SmileScanResult } from '../../../services/smile-intelligence/smile-scan.model';
import { ScanHistoryService } from '../../../services/smile-intelligence/scan-history.service';
import {
  SCORE_BREAKDOWN_LABELS,
  getConfidencePercent,
  getScanDateDisplay,
  getScoreColor,
  getScoreMessage,
  getScoreValue,
  plaqueBadgeClass
} from '../smile-intelligence.utils';

const LOADING_TIPS = [
  'Brushing 2 minutes twice a day removes most plaque.',
  'Flossing reaches ~40% of tooth surfaces brushing misses.',
  'Cheese and dairy can help strengthen tooth enamel.',
  'Smiling can boost your mood and reduce stress.',
  'Replace your toothbrush every 3–4 months for best results.',
  'Water helps rinse food and bacteria between brushes.'
];

@Component({
  selector: 'app-smile-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smile-capture.component.html',
  styleUrl: '../smile-intelligence.css',
  encapsulation: ViewEncapsulation.None
})
export class SmileCaptureComponent implements OnDestroy {
  @Output() readonly switchToHistory = new EventEmitter<void>();
  @Output() readonly scoreGuide = new EventEmitter<void>();

  patientIdInput: string | number | null = '';
  selectedImage: File | null = null;
  previewUrl: string | null = null;

  loading = false;
  loadingTip = '';
  private tipInterval: ReturnType<typeof setInterval> | null = null;
  error = '';
  latestResult: SmileScanResult | null = null;
  showCameraModal = false;
  cameraError = '';
  private mediaStream: MediaStream | null = null;

  readonly scoreBreakdownLabels = SCORE_BREAKDOWN_LABELS;
  readonly getScoreColor = getScoreColor;
  readonly getScoreValue = getScoreValue;
  readonly getConfidencePercent = getConfidencePercent;
  readonly getScoreMessage = getScoreMessage;
  readonly getScanDateDisplay = getScanDateDisplay;
  readonly plaqueBadgeClass = plaqueBadgeClass;

  constructor(
    private readonly smileScanService: SmileScanService,
    private readonly scanHistory: ScanHistoryService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get canAnalyze(): boolean {
    const patientId = this.getPatientId();
    return !!this.selectedImage && patientId > 0 && !this.loading;
  }

  getPatientId(): number {
    const raw = this.patientIdInput;
    if (raw == null) return 0;
    const normalized = String(raw).trim();
    if (!normalized) return 0;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

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
    const patientId = this.getPatientId();
    if (!patientId || patientId <= 0) {
      this.error = 'Please enter a valid Patient ID.';
      return;
    }
    if (!this.selectedImage) {
      this.error = 'Please select an image.';
      return;
    }

    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.pickNextTip();
    this.startTipRotation();
    this.smileScanService
      .scanSmile(patientId, this.selectedImage)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.stopTipRotation();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          try {
            this.loading = false;
            this.stopTipRotation();
            this.latestResult = result;
            this.scanHistory.add({
              ...result,
              externalPatientId: patientId,
              imageDataUrl: this.previewUrl ?? undefined
            });
            this.cdr.detectChanges();
          } catch (e) {
            this.error = e instanceof Error ? e.message : 'Failed to render analysis result';
            this.loading = false;
            this.stopTipRotation();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.error = typeof err === 'string' ? err : err?.message || 'Analysis failed';
          this.loading = false;
          this.stopTipRotation();
          this.cdr.detectChanges();
        }
      });
  }

  triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }

  async openCamera(): Promise<void> {
    this.cameraError = '';
    if (!navigator?.mediaDevices?.getUserMedia) {
      this.cameraError = 'Camera is not supported in this browser.';
      return;
    }
    try {
      this.showCameraModal = true;
      setTimeout(() => this.startCameraStream(), 0);
    } catch {
      this.cameraError = 'Unable to access camera. Please allow camera permission.';
      this.closeCamera();
    }
  }

  private async startCameraStream(): Promise<void> {
    const videoEl = document.getElementById('smile-camera-video') as HTMLVideoElement | null;
    if (!videoEl) return;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      videoEl.srcObject = this.mediaStream;
      await videoEl.play();
    } catch {
      this.cameraError = 'Unable to access camera. Please allow camera permission.';
      this.closeCamera();
    }
  }

  capturePhoto(videoEl: HTMLVideoElement): void {
    if (!videoEl.videoWidth || !videoEl.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `smile-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.selectedImage = file;
      this.latestResult = null;
      this.error = '';
      this.releasePreviewUrl();
      this.previewUrl = URL.createObjectURL(file);
      this.closeCamera();
    }, 'image/jpeg', 0.92);
  }

  closeCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.showCameraModal = false;
  }

  clearCaptureResult(): void {
    this.latestResult = null;
    this.selectedImage = null;
    this.releasePreviewUrl();
    this.error = '';
  }

  clearPreviewOnly(): void {
    this.selectedImage = null;
    this.releasePreviewUrl();
  }

  ngOnDestroy(): void {
    this.releasePreviewUrl();
    this.closeCamera();
    this.stopTipRotation();
  }

  private releasePreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private pickNextTip(): void {
    this.loadingTip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
  }

  private startTipRotation(): void {
    this.stopTipRotation();
    this.tipInterval = setInterval(() => this.pickNextTip(), 4000);
  }

  private stopTipRotation(): void {
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
      this.tipInterval = null;
    }
  }
}
