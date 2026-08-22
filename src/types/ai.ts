export interface AIMatchResult {
  propertyId: string;
  algorithmicScore: number;
  gptScore: number | null;
  finalScore: number;
  matchReasons: string[];
  investmentInsight: string;
}

export interface AIAnalysisResponse {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'caution';
  priceAssessment: string;
  rentalPotential: string;
  longTermOutlook: string;
}

export interface AIProcessingStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}
