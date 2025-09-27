import axios from 'axios';

async function debugAFSCWebsite() {
  console.log('🔍 Debugging AFSC website structure...');
  
  try {
    const response = await axios.get('https://investigate.afsc.org/all-companies?page=1', {
      headers: { 
        'User-Agent': 'EthicCheck-BDS-Data-Collector/1.0 (contact@ethiccheck.com)' 
      },
      timeout: 10000,
    });

    console.log('✅ Successfully fetched AFSC page');
    console.log(`📄 Page length: ${response.data.length} characters`);
    
    const html = response.data;
    
    // Look for company-related patterns
    console.log('\n🔍 Searching for company patterns...');
    
    // Check for company names (look for patterns like "Company Name" or similar)
    const companyPatterns = [
      'class="company',
      'id="company',
      'data-company',
      'company-name',
      'company-title',
      'company-link'
    ];
    
    companyPatterns.forEach(pattern => {
      if (html.includes(pattern)) {
        console.log(`✅ Found pattern: ${pattern}`);
      }
    });
    
    // Look for specific company mentions
    const companyMentions = [
      'Coca-Cola',
      'McDonald',
      'HP',
      'Caterpillar',
      'Elbit'
    ];
    
    companyMentions.forEach(company => {
      if (html.includes(company)) {
        console.log(`✅ Found company mention: ${company}`);
      }
    });
    
    // Look for pagination patterns
    console.log('\n📄 Searching for pagination...');
    const paginationPatterns = [
      'page=',
      'pagination',
      'next',
      'previous',
      'page-numbers'
    ];
    
    paginationPatterns.forEach(pattern => {
      if (html.includes(pattern)) {
        console.log(`✅ Found pagination: ${pattern}`);
      }
    });
    
    // Look for content structure
    console.log('\n🏗️ Searching for content structure...');
    const structurePatterns = [
      '<article',
      '<section',
      '<div class="content"',
      '<div class="main"',
      '<div class="companies"',
      '<ul class="companies"',
      '<table class="companies"'
    ];
    
    structurePatterns.forEach(pattern => {
      if (html.includes(pattern)) {
        console.log(`✅ Found structure: ${pattern}`);
      }
    });
    
    // Show a larger section to see more structure
    console.log('\n📋 HTML section around "company" mentions:');
    const companyIndex = html.indexOf('company');
    if (companyIndex > -1) {
      const start = Math.max(0, companyIndex - 200);
      const end = Math.min(html.length, companyIndex + 800);
      console.log(html.substring(start, end));
    }
    
  } catch (error) {
    console.error('❌ Error debugging AFSC website:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
  }
}

// Run the debug
debugAFSCWebsite();
