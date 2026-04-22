import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmileScanRecord } from '../../../services/smile-intelligence/smile-scan.model';
import {
  SCORE_BREAKDOWN_LABELS,
  getConfidencePercent,
  getScanDateDisplay,
  getScoreColor,
  getScoreMessage,
  getScoreValue,
  plaqueBadgeClass
} from '../smile-intelligence.utils';

@Component({
  selector: 'app-smile-result-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smile-result-detail.component.html',
  styleUrl: '../smile-intelligence.css',
  encapsulation: ViewEncapsulation.None
})
export class SmileResultDetailComponent {
  @Input({ required: true }) record!: SmileScanRecord;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly newScan = new EventEmitter<void>();
  @Output() readonly viewHistory = new EventEmitter<void>();
  @Output() readonly scoreGuide = new EventEmitter<void>();

  readonly scoreBreakdownLabels = SCORE_BREAKDOWN_LABELS;
  readonly getScoreColor = getScoreColor;
  readonly getScoreValue = getScoreValue;
  readonly getConfidencePercent = getConfidencePercent;
  readonly getScoreMessage = getScoreMessage;
  readonly getScanDateDisplay = getScanDateDisplay;
  readonly plaqueBadgeClass = plaqueBadgeClass;
}
