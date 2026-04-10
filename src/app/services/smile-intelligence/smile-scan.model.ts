export interface SmileScanResult {
  smileScore: number;
  alignmentScore: number;
  gumHealthScore: number;
  whitenessScore: number;
  symmetryScore: number;
  plaqueRiskLevel: string;
  confidenceScore: number;
  recommendations: string[];
  imageUrl?: string | null;
  createdAt?: string | null;
}

export interface SmileScanRecord extends SmileScanResult {
  id: string;
  scannedAt: Date;
  imageDataUrl?: string;
  externalPatientId?: number;
}
