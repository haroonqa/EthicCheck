import { CompanyImporter } from './src/services/company-importer';

async function importCompanies() {
  const importer = new CompanyImporter();
  
  try {
    console.log('🚀 Starting Company Import...\n');
    
    const result = await importer.importSP500();
    
    console.log('\n🎯 Import Complete!');
    console.log(`✅ Added: ${result.added} companies`);
    console.log(`⏭️  Skipped (existing): ${result.existing} companies`);
    console.log(`❌ Errors: ${result.errors} companies`);
    
    if (result.added > 0) {
      console.log(`\n🎉 Successfully imported ${result.added} new companies!`);
      console.log('💡 You can now search for companies like MSFT, GOOGL, TSLA, etc.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await importer.disconnect();
  }
}

// Run the import
importCompanies().catch(console.error);
