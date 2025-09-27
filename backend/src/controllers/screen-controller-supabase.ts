import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ScreeningEngine } from "../services/screening-engine";
import { ScreenRequestSchema } from "../types/api";
import { logger } from "../utils/logger";

export class ScreenController {
  private screeningEngine: ScreeningEngine;

  constructor(screeningEngine: ScreeningEngine) {
    this.screeningEngine = screeningEngine;
  }

  async screen(req: Request, res: Response) {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      // Validate request
      const validationResult = ScreenRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request format',
          details: validationResult.error.errors,
          requestId,
        });
      }

      const { symbols, filters, options } = validationResult.data;

      // Perform screening
      logger.info('Starting screening', { requestId, symbols: symbols.length });
      
      const results = await this.screeningEngine.screenCompanies(
        symbols,
        {
          bds: { enabled: filters?.bds?.enabled ?? true, categories: filters?.bds?.categories },
          defense: filters?.defense ?? true,
          surveillance: filters?.surveillance ?? true,
          shariah: filters?.shariah ?? true,
        },
        {
          lookthrough: options?.lookthrough ?? true,
          maxDepth: options?.maxDepth ?? 2,
        }
      );

      // Prepare response
      const response = {
        asOf: new Date().toISOString().split('T')[0],
        rows: results.map(result => ({
          symbol: result.symbol,
          company: result.company,
          statuses: result.statuses,
          finalVerdict: result.finalVerdict,
          reasons: result.reasons,
          confidence: result.confidence,
          asOfRow: result.asOfRow,
          sources: result.sources,
          auditId: result.auditId,
        })),
        warnings: this.generateWarnings(symbols, results),
      };

      // Log metrics
      const duration = Date.now() - startTime;
      logger.info('Screening completed', {
        requestId,
        duration,
        symbolsCount: symbols.length,
        resultsCount: results.length,
      });

      // Return response
      return res.json({
        ...response,
        requestId,
        cached: false,
      });

    } catch (error) {
      logger.error('Screening error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      return res.status(500).json({
        error: 'Internal server error',
        requestId,
      });
    }
  }

  async holdings(req: Request, res: Response) {
    const requestId = uuidv4();

    try {
      const { csvContent, sanitize = true } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({
          error: 'CSV content is required',
          requestId,
        });
      }

      // Parse CSV and extract tickers
      const tickers = this.parseCSV(csvContent, sanitize);
      const warnings = this.validateTickers(tickers);

      return res.json({
        requestId,
        tickers,
        warnings: warnings.length > 0 ? warnings : undefined,
      });

    } catch (error) {
      logger.error('Holdings parsing error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Failed to parse CSV',
        requestId,
      });
    }
  }

  async methodology(req: Request, res: Response) {
    const requestId = uuidv4();
    const { filter } = req.params;

    try {
      const validFilters = ['bds', 'defense', 'surveillance', 'shariah'];
      if (!validFilters.includes(filter)) {
        return res.status(400).json({
          error: 'Invalid filter type',
          requestId,
        });
      }

      const methodology = this.getMethodology(filter);

      res.json({
        ...methodology,
        requestId,
      });

    } catch (error) {
      logger.error('Methodology error', {
        requestId,
        filter,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId,
      });
    }
  }

  async sources(req: Request, res: Response) {
    const requestId = uuidv4();
    const { auditId } = req.params;

    try {
      // This would typically fetch from the database
      // For now, return mock data
      const sources = await this.getSourcesForAudit(auditId);

      res.json({
        auditId,
        sources,
        requestId,
      });

    } catch (error) {
      logger.error('Sources error', {
        requestId,
        auditId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId,
      });
    }
  }

  async dispute(req: Request, res: Response) {
    const requestId = uuidv4();

    try {
      const { auditId, message, evidenceUrl } = req.body;

      if (!auditId || !message) {
        return res.status(400).json({
          error: 'Audit ID and message are required',
          requestId,
        });
      }

      if (message.length < 10 || message.length > 1000) {
        return res.status(400).json({
          error: 'Message must be between 10 and 1000 characters',
          requestId,
        });
      }

      // Create dispute record
      const disputeId = await this.createDispute(auditId, message, evidenceUrl);

      res.json({
        requestId,
        disputeId,
        status: 'OPEN',
      });

    } catch (error) {
      logger.error('Dispute creation error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId,
      });
    }
  }

  async version(req: Request, res: Response) {
    const requestId = uuidv4();

    try {
      const version = await this.getDataVersion();

      res.json({
        version,
        timestamp: new Date().toISOString(),
        requestId,
      });

    } catch (error) {
      logger.error('Version check error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId,
      });
    }
  }

  // Private helper methods
  private generateWarnings(symbols: string[], results: any[]): string[] {
    const warnings: string[] = [];
    
    if (results.length < symbols.length) {
      warnings.push(`${symbols.length - results.length} symbols not found in database`);
    }

    if (results.some(r => r.confidence === 'Low')) {
      warnings.push('Some results have low confidence due to insufficient data');
    }

    return warnings;
  }

  private parseCSV(csvContent: string, sanitize: boolean): string[] {
    const lines = csvContent.split('\n');
    const tickers: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Simple CSV parsing - in production, use a proper CSV parser
      const columns = trimmed.split(',').map(col => col.trim().replace(/"/g, ''));
      
      // Look for ticker-like patterns (uppercase letters, 1-5 characters)
      for (const column of columns) {
        if (/^[A-Z]{1,5}$/.test(column)) {
          tickers.push(column);
        }
      }
    }

    // Remove duplicates
    return Array.from(new Set(tickers));
  }

  private validateTickers(tickers: string[]): string[] {
    const warnings: string[] = [];

    if (tickers.length === 0) {
      warnings.push('No valid tickers found in CSV');
    }

    if (tickers.length > 1000) {
      warnings.push('Large number of tickers detected - consider batching');
    }

    return warnings;
  }

  private getMethodology(filter: string) {
    const methodologies = {
      bds: {
        filter: 'bds',
        version: '1.0',
        description: 'Boycott, Divestment, and Sanctions (BDS) screening based on occupation links, settlement activity, and supply chain ties.',
        thresholds: {
          evidenceStrength: ['MEDIUM', 'HIGH'],
          reviewThreshold: 'LOW',
        },
        rules: [
          {
            id: 'BDS_001',
            code: 'AFSC_OCCUPATION',
            description: 'American Friends Service Committee occupation links',
            active: true,
          },
          {
            id: 'BDS_002',
            code: 'WHO_PROFITS',
            description: 'Who Profits settlement activity',
            active: true,
          },
        ],
      },
      defense: {
        filter: 'defense',
        version: '1.0',
        description: 'Defense contractor screening based on SIPRI arms rankings and DoD contracts.',
        thresholds: {
          sipriRankThreshold: 100,
          dodContractThreshold: 10000000, // $10M
          reviewThreshold: 1000000, // $1M
        },
        rules: [
          {
            id: 'DEF_001',
            code: 'SIPRI_TOP_100',
            description: 'SIPRI Top-100 arms producers',
            active: true,
          },
          {
            id: 'DEF_002',
            code: 'DOD_CONTRACTS',
            description: 'Major DoD contracts (>$10M)',
            active: true,
          },
        ],
      },
      surveillance: {
        filter: 'surveillance',
        version: '1.0',
        description: 'Surveillance technology screening based on EFF Atlas and Privacy International data.',
        thresholds: {
          invasiveTypes: ['facial_recognition', 'spyware', 'phone_extraction'],
          reviewTypes: ['ALPR', 'data_brokerage'],
        },
        rules: [
          {
            id: 'SURV_001',
            code: 'EFF_ATLAS',
            description: 'EFF Atlas of Surveillance',
            active: true,
          },
          {
            id: 'SURV_002',
            code: 'PRIVACY_INTL',
            description: 'Privacy International Surveillance Industry Index',
            active: true,
          },
        ],
      },
      shariah: {
        filter: 'shariah',
        version: '1.0',
        description: 'Shariah compliance screening based on AAOIFI standards.',
        thresholds: {
          debtRatio: 0.33, // 33%
          cashRatio: 0.33, // 33%
          receivablesRatio: 0.49, // 49%
          haramRevenueThreshold: 0.05, // 5%
        },
        rules: [
          {
            id: 'SHAR_001',
            code: 'AAOIFI_BUSINESS',
            description: 'AAOIFI business screen',
            active: true,
          },
          {
            id: 'SHAR_002',
            code: 'AAOIFI_FINANCIAL',
            description: 'AAOIFI financial ratios',
            active: true,
          },
        ],
      },
    };

    return methodologies[filter as keyof typeof methodologies];
  }

  private async getSourcesForAudit(auditId: string) {
    // Mock implementation - would fetch from database
    return [
      {
        label: 'EFF Atlas of Surveillance',
        url: 'https://atlasofsurveillance.org',
        snapshotHash: 'abc123',
        crawlTimestamp: '2025-08-14T10:00:00Z',
        datasetRows: [{ company: 'Example Corp', technology: 'facial_recognition' }],
      },
    ];
  }

  private async createDispute(auditId: string, message: string, evidenceUrl?: string) {
    // Mock implementation - would create in database
    return `disp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getDataVersion(): Promise<string> {
    // Mock implementation - would fetch from settings table
    return '2025-08-14-v1.0';
  }
}
