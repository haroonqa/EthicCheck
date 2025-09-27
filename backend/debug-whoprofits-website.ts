import axios from 'axios';
import * as cheerio from 'cheerio';

async function debugWhoProfitsWebsite() {
  try {
    console.log('🔍 Debugging Who Profits website structure...\n');
    
    const url = 'https://whoprofits.org/companies';
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    console.log(`📄 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    
    console.log('✅ Page loaded successfully\n');
    
    // Look for company-related elements
    console.log('🔍 Searching for company elements...\n');
    
    // Check for common company selectors
    const selectors = [
      '.company-item', '.company-card', '.company-listing', '.company-row',
      'article.company', '.company-profile', '.company-entry',
      '.company', '.corporation', '.business', '.firm'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
      }
    }
    
    // Look for links that might contain company names
    console.log('\n🔍 Searching for company links...\n');
    
    const companyLinks = $('a[href*="/company/"], a[href*="/companies/"], a[href*="/corporation/"]');
    console.log(`Found ${companyLinks.length} potential company links`);
    
    if (companyLinks.length > 0) {
      console.log('\n📋 Sample company links:');
      companyLinks.slice(0, 10).each((index, element) => {
        const link = $(element);
        const href = link.attr('href');
        const text = link.text().trim();
        console.log(`${index + 1}. Text: "${text}" | Href: ${href}`);
      });
    }
    
    // Look for any text that might be company names
    console.log('\n🔍 Searching for potential company names...\n');
    
    // Look for headings that might contain company names
    const headings = $('h1, h2, h3, h4, h5, h6');
    console.log(`Found ${headings.length} headings`);
    
    if (headings.length > 0) {
      console.log('\n📋 Sample headings:');
      headings.slice(0, 10).each((index, element) => {
        const heading = $(element);
        const text = heading.text().trim();
        if (text.length > 0 && text.length < 100) {
          console.log(`${index + 1}. ${text}`);
        }
      });
    }
    
    // Look for strong/bold text that might be company names
    const strongText = $('strong, b');
    console.log(`\nFound ${strongText.length} strong/bold elements`);
    
    if (strongText.length > 0) {
      console.log('\n📋 Sample strong text:');
      strongText.slice(0, 10).each((index, element) => {
        const strong = $(element);
        const text = strong.text().trim();
        if (text.length > 0 && text.length < 100) {
          console.log(`${index + 1}. ${text}`);
        }
      });
    }
    
    // Look for any divs with company-like content
    console.log('\n🔍 Searching for divs with company content...\n');
    
    const divs = $('div');
    let companyDivs = 0;
    
    divs.each((index, element) => {
      const div = $(element);
      const text = div.text().trim();
      const hasCompanyKeywords = text.includes('Corporation') || 
                                text.includes('Inc.') || 
                                text.includes('Ltd.') || 
                                text.includes('Company') ||
                                text.includes('Group') ||
                                text.includes('International');
      
      if (hasCompanyKeywords && text.length < 200) {
        companyDivs++;
        if (companyDivs <= 5) {
          console.log(`${companyDivs}. ${text.substring(0, 150)}...`);
        }
      }
    });
    
    console.log(`\nFound ${companyDivs} divs with potential company content`);
    
    // Show page title and meta info
    console.log('\n📄 Page Information:');
    console.log(`Title: ${$('title').text()}`);
    console.log(`Meta Description: ${$('meta[name="description"]').attr('content') || 'Not found'}`);
    
    console.log('\n🎯 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugWhoProfitsWebsite().catch(console.error);
