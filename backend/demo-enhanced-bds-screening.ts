import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';
import { PACBIAcademicScraper } from './src/services/scrapers/pacbi-academic-scraper';

interface DemoCompany {
  name: string;
  ticker?: string | undefined;
  country?: string | undefined;
  source: string;
  bdsCategories: string[];
  evidence: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface BDSCategory {
  name: string;
  description: string;
  companies: DemoCompany[];
}

class EnhancedBDSScreeningDemo {
  private companies: DemoCompany[] = [];
  private bdsCategories: BDSCategory[] = [
    {
      name: 'economic_exploitation',
      description: 'Companies profiting from occupied territories',
      companies: []
    },
    {
      name: 'exploitation_occupied_resources',
      description: 'Companies exploiting natural resources from occupied areas',
      companies: []
    },
    {
      name: 'settlement_enterprise',
      description: 'Companies directly involved in settlement activities',
      companies: []
    },
    {
      name: 'israeli_construction_occupied_land',
      description: 'Companies involved in construction on occupied Palestinian land',
      companies: []
    },
    {
      name: 'services_to_settlements',
      description: 'Companies providing services to settlement communities',
      companies: []
    },
    {
      name: 'other_bds_activities',
      description: 'Other BDS-related activities not fitting above categories',
      companies: []
    }
  ];

  async collectData(): Promise<void> {
    console.log('🚀 Starting Enhanced BDS Data Collection Demo...\n');

    try {
      // Collect from AFSC
      console.log('🌐 Collecting from AFSC Investigate...');
      const afscScraper = new AFSCScraper();
      const afscResult = await afscScraper.scrapeCompanies(2);
      
      afscResult.companies.forEach(company => {
        this.companies.push({
          name: company.name,
          country: company.country,
          source: 'AFSC Investigate',
          bdsCategories: this.categorizeAFSCCompany(company),
          evidence: company.evidence,
          riskLevel: this.calculateRiskLevel(company.evidence.length, company.tags.length)
        });
      });

      console.log(`✅ AFSC: ${afscResult.companies.length} companies collected`);

      // Collect from Who Profits
      console.log('\n🏢 Collecting from Who Profits...');
      const whoProfitsScraper = new WhoProfitsScraper();
      const whoProfitsResult = await whoProfitsScraper.scrapeCompanies(2);
      
      whoProfitsResult.companies.forEach(company => {
        this.companies.push({
          name: company.name,
          ticker: company.ticker,
          country: company.country,
          source: 'Who Profits',
          bdsCategories: this.categorizeWhoProfitsCompany(company),
          evidence: [company.involvement || 'Company involved in BDS activities'],
          riskLevel: 'HIGH' // Who Profits companies are high risk
        });
      });

      console.log(`✅ Who Profits: ${whoProfitsResult.companies.length} companies collected`);

      // Collect from PACBI Academic
      console.log('\n🎓 Collecting from PACBI Academic...');
      const pacbiScraper = new PACBIAcademicScraper();
      const pacbiResult = await pacbiScraper.scrapeInstitutions(2);
      
      pacbiResult.institutions.forEach(institution => {
        this.companies.push({
          name: institution.name,
          country: institution.country,
          source: 'PACBI Academic Boycotts',
          bdsCategories: this.categorizePACBIInstitution(institution),
          evidence: institution.evidence,
          riskLevel: 'MEDIUM' // Academic boycotts are medium risk
        });
      });

      console.log(`✅ PACBI Academic: ${pacbiResult.institutions.length} institutions collected`);

      // Categorize all companies
      this.categorizeAllCompanies();

      console.log(`\n🎉 Data collection complete! Total: ${this.companies.length} companies/institutions`);

    } catch (error) {
      console.error('❌ Error collecting data:', error);
    }
  }

  private categorizeAFSCCompany(company: any): string[] {
    const categories: string[] = [];
    
    // Map AFSC tags to BDS categories
    if (company.tags.includes('Prisons')) {
      categories.push('services_to_settlements');
    }
    if (company.tags.includes('Occupations')) {
      categories.push('economic_exploitation');
    }
    if (company.tags.includes('Borders')) {
      categories.push('settlement_enterprise');
    }
    if (company.tags.includes('Construction')) {
      categories.push('israeli_construction_occupied_land');
    }
    
    if (categories.length === 0) {
      categories.push('other_bds_activities');
    }
    
    return categories;
  }

