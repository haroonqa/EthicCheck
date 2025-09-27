import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info, Shield, Eye, BadgeCheck, Loader2 } from "lucide-react";
import { api, convertApiResponse, type ScreeningRequest } from "../services/api";

// --- Enhanced Color System ---
const colors = {
  // Status Colors
  green: "#10b981",    // Success/Clean - more professional green
  yellow: "#f59e0b",   // Warning/Flagged - better contrast
  red: "#ef4444",      // Error/Blacklisted - keep same
  blue: "#3b82f6",     // Info/Links - add blue for info
  
  // Background Colors
  bgPrimary: "#0f172a",    // Dark background
  bgSecondary: "#1e293b",  // Card backgrounds
  bgTertiary: "#334155",   // Subtle backgrounds
  
  // Text Colors
  textPrimary: "#f8fafc",   // Main text
  textSecondary: "#94a3b8", // Secondary text
  textMuted: "#64748b",     // Muted text
  
  // Border Colors
  border: "#334155",        // Default borders
  borderLight: "#475569",   // Light borders
  borderDark: "#1e293b",    // Dark borders
};

export default function EthicCheckLanding() {
  return <App />;
}

function App() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-white/10" style={{ backgroundColor: colors.bgPrimary }}>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <WaitlistSection />
        <ScreeningPanel />
        <HowItWorks />
        <DataSources />
      </main>
      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-sm" style={{ 
      borderBottom: `1px solid ${colors.border}`, 
      backgroundColor: `${colors.bgSecondary}80` 
    }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="font-semibold tracking-tight" style={{ color: colors.textPrimary }}>EthicCheck</div>
          <span className="ml-3 rounded-full px-2 py-0.5 text-xs" style={{ 
            border: `1px solid ${colors.border}`, 
            color: colors.textMuted,
            backgroundColor: colors.bgTertiary
          }}>MVP</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm" style={{ color: colors.textSecondary }}>
          <a href="#how" className="hover:opacity-80 transition-opacity" style={{ color: colors.textSecondary }}>How it works</a>
          <a href="#sources" className="hover:opacity-80 transition-opacity" style={{ color: colors.textSecondary }}>Data sources</a>
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="h-8 w-8 grid place-items-center rounded-xl shadow-sm" style={{ 
      background: `linear-gradient(135deg, ${colors.blue}20, ${colors.green}20)`,
      border: `1px solid ${colors.border}`
    }}>
      <span className="text-lg leading-none" style={{ color: colors.green }}>✓</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="mt-12 mb-12">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Screen your portfolio <span style={{ color: colors.textSecondary }}>for ethics</span> — in seconds.
          </h1>
          <p className="mt-6 text-lg max-w-prose leading-relaxed" style={{ color: colors.textSecondary }}>
            Paste your tickers to check for <span style={{ color: colors.textPrimary, fontWeight: '600' }}>BDS violations</span>,
            <span style={{ color: colors.textPrimary, fontWeight: '600' }}> defense contractors</span>, and <span style={{ color: colors.textPrimary, fontWeight: '600' }}>Shariah compliance</span>.
            Transparent sources. No ESG smoke.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge label="Free" />
            <Badge label="No signup" />
            <Badge icon={<Shield className="h-3.5 w-3.5"/>} label="Transparent sources" />
            <Badge icon={<Eye className="h-3.5 w-3.5"/>} label="No tracking" />
          </div>
        </div>
        <HeroStatCard />
      </div>
    </section>
  );
}

