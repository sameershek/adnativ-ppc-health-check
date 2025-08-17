export type RawRow = {
  'Campaign Name': string;
  'Ad Group Name': string;
  'Match Type': string;
  'Customer Search Term': string;
  Impressions: string | number;
  Clicks: string | number;
  Cost: string | number;
  '7 Day Total Sales': string | number;
  '7 Day Total Orders (#)': string | number;
};

export type Row = {
  campaign: string;
  adGroup: string;
  matchType: string;
  term: string;
  impressions: number;
  clicks: number;
  cost: number;
  sales: number;
  orders: number;
  ctr: number;  // Clicks / Impressions
  cvr: number;  // Orders / Clicks
  acos: number; // Cost / Sales (Infinity if sales=0 and cost>0)
  isGood: boolean;
  isBad: boolean;
};

export type CampaignSummary = {
  campaign: string;
  impressions: number;
  clicks: number;
  cost: number;
  sales: number;
  orders: number;
  ctr: number;
  cvr: number;
  acos: number;
  wastedSpend: number; // sum Cost where Orders=0 in that campaign
  goodCount: number;
  badCount: number;
  totalRows: number;
};

export type Thresholds = {
  targetACOS: number; // 0.35 for 35%
  minCTR: number;     // 0.003 for 0.30%
  minCVR: number;     // 0.08 for 8%
  zeroOrderWaste: number; // 25 dollars
};

export type Weights = {
  efficiency: number; // 0.35
  conversion: number; // 0.25
  relevance: number;  // 0.15
  waste: number;      // 0.25
};

export type ScoreBreakdown = {
  efficiency: number;
  conversion: number;
  relevance: number;
  waste: number;
};

export type ScoreResult = {
  score: number; // 0-10 one decimal
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  breakdown: ScoreBreakdown;
  overall: {
    acos: number;
    ctr: number;
    cvr: number;
    wastedSpendShare: number;
    totals: { cost: number; sales: number; clicks: number; impressions: number; orders: number };
  };
};
