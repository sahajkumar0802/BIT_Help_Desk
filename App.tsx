import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  LayoutList, 
  GraduationCap, 
  User as UserIcon, 
  Search,
  Inbox,
  Eye,
  EyeOff,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  History,
  Activity,
  AlertTriangle,
  LogOut,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Building2,
  Loader2,
  WifiOff
} from 'lucide-react';
import { Dock, DockItem, DockSeparator } from './components/Dock';
import { IssueCard } from './components/IssueCard';
import { Modal } from './components/Modal';
import { Issue, ViewMode, User } from './types';
import { db } from './utils/db'; // Import the Firebase DB

// --- CONFIGURATION ---
const LOGO_URL = "/bit-logo.jpeg"; 

const DEPARTMENTS = [
  "CSE/IT", "CHEMICAL", "ECE", "ELECTRICAL", "MECHANICAL", "MINING", 
  "CIVIL", "METALLURGY", "PRODUCTION", "ADMINISTRATION", 
  "GENERAL WARDEN", "LECTURE HALL COMPLEX"
];

// --- UTILS ---
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- COMPONENTS ---

const Logo = ({ className, textClassName }: { className?: string, textClassName?: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
       <h1 className={`font-bold tracking-tight text-white whitespace-nowrap ${textClassName}`}>
         BIT <span className="text-slate-400 font-normal">STUDENT DESK</span>
       </h1>
    );
  }
  return (
    <img 
      src={LOGO_URL} 
      alt="Student Desk Logo" 
      className={className}
      onError={() => setError(true)}
    />
  );
};