  private categorizeWhoProfitsCompany(company: any): string[] {
    const categories: string[] = [];
    
    // Map Who Profits categories to BDS categories
    if (company.category?.includes('construction')) {
      categories.push('israeli_construction_occupied_land');
    }
    if (company.category?.includes('banking')) {
      categories.push('services_to_settlements');
    }
    if (company.category?.includes('agriculture')) {
      categories.push('exploitation_occupied_resources');
    }
    
    if (categories.length === 0) {
      categories.push('economic_exploitation');
    }
    
    return categories;
  }

  private categorizePACBIInstitution(institution: any): string[] {
    const categories: string[] = [];
    
    // Map PACBI boycott types to BDS categories
    if (institution.boycottType === 'academic_boycott') {
      categories.push('other_bds_activities');
    } else if (institution.boycottType === 'financial_boycott') {
      categories.push('economic_exploitation');
    } else if (institution.boycottType === 'student_campaigns') {
      categories.push('other_bds_activities');
    }
    
    return categories;
  }

  private calculateRiskLevel(evidenceCount: number, tagCount: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (evidenceCount >= 3 || tagCount >= 3) return 'HIGH';
    if (evidenceCount >= 1 || tagCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  private categorizeAllCompanies(): void {
    this.companies.forEach(company => {
      company.bdsCategories.forEach(categoryName => {
        const category = this.bdsCategories.find(cat => cat.name === categoryName);
        if (category) {
          category.companies.push(company);
        }
      });
    });
  }

  displayResults(): void {
    console.log('\n🎯 Enhanced BDS Screening Results');
    console.log('=====================================\n');

    // Display by category
    this.bdsCategories.forEach(category => {
      console.log(`📋 ${category.name.toUpperCase().replace(/_/g, ' ')}`);
      console.log(`   Description: ${category.description}`);
      console.log(`   Companies: ${category.companies.length}`);
      
      if (category.companies.length > 0) {
        console.log('   Sample companies:');
        category.companies.slice(0, 5).forEach(company => {
          console.log(`     - ${company.name} (${company.country || 'Unknown'}) [${company.riskLevel} risk]`);
        });
        if (category.companies.length > 5) {
          console.log(`     ... and ${category.companies.length - 5} more`);
        }
      }
      console.log('');
    });

    // Display summary statistics
    console.log('📊 Summary Statistics');
    console.log('=====================');
    console.log(`Total companies/institutions: ${this.companies.length}`);
    console.log(`High risk: ${this.companies.filter(c => c.riskLevel === 'HIGH').length}`);
    console.log(`Medium risk: ${this.companies.filter(c => c.riskLevel === 'MEDIUM').length}`);
    console.log(`Low risk: ${this.companies.filter(c => c.riskLevel === 'LOW').length}`);
    
    console.log('\n🌐 Data Sources:');
    const sources = [...new Set(this.companies.map(c => c.source))];
    sources.forEach(source => {
      const count = this.companies.filter(c => c.source === source).length;
      console.log(`   ${source}: ${count} companies`);
    });

    console.log('\n🎉 Demo Complete! This shows your enhanced BDS screening system in action.');
    console.log('You can now build a frontend that filters companies by these 6 specific BDS categories.');
  }

  // Simulate screening a specific company
  screenCompany(companyName: string): void {
    const company = this.companies.find(c => 
      c.name.toLowerCase().includes(companyName.toLowerCase())
    );

    if (!company) {
      console.log(`❌ Company "${companyName}" not found in database`);
      return;
    }

    console.log(`\n🔍 Screening Results for: ${company.name}`);
    console.log('==========================================');
    console.log(`Country: ${company.country || 'Unknown'}`);
    console.log(`Source: ${company.source}`);
    console.log(`Risk Level: ${company.riskLevel}`);
    console.log(`BDS Categories: ${company.bdsCategories.join(', ')}`);
    console.log(`Evidence Items: ${company.evidence.length}`);
    
    if (company.evidence.length > 0) {
      console.log('\nEvidence:');
      company.evidence.forEach((evidence, index) => {
        console.log(`  ${index + 1}. ${evidence}`);
      });
    }
  }
}

// Run the demo
async function runDemo() {
  const demo = new EnhancedBDSScreeningDemo();
  await demo.collectData();
  demo.displayResults();
  
  // Demo some specific company screenings
  console.log('\n🧪 Sample Company Screenings:');
  console.log('==============================');
  demo.screenCompany('Microsoft');
  demo.screenCompany('Boeing');
  demo.screenCompany('Lockheed');
}

runDemo().catch(console.error);