function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textPrimary }}>
          Get Early Access
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
          Be the first to know when EthicCheck launches. Join our waitlist for exclusive early access and updates.
        </p>
        
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary
                }}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: status === 'success' ? colors.green : colors.blue,
                  color: 'white',
                  border: 'none'
                }}
              >
                {status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  'Join Waitlist'
                )}
              </button>
            </div>
            
            {message && (
              <div 
                className={`text-sm p-3 rounded-lg ${
                  status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
                style={{ 
                  backgroundColor: status === 'success' ? `${colors.green}20` : `${colors.red}20`,
                  border: `1px solid ${status === 'success' ? colors.green : colors.red}40`
                }}
              >
                {message}
              </div>
            )}
          </form>
          
          <p className="text-xs mt-4" style={{ color: colors.textMuted }}>
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage('');

    try {
      // For now, just show a message that login will be available later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Login will be available when we launch! Join our waitlist to be notified.');
      setTimeout(() => {
        onClose();
        setEmail('');
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ 
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.border}`
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            Save Search
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            To save your searches and access them later, you'll need an account. 
            Account creation will be available when we launch!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Email (for waitlist)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: colors.bgTertiary,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.blue,
              color: 'white',
              border: 'none'
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              'Join Waitlist for Early Access'
            )}
          </button>
        </form>

        {message && (
          <div 
            className={`text-sm p-3 rounded-lg mt-4 ${
              message.includes('launch') ? 'text-green-400' : 'text-red-400'
            }`}
            style={{ 
              backgroundColor: message.includes('launch') ? `${colors.green}20` : `${colors.red}20`,
              border: `1px solid ${message.includes('launch') ? colors.green : colors.red}40`
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, icon }: {label: string; icon?: any}){
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm" style={{ 
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bgSecondary,
      color: colors.textSecondary
    }}>
      {icon}
      {label}
    </span>
  );
}

