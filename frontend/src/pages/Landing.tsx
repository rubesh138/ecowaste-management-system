import React from 'react';
import { Link } from 'react-router-dom';
import {
  Recycle,
  ArrowRight,
  ShieldCheck,
  Bell,
  BarChart3,
  MessageSquareWarning,
  RefreshCw,
  Sparkles,
  Leaf,
  Calendar,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  const steps = [
    {
      num: '01',
      title: 'Submit Request',
      desc: 'Citizen submits waste collection request with category, quantity, and preferred date.',
      icon: Package,
    },
    {
      num: '02',
      title: 'Admin Reviews',
      desc: 'Municipal operations team receives instant notification and validates request details.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Request Accepted',
      desc: 'Request is accepted and approved for routing; citizen receives instant notification.',
      icon: CheckCircle2,
    },
    {
      num: '04',
      title: 'Collection Scheduled',
      desc: 'Collection pickup date is scheduled with automated alerts sent to citizen dashboard.',
      icon: Calendar,
    },
    {
      num: '05',
      title: 'Waste Collected',
      desc: 'Municipal fleet collects segregated materials and delivers them to the processing hub.',
      icon: Recycle,
    },
    {
      num: '06',
      title: 'Recycling Recorded',
      desc: 'Materials are weighed, sorted, and recorded for bio-composting or industrial remanufacture.',
      icon: RefreshCw,
    },
  ];

  const features = [
    {
      title: 'Easy Waste Requests',
      desc: 'Schedule pickups for plastic, organic, e-waste, glass, metal and paper in under 60 seconds.',
      icon: Recycle,
      color: 'emerald',
    },
    {
      title: 'Admin Management',
      desc: 'Complete workflow controls to accept, schedule, assign, and track residential waste collection.',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      title: 'Instant Notifications',
      desc: 'Real-time alerts keep citizens informed at every phase from review to final collection.',
      icon: Bell,
      color: 'amber',
    },
    {
      title: 'Complaint Tracking',
      desc: 'Report missed pickups, overflowing public bins, or damaged containers with rapid admin resolution.',
      icon: MessageSquareWarning,
      color: 'rose',
    },
    {
      title: 'Recycling Management',
      desc: 'Track industrial recycling batches, conversion methods, and municipal recovery efficiencies.',
      icon: RefreshCw,
      color: 'purple',
    },
    {
      title: 'Data Analytics',
      desc: 'Visual reports on monthly collection trends, category volumes, and citywide recycling rates.',
      icon: BarChart3,
      color: 'cyan',
    },
  ];

  const wasteTypes = [
    { name: 'Organic Waste', desc: 'Food scraps, yard trimmings for high-grade compost', color: 'bg-emerald-500' },
    { name: 'Plastic Packaging', desc: 'PET bottles, containers & poly wrap for pelletizing', color: 'bg-blue-500' },
    { name: 'Paper & Cardboard', desc: 'Boxes, newsprint & office paper for hydropulping', color: 'bg-amber-500' },
    { name: 'Glass Containers', desc: 'Bottles & jars crushed into clean furnace cullet', color: 'bg-cyan-500' },
    { name: 'Metal & Scrap', desc: 'Aluminum cans & steel for smelting & reuse', color: 'bg-slate-600' },
    { name: 'Electronic E-Waste', desc: 'Circuit boards & appliances for precious metal recovery', color: 'bg-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Recycle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                Eco<span className="text-emerald-600">Waste</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Smart Management
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Environmental Impact</a>
            <a href="#categories" className="hover:text-emerald-600 transition-colors">Waste Streams</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard'}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-mesh py-20 lg:py-28 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next-Gen Municipal Waste & Recycling Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Smarter Waste Collection. <br />
                <span className="text-emerald-400">Cleaner Communities.</span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connect citizens and municipal waste management teams through a simple, transparent, and efficient digital waste collection platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={user ? (user.role === 'admin' ? '/admin/requests' : '/citizen/create-request') : '/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 transition-all hover:scale-105"
                >
                  <Package className="w-4 h-4" />
                  <span>Request Waste Collection</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Quick credibility bullet points */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-600/40 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">98.4%</p>
                  <p className="text-xs text-emerald-200/80">Pickup Reliability</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">2,400+ kg</p>
                  <p className="text-xs text-emerald-200/80">Recycled This Month</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-emerald-200/80">Status Transparency</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Graphic (CSS / UI illustration) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-slate-900/60 p-6 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-4">
                {/* Visual live card header */}
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Live Waste Collection Stream
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">REQ-26101</span>
                </div>

                {/* Simulated Step Lifecycle Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        PET
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Plastic Bottles (18 kg)</p>
                        <p className="text-[11px] text-slate-400">742 Evergreen Terrace</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Scheduled
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        PAP
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Cardboard & Paper (25 kg)</p>
                        <p className="text-[11px] text-slate-400">108 Pinecone Lane</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        GLS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Glass Jars & Cullet (15 kg)</p>
                        <p className="text-[11px] text-slate-400">Eco District Center</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Collected
                    </span>
                  </div>
                </div>

                {/* Simulated Recovery Progress Metric */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">City Recycling Recovery Rate</span>
                    <span className="text-emerald-400 font-bold">84.6%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '84.6%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Why Smart Waste Management */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Why Smart Waste Management?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Transforming Urban Cleanliness with Technology
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Traditional garbage collection is riddled with missed routes, unsegregated landfills, and lack of citizen visibility. EcoWaste bridges the gap with a fully auditable digital lifecycle.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:shadow-soft transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero-Waste Divergence</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Categorized waste requests guarantee materials reach authorized recyclers and composting centers rather than open municipal dump sites.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-soft transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">100% Operational Transparency</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every request transition—from review to pickup scheduling and final completion—is timestamped with notifications for both parties.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:shadow-soft transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Actionable Environmental Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Comprehensive data graphs allow city administrators to evaluate recycling trends, measure tonnage collected, and optimize collection schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works (6 Steps) */}
      <section id="how-it-works" className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How the Platform Works
            </h2>
            <p className="text-slate-600 text-sm">
              A 6-step synchronized loop connecting citizens and municipal waste operations.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Platform Features */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Citizens and Municipal Admins
            </h2>
            <p className="text-slate-600 text-sm">
              All essential modules built with enterprise standards and modern SaaS design.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-soft transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 text-emerald-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Waste Streams */}
      <section id="categories" className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Supported Streams
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Segregated Recycling Categories
            </h2>
            <p className="text-slate-400 text-sm">
              Responsible sorting at home leads to maximum material recovery at municipal facilities.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wasteTypes.map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 transition-all space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-forest-600 to-teal-700 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build a Cleaner, Greener City?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            Join thousands of active citizens scheduling pickups, resolving sanitation grievances, and tracking circular recycling metrics in real-time.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Create Free Citizen Account</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800/60 px-6 py-3.5 text-sm font-semibold text-white border border-emerald-400/40 hover:bg-emerald-800 transition-colors"
            >
              <span>Sign In to Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              <Recycle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">EcoWaste System</p>
              <p className="text-[11px] text-slate-500">Smart Waste Collection & Recycling</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <Link to="/login" className="hover:text-emerald-400 transition-colors">Admin Login</Link>
            <Link to="/register" className="hover:text-emerald-400 transition-colors">Citizen Register</Link>
          </div>

          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} EcoWaste Platform. Engineering Final Year Project.
          </p>
        </div>
      </footer>
    </div>
  );
};
