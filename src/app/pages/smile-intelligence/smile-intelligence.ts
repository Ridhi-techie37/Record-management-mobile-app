import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmileScanRecord } from '../../services/smile-intelligence/smile-scan.model';
import { SmileCaptureComponent } from './capture/smile-capture.component';
import { SmileHistoryComponent } from './history/smile-history.component';
import { SmileResultDetailComponent } from './result/smile-result-detail.component';

type SmileTab = 'capture' | 'history';

@Component({
  selector: 'app-smile-intelligence',
  standalone: true,
  imports: [CommonModule, SmileCaptureComponent, SmileHistoryComponent, SmileResultDetailComponent],
  templateUrl: './smile-intelligence.html',
  styleUrl: './smile-intelligence.css'
})
export class SmileIntelligence {
  activeTab: SmileTab = 'capture';
  detailRecord: SmileScanRecord | null = null;
  showScoreGuide = false;

  setTab(tab: SmileTab): void {
    this.activeTab = tab;
  }

  onOpenResult(record: SmileScanRecord): void {
    this.detailRecord = record;
  }

  closeDetail(): void {
    this.detailRecord = null;
    this.showScoreGuide = false;
  }

  goNewScanFromDetail(): void {
    this.closeDetail();
    this.setTab('capture');
  }

  onViewHistoryFromResult(): void {
    this.closeDetail();
    this.setTab('history');
  }

  openScoreGuide(): void {
    this.showScoreGuide = true;
  }

  closeScoreGuide(): void {
    this.showScoreGuide = false;
  }
}