function HeroStatCard() {
  return (
    <div className="rounded-2xl p-6 shadow-lg" style={{ 
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bgSecondary
    }}>
      <div className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>Live verdict colors</div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Legend color={colors.green} label="Clean" Icon={CheckCircle2} />
        <Legend color={colors.yellow} label="Flagged" Icon={AlertTriangle} />
        <Legend color={colors.red} label="Blacklisted" Icon={XCircle} />
      </div>
      <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${colors.border}, transparent)` }}/>
      <div className="mt-4 text-xs" style={{ color: colors.textMuted }}>AAOIFI/industry rules for Shariah, SIPRI/EFF/AFSC for other categories.</div>
    </div>
  );
}

function Legend({ color, label, Icon }: { color: string; label: string; Icon: any }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" style={{ color }} />
      <span style={{ color: colors.textPrimary }}>{label}</span>
    </div>
  );
}

function ScreeningPanel() {
  const [tickers, setTickers] = useState("");
  const [toggles, setToggles] = useState({ 
    bds: { enabled: true, categories: undefined }, 
    defense: false, 
    shariah: false 
  });
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      await api.checkHealth();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('Backend health check failed:', error);
    }
  }

  function toggleRow(index: number) {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  }

  async function runDemo() {
    if (!tickers.trim()) {
      setError("Please enter some ticker symbols first!");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      // Parse tickers from input
      const symbols = tickers
        .split(/[,\n]/)
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);

      if (symbols.length === 0) {
        setError("Please enter valid ticker symbols!");
        return;
      }

      // Prepare API request
      const request: ScreeningRequest = {
        symbols,
        filters: {
          bds: toggles.bds,
          defense: toggles.defense,
          shariah: toggles.shariah
        }
      };

      // Call the real API
      const response = await api.runScreening(request);
      
      // Convert API response to frontend format
      const convertedResults = convertApiResponse(response);
      setResults(convertedResults);
      
    } catch (error) {
      console.error("Screening failed:", error);
      setError(`Screening failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="my-12">
      <div className="rounded-2xl p-6 shadow-lg" style={{ 
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bgSecondary
      }}>
        {/* Backend Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>Backend Status</div>
          <div className="flex items-center gap-2">
            {backendStatus === 'checking' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.yellow }}>
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking...
              </div>
            )}
            {backendStatus === 'connected' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.green }}>
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </div>
            )}
            {backendStatus === 'disconnected' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs" style={{ color: colors.red }}>
                  <XCircle className="h-3 w-3" />
                  Disconnected
                </div>
                <button
                  onClick={checkBackendHealth}
                  className="text-xs underline hover:opacity-80 transition-opacity"
                  style={{ color: colors.blue }}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 1) Input Row */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>Paste tickers (comma or newline‑separated)</label>
            <textarea
              placeholder="e.g., AAPL, MSFT, VOO&#10;TSLA&#10;VTI"
              className="mt-3 h-32 w-full resize-none rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 placeholder:text-slate-500"
              style={{ 
                backgroundColor: colors.bgTertiary,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary
              }}
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
            />
          </div>

          {/* 2) Filters */}
          <div>
            <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>Filters</div>
            <div className="mt-3 space-y-3">
              <ToggleRow
                label="BDS Violations"
                sub="Occupation links, settlement activity, supply chain ties"
                value={toggles.bds.enabled}
                onChange={() => setToggles(t => ({ ...t, bds: { ...t.bds, enabled: !t.bds.enabled } }))}
              />
              <ToggleRow
                label="Defense Contractors"
                sub="SIPRI arms producers, recent DoD awards"
                value={toggles.defense}
                onChange={() => setToggles(t => ({ ...t, defense: !t.defense }))}
              />
              <ToggleRow
                label="Shariah Compliance"
                sub="AAOIFI rules: business screens + financial ratios"
                value={toggles.shariah}
                onChange={() => setToggles(t => ({ ...t, shariah: !t.shariah }))}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={runDemo}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: colors.green,
              color: 'white'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Running Check...
              </>
            ) : (
              "Run Ethical Check"
            )}
          </button>
          <div className="text-xs flex items-center gap-2" style={{ color: colors.textMuted }}>
            <Info className="h-4 w-4" />
            <span>We link to public sources for every verdict.</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 rounded-xl" style={{ 
            backgroundColor: `${colors.red}10`,
            border: `1px solid ${colors.red}30`
          }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.red }}>
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {/* 3) Results Preview */}
        <div className="mt-8">
          <div className="mb-4 text-sm font-medium" style={{ color: colors.textSecondary }}>Results preview</div>
          <div className="overflow-x-auto rounded-xl" style={{ 
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bgTertiary
          }}>
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Ticker</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Company</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>BDS</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Defense</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Shariah</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Final</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Evidence</th>
                  <th className="py-3 px-4 font-medium" style={{ color: colors.textSecondary }}>Sources</th>
                </tr>
              </thead>
              <tbody>
                {(results ?? []).map((r, i) => (
                  <tr key={i} className="hover:opacity-90 transition-opacity" style={{ borderBottom: `1px solid ${colors.borderDark}` }}>
                    <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>{r.ticker}</td>
                    <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{r.name}</td>
                    <td className="py-3 px-4"><StatusPill value={r.bds} /></td>
                    <td className="py-3 px-4"><StatusPill value={r.defense} /></td>
                    <td className="py-3 px-4"><StatusPill value={r.shariah} typeOverride labelOverride={r.shariah === 'fail' ? 'Non‑compliant' : r.shariah === 'review' ? 'Review' : undefined} /></td>
                    <td className="py-3 px-4"><FinalVerdict value={r.verdict} /></td>
                    <td className="py-3 px-4">
                      <ExpandableEvidenceCell 
                        company={r} 
                        filters={toggles}
                        isExpanded={expandedRows.includes(i)}
                        onToggle={() => toggleRow(i)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {r.sources.map((s: any, idx: number) => (
                          <a key={idx} href={s.url} className="rounded-md px-2 py-1 text-xs hover:opacity-80 transition-opacity" style={{ 
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.bgSecondary,
                            color: colors.textSecondary
                          }}>
                            {s.label}
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!results && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center" style={{ color: colors.textMuted }}>
                      Paste a few symbols and click <span style={{ color: colors.textPrimary, fontWeight: '600' }}>Run Ethical Check</span> to see a live preview here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Save Search Button */}
          {results && results.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: colors.bgSecondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              >
                Save Search
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </section>
  );
}

function statusMeta(value: "clean" | "flag" | "block" | "review") {
  switch (value) {
    case "clean":
      return { label: "Clean", color: colors.green, Icon: CheckCircle2 };
    case "flag":
      return { label: "Flagged", color: colors.yellow, Icon: AlertTriangle };
    case "block":
      return { label: "Blacklisted", color: colors.red, Icon: XCircle };
    case "review":
    default:
      return { label: "Review", color: "#a3a3a3", Icon: Info };
  }
}

function StatusPill({ value, typeOverride, labelOverride }: { value: any; typeOverride?: any; labelOverride?: string }) {
  // Handle both old format (string) and new format (object with overall property)
  let statusValue = typeof value === 'object' && value.overall ? value.overall : value;
  
  // Map backend values to frontend values
  if (statusValue === 'pass') {
    statusValue = 'clean';
  } else if (statusValue === 'excluded') {
    statusValue = 'block';
  }
  
  const { label, color, Icon } = statusMeta(statusValue);
  const finalLabel = labelOverride ?? label;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm" style={{ 
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`,
      color: color
    }}>
      <Icon className="h-3.5 w-3.5" />
      <span>{finalLabel}</span>
    </span>
  );
}

function FinalVerdict({ value }: { value: any }) {
  const { label, color, Icon } = statusMeta(value);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm" style={{ 
      backgroundColor: `${color}20`,
      border: `1px solid ${color}40`,
      color: color
    }}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}


function ExpandableEvidenceCell({ 
  company, 
  filters, 
  isExpanded, 
  onToggle 
}: { 
  company: any; 
  filters: {
    bds: { enabled: boolean; categories?: any[] };
    defense: boolean;
    shariah: boolean;
  }; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  // Get evidence from multiple sources
  const bdsEvidence = (company.bds?.categories || company.statuses?.bds?.categories || company.rawStatuses?.bds?.categories)?.flatMap((cat: any) => cat.evidence || []) || [];
  const defenseEvidence = company.rawStatuses?.defense?.evidence || [];
  const shariahEvidence = company.rawStatuses?.shariah?.evidence || [];
  const reasonsEvidence = company.reasons || [];
  
  // Filter out duplicates - only show reasons that aren't already in category-specific evidence
  const allCategoryEvidence = [...bdsEvidence, ...defenseEvidence, ...shariahEvidence];
  const uniqueReasons = reasonsEvidence.filter((reason: string) => {
    // Skip if this reason is already covered by category-specific evidence
    const isDuplicate = allCategoryEvidence.some((evidence: string) => {
      const reasonLower = reason.toLowerCase();
      const evidenceLower = evidence.toLowerCase();
      
      // Check for exact match or if one contains the other (with some tolerance)
      if (reasonLower === evidenceLower) return true;
      if (reasonLower.includes(evidenceLower) && evidenceLower.length > 20) return true;
      if (evidenceLower.includes(reasonLower) && reasonLower.length > 20) return true;
      
      return false;
    });
    
    return !isDuplicate;
  });
  
  const totalEvidence = bdsEvidence.length + defenseEvidence.length + shariahEvidence.length + uniqueReasons.length;
  
  

  

  if (totalEvidence === 0) {
    return <span className="text-xs text-white/50">No evidence</span>;
  }

  return (
    <div className="max-w-xs relative">
      <button 
        onClick={onToggle}
        className="text-xs text-white/80 hover:text-white cursor-pointer flex items-center gap-1 leading-none whitespace-nowrap"
      >
        <span>[{totalEvidence} item{totalEvidence !== 1 ? 's' : ''}]</span>
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="evidence-details mt-2 space-y-2 bg-gray-800 border border-gray-600 rounded-lg p-3 max-w-md">
          {filters.bds.enabled && bdsEvidence.length > 0 && (
            <div className="evidence-category">
              <div className="text-xs font-medium text-red-300 mb-1">🚨 BDS Violations ({bdsEvidence.length}):</div>
              {bdsEvidence.map((evidence: string, index: number) => (
                <div key={index} className="text-xs text-red-200 mb-1 p-2 bg-red-900/20 rounded border border-red-700/30">
                  • {evidence}
                </div>
              ))}
            </div>
          )}
          
          {filters.defense && defenseEvidence.length > 0 && (
            <div className="evidence-category">
              <div className="text-xs font-medium text-orange-300 mb-1">⚔️ Defense Activities ({defenseEvidence.length}):</div>
              {defenseEvidence.map((evidence: string, index: number) => (
                <div key={index} className="text-xs text-orange-200 mb-1 p-2 bg-orange-900/20 rounded border border-orange-700/30">
                  • {evidence}
                </div>
              ))}
            </div>
          )}
          
          {filters.shariah && shariahEvidence.length > 0 && (
            <div className="evidence-category">
              <div className="text-xs font-medium text-purple-300 mb-1">🕌 Shariah Compliance ({shariahEvidence.length}):</div>
              {shariahEvidence.map((evidence: string, index: number) => (
                <div key={index} className="text-xs text-purple-200 mb-1 p-2 bg-purple-900/20 rounded border border-purple-700/30">
                  • {evidence}
                </div>
              ))}
            </div>
          )}
          
          {uniqueReasons.length > 0 && (
            <div className="evidence-category">
              <div className="text-xs font-medium text-white/90 mb-1">Additional Details ({uniqueReasons.length}):</div>
              {uniqueReasons.map((reason: string, index: number) => {
                const isCompliance = (reason.toLowerCase().includes('compliant') && !reason.toLowerCase().includes('non-compliant')) || reason.toLowerCase().includes('passed');
                const isViolation = reason.toLowerCase().includes('non-compliant') || reason.toLowerCase().includes('exceeds') || reason.toLowerCase().includes('violation');
                
                return (
                  <div key={index} className={`text-xs mb-1 p-2 rounded border ${
                    isCompliance 
                      ? 'text-green-300 bg-green-900/20 border-green-700/30' 
                      : isViolation 
                        ? 'text-red-300 bg-red-900/20 border-red-700/30'
                        : 'text-white/70 bg-white/5 border-white/10'
                  }`}>
                    • {reason}
                  </div>
                );
              })}
            </div>
          )}
          
          {uniqueReasons.length === 0 && (bdsEvidence.length > 0 || defenseEvidence.length > 0 || shariahEvidence.length > 0) && (
            <div className="text-xs text-white/50 italic text-center py-2">
              All evidence shown above
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl p-4 transition-all duration-200 hover:opacity-90" style={{ 
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bgTertiary
    }}>
      <div className="text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: colors.textPrimary }}>{label}</span>
          <span title={sub} className="cursor-help" style={{ color: colors.textMuted }}>
            <Info className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-1 text-xs" style={{ color: colors.textMuted }}>{sub}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 ${value ? "shadow-sm" : ""}`}
        style={{ 
          backgroundColor: value ? colors.green : colors.border
        }}
        aria-pressed={value}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 shadow-sm ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="my-16">
      <h2 className="text-xl sm:text-2xl font-semibold">How it works</h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Step n={1} title="Paste tickers" desc="Drop in tickers (AAPL, VOO…) separated by commas or newlines." />
        <Step n={2} title="Choose filters" desc="BDS, Defense, Shariah — toggle on/off with one click." />
        <Step n={3} title="Run check" desc="We match companies to curated datasets + rules and compute verdicts." />
        <Step n={4} title="See sources" desc="Every result links to public research or filings for transparency." />
      </ol>
    </section>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-white/70"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs">{n}</span><span className="text-sm uppercase tracking-wide">Step {n}</span></div>
      <div className="mt-2 font-medium">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </li>
  );
}

function DataSources() {
  return (
    <section id="sources" className="my-16">
      <h2 className="text-xl sm:text-2xl font-semibold">Data sources</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <SourceCard title="BDS Violations" items={["AFSC Investigate", "Who Profits", "UN Settlements Database", "PACBI Academic Boycott"]} />
        <SourceCard title="Defense Contractors" items={["SIPRI Arms Industry Database", "Major Defense Contractors", "DoD Contractor Lists", "Military Equipment Manufacturers"]} />
        <SourceCard title="Shariah Compliance" items={["AAOIFI Standards", "Financial Modeling Prep API", "Real-time Financial Data", "Sector & Ratio Analysis"]} />
      </div>
      <p className="mt-4 text-sm text-white/60">All data sources are publicly available and transparently cited. We continuously expand our coverage based on user feedback.</p>
    </section>
  );
}

function SourceCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="font-medium">{title}</div>
      <ul className="mt-2 list-disc pl-5 text-sm text-white/70 space-y-1">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-white/60 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4"/>
          <span>Best‑effort research. Please verify before investing.</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white/90">Disclaimer</button>
          <button className="hover:text-white/90">Privacy</button>
          <button className="hover:text-white/90">Contact</button>
        </div>
      </div>
    </footer>
  );
}