// Auth Component
const AuthScreen = ({ onLogin }: { onLogin: (user: User, token: string) => void }) => {
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await db.register({
            name,
            email,
            role,
            password,
            department: role === 'professor' ? department : undefined,
            studentId: role === 'student' ? studentId : undefined
        });
        
        setIsSignUp(false);
        setError("Account created! Please log in.");
        setIsLoading(false);
      } else {
        // Pass password for Firebase Auth
        result = await db.login(email, password);
        onLogin(result.user, result.token);
      }

    } catch (err: any) {
      console.error(err);
      if (err.message.includes('api-key')) {
         setError("Missing Database Config. Please check utils/firebase.ts");
      } else {
         setError(err.message || "Authentication failed");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 z-50 relative">
       <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-center mb-8">
            <Logo className="h-24 w-auto object-contain rounded-xl" textClassName="text-2xl" />
          </div>

          <div className="flex p-1 bg-black/20 rounded-xl mb-6">
            <button 
              onClick={() => { setRole('student'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <UserIcon size={16} /> Student
            </button>
            <button 
              onClick={() => { setRole('professor'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'professor' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <GraduationCap size={16} /> Professor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-600" />
                </div>
              </div>
            )}

            {role === 'student' && isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase">Student ID</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 24B01" required className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-600" />
                </div>
              </div>
            )}

            {role === 'professor' && isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase">Your Department</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full appearance-none bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-600">
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase">{role === 'student' ? 'College Official Email' : 'Gmail Address'}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'student' ? "student@bitsindri.ac.in" : "professor@gmail.com"} required className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-600" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`mt-2 w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-wait ${role === 'student' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/25'}`}>
              {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Log In')} { !isLoading && <ArrowRight size={18} /> }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-slate-400 text-sm hover:text-white transition-colors">
              {isSignUp ? "Already have an account? Log In" : "First time here? Sign Up"}
            </button>
          </div>
       </div>
    </div>
  );
};

type Tab = 'feed' | 'log' | 'professor' | 'track';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [apiError, setApiError] = useState<boolean>(false);
  
  // Modals
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  
  // Track actions per user (Local Optimistic UI)
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [userReports, setUserReports] = useState<Set<string>>(new Set());
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState(DEPARTMENTS[0]);
  const [newIssueImage, setNewIssueImage] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolveProofImage, setResolveProofImage] = useState<string | null>(null);

  const issueFileInputRef = useRef<HTMLInputElement>(null);
  const resolveFileInputRef = useRef<HTMLInputElement>(null);

  const viewMode: ViewMode = user?.role === 'professor' ? 'professor' : 'student';

  // --- INITIALIZATION ---
  useEffect(() => {
    // Check LocalStorage for persistence (Firebase handles this internally usually, but we sync state)
    const storedUser = localStorage.getItem('bit_user');
    const storedToken = localStorage.getItem('bit_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('bit_user', JSON.stringify(u));
    localStorage.setItem('bit_token', t);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bit_user');
    localStorage.removeItem('bit_token');
    setIssues([]);
  };

  // --- DATA FETCHING ---
  const fetchIssues = async () => {
    if (!user) return;
    setIsLoadingIssues(true);
    setApiError(false);
    try {
      // Build query object
      const filter: any = {};
      if (activeTab === 'professor' && user.role === 'professor') {
        if (user.department) filter.department = user.department;
      }
      if (activeTab === 'track') {
          filter.createdBy = user.id;
      }

      const data = await db.getIssues(filter);
      setIssues(data);

    } catch (error: any) {
      console.error("Failed to fetch issues", error);
      if (error.message.includes('Config') || error.message.includes('API key')) {
         setApiError(true);
      }
    } finally {
      setIsLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'professor') setActiveTab('professor');
      else setActiveTab('feed');
      fetchIssues();
    }
  }, [user]);

  // Refetch when tab changes to ensure fresh data
  useEffect(() => {
    if (user) fetchIssues();
  }, [activeTab]);


  // --- ACTIONS ---

  const handleUpvote = async (id: string) => {
    if (user?.role !== 'student') return;
    if (userUpvotes.has(id)) return; 

    // Optimistic Update
    setUserUpvotes(prev => new Set(prev).add(id));
    setIssues(prev => prev.map(i => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));

    try {
      await db.upvoteIssue(id);
    } catch (e) {
      console.error("Failed to upvote", e);
    }
  };

  const handleReport = (id: string) => {
    if (userReports.has(id)) return;
    setUserReports(prev => new Set(prev).add(id));
  };

  const handleDelete = async (id: string) => {
    // For now we just remove from view as delete isnt fully implemented in mock DB 
    // but the button exists.
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    try {
      await db.createIssue({
        title: newTitle,
        description: newDesc,
        department: newDept,
        imageUrl: newIssueImage || undefined, 
        createdBy: user.id,
        author: isAnonymous ? 'Anonymous' : `Student ID: ${user.id}` // fix key name to match 'author' in type
      });
      
      await fetchIssues();
      setNewTitle(''); setNewDesc(''); setNewDept(DEPARTMENTS[0]); setNewIssueImage(null);
      setIsRaiseModalOpen(false);
      if (activeTab === 'log') setActiveTab('feed');
    } catch (error) {
      console.error("Failed to post issue", error);
      alert("Failed to create issue. Check console for details.");
    }
  };

  const confirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingIssueId) return;

    try {
      const updates: Partial<Issue> = resolveProofImage
        ? { status: 'resolved', resolvedImageUrl: resolveProofImage }
        : { status: 'resolved' };

      await db.updateIssue(processingIssueId, updates);
      
      // Update local state
      setIssues(prev => prev.map(issue => 
        issue.id === processingIssueId 
          ? { ...issue, ...updates } 
          : issue
      ));
      setIsResolveModalOpen(false);
      setProcessingIssueId(null);
      setResolveProofImage(null);
    } catch (e) { console.error(e); }
  };

  const confirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingIssueId) return;

    try {
      await db.updateIssue(processingIssueId, {
          status: 'rejected',
          rejectionReason
      });

      setIssues(prev => prev.map(issue => 
        issue.id === processingIssueId 
          ? { ...issue, status: 'rejected', rejectionReason } 
          : issue
      ));
      setIsRejectModalOpen(false);
      setProcessingIssueId(null);
    } catch (e) { console.error(e); }
  };

  // Convert File to Base64 for database storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFunc: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setFunc(base64);
      } catch (err) {
        console.error("Failed to convert image", err);
      }
    }
  };

  const initiateResolve = (id: string) => {
    setProcessingIssueId(id);
    setResolveProofImage(null);
    setIsResolveModalOpen(true);
  };

  const initiateReject = (id: string) => {
    setProcessingIssueId(id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  // --- FILTERING LOGIC ---
  const displayedIssues = useMemo(() => {
    let filtered = [...issues];
    
    if (activeTab === 'feed') {
      filtered = filtered.filter(i => i.status === 'open');
    } else if (activeTab === 'log') {
      filtered = filtered.filter(i => i.status !== 'open');
    } else if (activeTab === 'track') {
      if (user) filtered = filtered.filter(i => i.createdBy === user.id);
    } else if (activeTab === 'professor') {
      filtered = filtered.filter(i => i.status === 'open');
      // The backend filters by department, but we do search filtering here
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(i => 
          i.title.toLowerCase().includes(query) || 
          i.description.toLowerCase().includes(query) ||
          i.department.toLowerCase().includes(query)
        );
      }
    }
    return filtered;
  }, [issues, activeTab, searchQuery, user]);

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'feed': return { title: 'Active Issues', subtitle: 'Vote on current campus issues.', icon: <Activity className="text-indigo-400" size={24} /> };
      case 'log': return { title: 'Resolution Log', subtitle: 'History of resolved queries.', icon: <History className="text-emerald-400" size={24} /> };
      case 'track': return { title: 'My Queries', subtitle: 'Track your issues.', icon: <ClipboardList className="text-sky-400" size={24} /> };
      case 'professor': return { title: 'Professor Dashboard', subtitle: `Reviewing issues for ${user?.department || 'Department'}`, icon: <GraduationCap className="text-violet-400" size={24} /> };
    }
  };

  const header = getHeaderContent();

  return (
    <div className="relative h-screen w-full bg-slate-950 text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      {!user ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <>
          <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30 backdrop-blur-md bg-slate-950/50 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-auto object-contain rounded-lg" textClassName="text-lg" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                 <div className={`w-2 h-2 rounded-full ${user.role === 'student' ? 'bg-indigo-500' : 'bg-violet-500'}`} />
                 <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Log Out">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <main className="absolute inset-0 pt-20 pb-32 px-4 md:px-6 overflow-y-auto custom-scrollbar scroll-smooth">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 mt-4">
                 <div className="flex items-center gap-3 mb-2">
                    {header.icon}
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">{header.title}</h2>
                 </div>
                 <p className="text-slate-400 ml-9">{header.subtitle}</p>
              </div>

              {activeTab === 'professor' && (
                <div className="mb-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={20} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search issues..." className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all shadow-inner backdrop-blur-sm" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:bg-white/10 hover:text-white transition-colors"><X size={14} /></button>}
                  </div>
                </div>
              )}

              {isLoadingIssues ? (
                 <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
              ) : apiError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-80 bg-rose-500/5 rounded-3xl border border-rose-500/10 backdrop-blur-sm">
                  <WifiOff size={64} className="mb-4 text-rose-500" />
                  <h3 className="text-xl font-medium text-rose-300">Connection Failed</h3>
                  <p className="text-slate-400 mt-2 max-w-xs">Could not connect to the database. Please check your Firebase configuration in <code>utils/firebase.ts</code>.</p>
                  <button onClick={fetchIssues} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">Retry Connection</button>
                </div>
              ) : displayedIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <Inbox size={64} className="mb-4 text-slate-600" />
                  <h3 className="text-xl font-medium text-slate-300">Nothing to show</h3>
                  <p className="text-slate-500">No issues found matching your criteria.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {displayedIssues.map((issue, idx) => (
                    <IssueCard 
                      key={issue.id} 
                      issue={issue} 
                      isUpvoted={userUpvotes.has(issue.id)}
                      isReported={userReports.has(issue.id)}
                      onUpvote={handleUpvote} 
                      onReport={handleReport}
                      onDelete={issue.createdBy === user.id ? handleDelete : undefined}
                      onResolve={initiateResolve}
                      onReject={initiateReject}
                      viewMode={viewMode}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>

          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <Dock>
                {user.role === 'student' && (
                  <>
                    <DockItem icon={LayoutList} label="Live Feed" isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
                    <DockItem icon={History} label="Resolution Log" isActive={activeTab === 'log'} onClick={() => setActiveTab('log')} />
                    <DockItem icon={ClipboardList} label="Track Queries" isActive={activeTab === 'track'} onClick={() => setActiveTab('track')} />
                    <DockSeparator />
                    <DockItem icon={Plus} label="Raise Issue" onClick={() => setIsRaiseModalOpen(true)} />
                  </>
                )}
                {user.role === 'professor' && (
                  <>
                    <DockItem icon={LayoutList} label="View Feed" isActive={false} onClick={() => setActiveTab('feed')} />
                    <DockItem icon={History} label="Resolution Log" isActive={activeTab === 'log'} onClick={() => setActiveTab('log')} />
                    <DockSeparator />
                    <DockItem icon={GraduationCap} label="Professor Dashboard" isActive={activeTab === 'professor'} onClick={() => setActiveTab('professor')} />
                  </>
                )}
              </Dock>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      <Modal isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)} title="Raise an Issue">
        <form onSubmit={handleSubmitIssue} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Issue Title</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="E.g., Library AC not working" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" autoFocus />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
              <div className="relative">
                <select value={newDept} onChange={(e) => setNewDept(e.target.value)} className="w-full appearance-none bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Photo Evidence (Optional)</label>
              <input type="file" accept="image/*" ref={issueFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewIssueImage)} />
              <div onClick={() => issueFileInputRef.current?.click()} className={`w-full h-[50px] rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors ${newIssueImage ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-slate-950/50 text-slate-500 hover:border-white/20 hover:text-slate-400'}`}>
                {newIssueImage ? <><ImageIcon size={18} /><span className="text-sm font-medium truncate max-w-[120px]">Image Selected</span><button type="button" onClick={(e) => { e.stopPropagation(); setNewIssueImage(null); }} className="p-1 hover:bg-indigo-500/20 rounded-full ml-1"><X size={14} /></button></> : <><Upload size={18} /><span className="text-sm">Upload Photo</span></>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Detailed Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the problem, location, and impact..." rows={4} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsAnonymous(!isAnonymous)}>
            <div className={`p-2 rounded-lg ${isAnonymous ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>{isAnonymous ? <EyeOff size={18} /> : <Eye size={18} />}</div>
            <div className="flex-1"><p className="text-sm font-medium text-slate-200">Post Anonymously</p><p className="text-xs text-slate-500">{isAnonymous ? 'Your ID will be hidden' : `Posting as Student ID: ${user?.id}`}</p></div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'left-7' : 'left-1'}`} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsRaiseModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={!newTitle.trim() || !newDesc.trim()} className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2">Submit Issue</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Complete Resolution">
        <form onSubmit={confirmResolve} className="flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">You can mark this issue as resolved. Uploading a proof photo is optional.</div>
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">Upload Resolution Proof (Optional)</label>
             <input type="file" accept="image/*" ref={resolveFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setResolveProofImage)} />
              <div onClick={() => resolveFileInputRef.current?.click()} className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${resolveProofImage ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/5'}`}>
                {resolveProofImage ? <div className="relative w-full h-full p-2"><img src={resolveProofImage} alt="Preview" className="w-full h-full object-contain rounded-lg" /><button type="button" onClick={(e) => { e.stopPropagation(); setResolveProofImage(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-md"><X size={16} /></button></div> : <><div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"><Upload size={24} /></div><div className="text-center"><p className="text-sm font-medium text-slate-300">Click to upload photo</p><p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF</p></div></>}
              </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsResolveModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"><CheckCircle2 size={18} />Confirm Resolution</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Issue">
        <form onSubmit={confirmReject} className="flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">Are you sure you want to reject this issue? Please provide a reason for the student.</div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Reason for Rejection</label>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="E.g., Duplicate issue, Lack of information..." rows={4} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none" autoFocus />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={!rejectionReason.trim()} className="px-6 py-2.5 rounded-xl font-medium bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20 transition-all active:scale-95">Confirm Rejection</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}