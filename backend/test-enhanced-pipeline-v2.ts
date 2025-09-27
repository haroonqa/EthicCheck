import { EnhancedBDSPipelineV2 } from './src/services/enhanced-bds-pipeline-v2';

async function testEnhancedPipeline() {
  console.log('🚀 Testing Enhanced BDS Pipeline V2');
  console.log('====================================\n');

  try {
    const pipeline = new EnhancedBDSPipelineV2();
    
    // Test individual sources first
    console.log('🧪 Testing Individual Source Pipelines...\n');
    
    const sources = ['afsc', 'whoprofits', 'pacbi', 'tradeunion', 'undatabase'];
    
    for (const source of sources) {
      console.log(`\n📡 Testing ${source.toUpperCase()} source...`);
      console.log('─'.repeat(50));
      
      try {
        const result = await pipeline.runSourceSpecificPipeline(source);
        
        console.log(`✅ ${source.toUpperCase()} pipeline completed successfully!`);
        console.log(`   Companies scraped: ${result.totalCompaniesScraped}`);
        console.log(`   Companies transformed: ${result.totalCompaniesTransformed}`);
        console.log(`   Evidence items: ${result.totalEvidence}`);
        console.log(`   Processing time: ${(result.processingTime / 1000).toFixed(2)}s`);
        
        if (result.errors.length > 0) {
          console.log(`   ⚠️  Errors: ${result.errors.length}`);
          result.errors.forEach(error => console.log(`      - ${error}`));
        }
        
      } catch (error) {
        console.log(`❌ ${source.toUpperCase()} pipeline failed: ${error}`);
      }
      
      // Wait between tests to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n\n🎯 Testing Full Pipeline (Limited Pages)...');
    console.log('=============================================\n');
    
    // Test full pipeline with limited pages to avoid overwhelming servers
    const fullPipelineResult = await pipeline.runFullPipeline();
    
    console.log('\n📊 Full Pipeline Results Summary:');
    console.log('==================================');
    console.log(`🏢 Total Companies Scraped: ${fullPipelineResult.totalCompaniesScraped}`);
    console.log(`🔄 Total Companies Transformed: ${fullPipelineResult.totalCompaniesTransformed}`);
    console.log(`📝 Total Evidence Items: ${fullPipelineResult.totalEvidence}`);
    console.log(`🌐 Sources Used: ${fullPipelineResult.sourcesUsed.join(', ')}`);
    console.log(`💾 Database: ${fullPipelineResult.companiesAdded} added, ${fullPipelineResult.companiesUpdated} updated`);
    console.log(`⏱️  Total Processing Time: ${(fullPipelineResult.processingTime / 1000).toFixed(2)} seconds`);
    
    if (fullPipelineResult.errors.length > 0) {
      console.log(`\n❌ Errors Encountered: ${fullPipelineResult.errors.length}`);
      fullPipelineResult.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎉 Enhanced BDS Pipeline V2 Test Complete!');
    console.log('============================================');
    
    // Performance analysis
    const avgTimePerSource = fullPipelineResult.processingTime / fullPipelineResult.sourcesUsed.length;
    console.log(`📈 Performance Metrics:`);
    console.log(`   Average time per source: ${(avgTimePerSource / 1000).toFixed(2)}s`);
    console.log(`   Companies per second: ${(fullPipelineResult.totalCompaniesTransformed / (fullPipelineResult.processingTime / 1000)).toFixed(2)}`);
    console.log(`   Evidence per second: ${(fullPipelineResult.totalEvidence / (fullPipelineResult.processingTime / 1000)).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test specific source if command line argument provided
async function testSpecificSource() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const source = args[0].toLowerCase();
    console.log(`🧪 Testing specific source: ${source.toUpperCase()}`);
    console.log('=============================================\n');
    
    try {
      const pipeline = new EnhancedBDSPipelineV2();
      const result = await pipeline.runSourceSpecificPipeline(source);
      
      console.log(`\n📊 ${source.toUpperCase()} Pipeline Results:`);
      console.log('=====================================');
      console.log(`Companies scraped: ${result.totalCompaniesScraped}`);
      console.log(`Companies transformed: ${result.totalCompaniesTransformed}`);
      console.log(`Evidence items: ${result.totalEvidence}`);
      console.log(`Processing time: ${(result.processingTime / 1000).toFixed(2)}s`);
      console.log(`Sources used: ${result.sourcesUsed.join(', ')}`);
      
      if (result.errors.length > 0) {
        console.log(`\nErrors: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`- ${error}`));
      }
      
    } catch (error) {
      console.error(`❌ ${source.toUpperCase()} pipeline test failed:`, error);
    }
  } else {
    // Run full test
    await testEnhancedPipeline();
  }
}

testSpecificSource();

