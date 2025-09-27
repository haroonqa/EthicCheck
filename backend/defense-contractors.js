// Comprehensive Defense Contractor Database
// Based on DoD contractor lists, SIPRI Top 100, and major defense companies

const DEFENSE_CONTRACTORS = [
  // Top Defense Contractors (SIPRI Top 20)
  { name: "Lockheed Martin Corporation", ticker: "LMT", category: "major_contractor" },
  { name: "Raytheon Technologies Corporation", ticker: "RTX", category: "major_contractor" },
  { name: "Boeing Company", ticker: "BA", category: "major_contractor" },
  { name: "Northrop Grumman Corporation", ticker: "NOC", category: "major_contractor" },
  { name: "General Dynamics Corporation", ticker: "GD", category: "major_contractor" },
  { name: "BAE Systems plc", ticker: "BAESY", category: "major_contractor" },
  { name: "Airbus SE", ticker: "EADSY", category: "major_contractor" },
  { name: "Leonardo S.p.A.", ticker: "LDO", category: "major_contractor" },
  { name: "Thales S.A.", ticker: "THLEF", category: "major_contractor" },
  { name: "L3Harris Technologies Inc", ticker: "LHX", category: "major_contractor" },
  { name: "Huntington Ingalls Industries Inc", ticker: "HII", category: "major_contractor" },
  { name: "Textron Inc", ticker: "TXT", category: "major_contractor" },
  { name: "Rolls-Royce Holdings plc", ticker: "RYCEY", category: "major_contractor" },
  { name: "Safran S.A.", ticker: "SAFRY", category: "major_contractor" },
  { name: "Kongsberg Gruppen ASA", ticker: "KOG", category: "major_contractor" },
  { name: "Saab AB", ticker: "SAABF", category: "major_contractor" },
  { name: "Elbit Systems Ltd", ticker: "ESLT", category: "major_contractor" },
  { name: "Israel Aerospace Industries Ltd", ticker: "IAI", category: "major_contractor" },
  { name: "Rheinmetall AG", ticker: "RHM", category: "major_contractor" },
  { name: "Hensoldt AG", ticker: "HAG", category: "major_contractor" },

  // Major US Defense Contractors
  { name: "General Electric Company", ticker: "GE", category: "defense_systems" },
  { name: "Honeywell International Inc", ticker: "HON", category: "defense_systems" },
  { name: "United Technologies Corporation", ticker: "UTX", category: "defense_systems" },
  { name: "Caterpillar Inc", ticker: "CAT", category: "defense_systems" },
  { name: "3M Company", ticker: "MMM", category: "defense_systems" },
  { name: "Johnson Controls International plc", ticker: "JCI", category: "defense_systems" },
  { name: "Parker-Hannifin Corporation", ticker: "PH", category: "defense_systems" },
  { name: "Eaton Corporation plc", ticker: "ETN", category: "defense_systems" },
  { name: "Emerson Electric Co", ticker: "EMR", category: "defense_systems" },
  { name: "Rockwell Automation Inc", ticker: "ROK", category: "defense_systems" },

  // Cybersecurity & Intelligence
  { name: "Palo Alto Networks Inc", ticker: "PANW", category: "cybersecurity" },
  { name: "CrowdStrike Holdings Inc", ticker: "CRWD", category: "cybersecurity" },
  { name: "Fortinet Inc", ticker: "FTNT", category: "cybersecurity" },
  { name: "Zscaler Inc", ticker: "ZS", category: "cybersecurity" },
  { name: "Okta Inc", ticker: "OKTA", category: "cybersecurity" },
  { name: "CyberArk Software Ltd", ticker: "CYBR", category: "cybersecurity" },
  { name: "Splunk Inc", ticker: "SPLK", category: "cybersecurity" },
  { name: "Rapid7 Inc", ticker: "RPD", category: "cybersecurity" },
  { name: "Tenable Holdings Inc", ticker: "TENB", category: "cybersecurity" },
  { name: "Qualys Inc", ticker: "QLYS", category: "cybersecurity" },

  // Satellite & Space Defense
  { name: "Maxar Technologies Inc", ticker: "MAXR", category: "space_defense" },
  { name: "Iridium Communications Inc", ticker: "IRDM", category: "space_defense" },
  { name: "ViaSat Inc", ticker: "VSAT", category: "space_defense" },
  { name: "EchoStar Corporation", ticker: "SATS", category: "space_defense" },
  { name: "Globalstar Inc", ticker: "GSAT", category: "space_defense" },

  // Military Vehicles & Equipment
  { name: "Oshkosh Corporation", ticker: "OSK", category: "military_vehicles" },
  { name: "Navistar International Corporation", ticker: "NAV", category: "military_vehicles" },
  { name: "PACCAR Inc", ticker: "PCAR", category: "military_vehicles" },
  { name: "Cummins Inc", ticker: "CMI", category: "military_vehicles" },
  { name: "Allison Transmission Holdings Inc", ticker: "ALSN", category: "military_vehicles" },

  // Defense Electronics & Communications
  { name: "Keysight Technologies Inc", ticker: "KEYS", category: "defense_electronics" },
  { name: "Teledyne Technologies Incorporated", ticker: "TDY", category: "defense_electronics" },
  { name: "FLIR Systems Inc", ticker: "FLIR", category: "defense_electronics" },
  { name: "Curtiss-Wright Corporation", ticker: "CW", category: "defense_electronics" },
  { name: "Kratos Defense & Security Solutions Inc", ticker: "KTOS", category: "defense_electronics" },

  // Private Military Contractors
  { name: "AECOM", ticker: "ACM", category: "private_military" },
  { name: "Jacobs Engineering Group Inc", ticker: "J", category: "private_military" },
  { name: "Fluor Corporation", ticker: "FLR", category: "private_military" },
  { name: "KBR Inc", ticker: "KBR", category: "private_military" },
  { name: "Leidos Holdings Inc", ticker: "LDOS", category: "private_military" },

  // Defense Software & IT
  { name: "CACI International Inc", ticker: "CACI", category: "defense_it" },
  { name: "ManTech International Corporation", ticker: "MANT", category: "defense_it" },
  { name: "Science Applications International Corporation", ticker: "SAIC", category: "defense_it" },
  { name: "Booz Allen Hamilton Holding Corporation", ticker: "BAH", category: "defense_it" },
  { name: "Parsons Corporation", ticker: "PSN", category: "defense_it" }
];

