import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { DataTransformer } from './src/services/data-transformer';

async function testDataTransformation() {
  console.log('🧪 Testing Data Transformation Pipeline...');
  
  try {
    // Step 1: Scrape AFSC data
    console.log('\n📡 Step 1: Scraping AFSC data...');
    const scraper = new AFSCScraper();
    const scrapedData = await scraper.scrapeCompanies(1); // Just 1 page for testing
    
    console.log(`✅ Scraped ${scrapedData.companies.length} companies`);
    
    // Step 2: Transform data
    console.log('\n🔄 Step 2: Transforming data...');
    const transformer = new DataTransformer();
    const transformedData = transformer.transformAFSCData(scrapedData.companies);
    
    console.log(`✅ Transformed ${transformedData.companies.length} companies`);
    console.log(`✅ Created ${transformedData.evidence.length} evidence items`);
    console.log(`✅ Created ${transformedData.sources.length} sources`);
    
    // Step 3: Show sample transformed data
    console.log('\n📊 Sample Transformed Data:');
    
    console.log('\n🏢 Sample Companies:');
    transformedData.companies.slice(0, 3).forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   Country: ${company.country || 'Unknown'}`);
      console.log(`   Tags: ${company.tags.join(', ')}`);
      console.log(`   Evidence: ${company.evidence.length} items`);
      
      company.evidence.forEach((evidence, evIndex) => {
        console.log(`     ${evIndex + 1}. ${evidence.tagName} - ${evidence.strength} strength`);
        console.log(`        Notes: ${evidence.notes.substring(0, 100)}...`);
      });
    });
    
    console.log('\n📚 Sample Evidence:');
    transformedData.evidence.slice(0, 5).forEach((evidence, index) => {
      console.log(`${index + 1}. ${evidence.tagName} - ${evidence.strength} strength`);
    });
    
    console.log('\n🎯 Transformation Pipeline Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing transformation pipeline:', error);
  }
}

// Run the test
testDataTransformation();
