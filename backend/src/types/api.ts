import { z } from 'zod';

// API Request/Response Types
export const ScreenRequestSchema = z.object({
  symbols: z.array(z.string().toUpperCase()),
  filters: z.object({
    bds: z.object({
      enabled: z.boolean().default(true),
      categories: z.array(z.enum([
        'economic_exploitation',
        'exploitation_occupied_resources', 
        'settlement_enterprise',
        'israeli_construction_occupied_land',
        'services_to_settlements',
        'other_bds_activities'
      ])).optional(),
    }).optional(),
    defense: z.boolean().optional(),
    surveillance: z.boolean().optional(),
    shariah: z.boolean().optional(),
  }),
  options: z.object({
    lookthrough: z.boolean().default(true),
    maxDepth: z.number().min(1).max(5).default(2),
  }).optional(),
});

export const ScreenResponseSchema = z.object({
  requestId: z.string(),
  asOf: z.string(),
  rows: z.array(z.object({
    symbol: z.string(),
    company: z.string(),
    statuses: z.object({
      bds: z.object({
        overall: z.enum(['pass', 'review', 'excluded']),
        categories: z.array(z.object({
          category: z.enum([
            'economic_exploitation',
            'exploitation_occupied_resources',
            'settlement_enterprise', 
            'israeli_construction_occupied_land',
            'services_to_settlements',
            'other_bds_activities'
          ]),
          status: z.enum(['pass', 'review', 'excluded']),
          evidence: z.array(z.string()).optional(),
        })).optional(),
      }),
      defense: z.enum(['pass', 'review', 'excluded']),
      surveillance: z.enum(['pass', 'review', 'excluded']),
      shariah: z.enum(['pass', 'review', 'excluded']),
    }),
    finalVerdict: z.enum(['PASS', 'REVIEW', 'EXCLUDED']),
    reasons: z.array(z.string()),
    confidence: z.enum(['Low', 'Medium', 'High']),
    asOfRow: z.string(),
    sources: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })),
    auditId: z.string(),
  })),
  warnings: z.array(z.string()).optional(),
});

export const HoldingsRequestSchema = z.object({
  csvContent: z.string(),
  sanitize: z.boolean().default(true),
});

export const HoldingsResponseSchema = z.object({
  requestId: z.string(),
  tickers: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
});

export const DisputeRequestSchema = z.object({
  auditId: z.string(),
  message: z.string().min(10).max(1000),
  evidenceUrl: z.string().url().optional(),
});

export const DisputeResponseSchema = z.object({
  requestId: z.string(),
  disputeId: z.string(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']),
});

export const MethodologyResponseSchema = z.object({
  filter: z.enum(['bds', 'defense', 'surveillance', 'shariah']),
  version: z.string(),
  description: z.string(),
  thresholds: z.record(z.any()),
  rules: z.array(z.object({
    id: z.string(),
    code: z.string(),
    description: z.string(),
    active: z.boolean(),
  })),
});

export const SourcesResponseSchema = z.object({
  auditId: z.string(),
  sources: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
    snapshotHash: z.string().optional(),
    crawlTimestamp: z.string(),
    datasetRows: z.array(z.record(z.any())).optional(),
  })),
});

// TypeScript types
export type ScreenRequest = z.infer<typeof ScreenRequestSchema>;
export type ScreenResponse = z.infer<typeof ScreenResponseSchema>;
export type HoldingsRequest = z.infer<typeof HoldingsRequestSchema>;
export type HoldingsResponse = z.infer<typeof HoldingsResponseSchema>;
export type DisputeRequest = z.infer<typeof DisputeRequestSchema>;
export type DisputeResponse = z.infer<typeof DisputeResponseSchema>;
export type MethodologyResponse = z.infer<typeof MethodologyResponseSchema>;
export type SourcesResponse = z.infer<typeof SourcesResponseSchema>;

// BDS Category Types
export type BdsCategory = 
  | 'economic_exploitation'
  | 'exploitation_occupied_resources'
  | 'settlement_enterprise'
  | 'israeli_construction_occupied_land'
  | 'services_to_settlements'
  | 'other_bds_activities';

export interface BdsCategoryStatus {
  category: BdsCategory;
  status: 'pass' | 'review' | 'excluded';
  evidence?: string[];
}

export interface BdsStatus {
  overall: 'pass' | 'review' | 'excluded';
  categories?: BdsCategoryStatus[];
}

// Internal types
export interface ScreeningResult {
  symbol: string;
  company: string;
  statuses: {
    bds: BdsStatus;
    defense: 'pass' | 'review' | 'excluded';
    surveillance: 'pass' | 'review' | 'excluded';
    shariah: 'pass' | 'review' | 'excluded';
  };
  finalVerdict: 'PASS' | 'REVIEW' | 'EXCLUDED';
  reasons: string[];
  confidence: 'Low' | 'Medium' | 'High';
  asOfRow: string;
  sources: Array<{
    label: string;
    url: string;
  }>;
  auditId: string;
}

export interface FilterConfig {
  bds: {
    enabled: boolean;
    categories?: BdsCategory[] | undefined;
  };
  defense: boolean;
  surveillance: boolean;
  shariah: boolean;
}

export interface ScreeningOptions {
  lookthrough: boolean;
  maxDepth: number;
}

export interface CacheKey {
  filters: string;
  symbols: string;
  version: string;
}