// Defense contractor detection function
function isDefenseContractor(companyName, ticker) {
  const normalizedName = companyName.toLowerCase();
  const normalizedTicker = ticker?.toLowerCase();
  
  // Check against our database
  return DEFENSE_CONTRACTORS.some(contractor => {
    const nameMatch = normalizedName.includes(contractor.name.toLowerCase()) ||
                     contractor.name.toLowerCase().includes(normalizedName);
    const tickerMatch = normalizedTicker && contractor.ticker.toLowerCase() === normalizedTicker;
    
    return nameMatch || tickerMatch;
  });
}

// Get defense contractor category
function getDefenseCategory(companyName, ticker) {
  const contractor = DEFENSE_CONTRACTORS.find(c => {
    const normalizedName = companyName.toLowerCase();
    const normalizedTicker = ticker?.toLowerCase();
    
    const nameMatch = normalizedName.includes(c.name.toLowerCase()) ||
                     c.name.toLowerCase().includes(normalizedName);
    const tickerMatch = normalizedTicker && c.ticker.toLowerCase() === normalizedTicker;
    
    return nameMatch || tickerMatch;
  });
  
  return contractor?.category || 'unknown';
}

// Get defense contractor evidence
function getDefenseEvidence(companyName, ticker) {
  const category = getDefenseCategory(companyName, ticker);
  
  const evidenceMap = {
    major_contractor: "Major defense contractor - Top 20 global arms producer",
    defense_systems: "Defense systems and military equipment manufacturer",
    cybersecurity: "Cybersecurity and defense technology provider",
    space_defense: "Satellite and space defense contractor",
    military_vehicles: "Military vehicles and defense transportation",
    defense_electronics: "Defense electronics and communications systems",
    private_military: "Private military contractor and defense services",
    defense_it: "Defense IT and intelligence systems contractor",
    unknown: "Defense contractor (category unknown)"
  };
  
  return evidenceMap[category] || "Defense contractor";
}

module.exports = {
  DEFENSE_CONTRACTORS,
  isDefenseContractor,
  getDefenseCategory,
  getDefenseEvidence
};



