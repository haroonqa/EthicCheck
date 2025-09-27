import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { DataTransformer } from './src/services/data-transformer';
import { DatabaseLoader } from './src/services/database-loader';

async function testCompletePipeline() {
  console.log('🧪 Testing Complete BDS Data Pipeline...');
  console.log('📡 Scraping → 🔄 Transformation → 💾 Database Loading');
  
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
    console.log(`✅ Created evidence for ${transformedData.companyEvidenceMap.size} companies`);
    console.log(`✅ Created ${transformedData.sources.length} sources`);
    
    // Step 3: Load into database
    console.log('\n💾 Step 3: Loading into database...');
    const loader = new DatabaseLoader();
    const loadResult = await loader.loadBDSData(
      transformedData.companies,
      transformedData.sources,
      transformedData.companyEvidenceMap
    );
    
    // Step 4: Show results
    console.log('\n📊 Pipeline Results:');
    console.log(`   Sources: ${loadResult.sourcesCreated}`);
    console.log(`   Companies: ${loadResult.companiesCreated} created, ${loadResult.companiesUpdated} updated`);
    console.log(`   Evidence: ${loadResult.evidenceCreated} created`);
    
    if (loadResult.errors.length > 0) {
      console.log(`   Errors: ${loadResult.errors.length}`);
      loadResult.errors.forEach(error => console.log(`     ❌ ${error}`));
    }
    
    console.log('\n🎯 Complete Pipeline Test Complete!');
    console.log('🚀 Your database now has fresh BDS data!');
    
    // Clean up
    await loader.disconnect();
    
  } catch (error) {
    console.error('❌ Error testing complete pipeline:', error);
  }
}

// Run the test
testCompletePipeline();
