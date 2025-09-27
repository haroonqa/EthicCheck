import { PrismaClient } from '@prisma/client';

async function findCompanyDuplicates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Finding Potential Company Duplicates');
    console.log('=====================================');
    
    // Find companies with similar names that might be duplicates
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: { evidence: true, aliases: true }
    });
    
    const potentialDuplicates: Array<{name: string, evidence: number, aliases: number}>[] = [];
    
    // Group companies by potential duplicates (similar names)
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        const company1 = companies[i];
        const company2 = companies[j];
        
        // Check for potential duplicates
        if (isPotentialDuplicate(company1.name, company2.name)) {
          potentialDuplicates.push([
            { name: company1.name, evidence: company1.evidence.length, aliases: company1.aliases.length },
            { name: company2.name, evidence: company2.evidence.length, aliases: company2.aliases.length }
          ]);
        }
      }
    }
    
    if (potentialDuplicates.length > 0) {
      console.log(`\n⚠️ Found ${potentialDuplicates.length} potential duplicate pairs:`);
      potentialDuplicates.forEach((pair, index) => {
        console.log(`\n${index + 1}. Potential Duplicate:`);
        console.log(`   A: ${pair[0].name} (${pair[0].evidence} evidence, ${pair[0].aliases} aliases)`);
        console.log(`   B: ${pair[1].name} (${pair[1].evidence} evidence, ${pair[1].aliases} aliases)`);
      });
      
      console.log(`\n💡 Recommendation: Review these pairs and merge if they're truly duplicates.`);
      console.log(`   This will prevent evidence display issues on the frontend.`);
    } else {
      console.log(`\n✅ No obvious duplicates found!`);
    }
    
    // Also check for companies with no aliases (potential lookup issues)
    const companiesWithoutAliases = companies.filter(c => c.aliases.length === 0);
    console.log(`\n📊 Companies without aliases: ${companiesWithoutAliases.length}`);
    
    if (companiesWithoutAliases.length > 0) {
      console.log(`\n💡 Consider adding aliases for better company lookup:`);
      companiesWithoutAliases.slice(0, 10).forEach(company => {
        console.log(`   - ${company.name} (${company.evidence.length} evidence)`);
      });
      
      if (companiesWithoutAliases.length > 10) {
        console.log(`   ... and ${companiesWithoutAliases.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error finding duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function isPotentialDuplicate(name1: string, name2: string): boolean {
  const clean1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check for exact match after cleaning
  if (clean1 === clean2) return true;
  
  // Check if one contains the other
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
  
  // Check for common abbreviations (e.g., "Corp" vs "Corporation")
  const corp1 = clean1.replace(/corp|corporation|inc|incorporated|llc|co|company/g, '');
  const corp2 = clean2.replace(/corp|corporation|inc|incorporated|llc|co|company/g, '');
  
  if (corp1 === corp2 && corp1.length > 3) return true;
  
  return false;
}

// Run search
if (require.main === module) {
  findCompanyDuplicates()
    .then(() => {
      console.log('\n🎯 Duplicate Search Complete!');
    })
    .catch(console.error);
}

