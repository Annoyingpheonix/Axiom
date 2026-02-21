import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Zap, 
  Brain, 
  Users, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trophy, 
  Activity, 
  Swords, 
  Gem,
  Menu,
  X,
  ScrollText,
  Target,
  Layers,
  Fingerprint,
  Heart,
  Moon,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  MessageSquare,
  Crown,
  Flag,
  Send,
  UserPlus,
  BarChart3,
  Rocket,
  Settings,
  Camera,
  MapPin,
  FileText,
  ShoppingBag,
  Cpu,
  Eye,
  EyeOff,
  Coins,
  Timer,
  Globe,
  ArrowUpCircle,
  Loader2,
  Terminal,
  History,
  Flame,
  TrendingUp,
  Calendar,
  CreditCard,
  Star
} from 'lucide-react';
import { 
  UserStats, 
  Habit, 
  ClassType, 
  StatType, 
  GeneratedQuestData, 
  Skill, 
  SkillRank, 
  SkillType,
  Guild, 
  Friend, 
  ChatMessage, 
  SocialRank, 
  LeaderboardEntry, 
  UserProfile, 
  VerificationMethod, 
  VerificationStatus,
  MarketplaceItem,
  AgentConfig,
  FriendType,
  JobChangeStatus,
  VerificationResult
} from './types';
import StatRadar from './components/StatRadar';
import Onboarding from './components/Onboarding';
import { generateQuestFromGoal, verifyEvidence } from './services/geminiService';

// --- Constants & Helpers ---

const BASE_DAILY_CAPS = {
  XP: 1000,
  GOLD: 500,
  CREDITS: 100
};

const LEVEL_CAP = 100;

const calculateMaxXp = (level: number) => Math.floor(100 * Math.pow(level, 1.6));

const getClassStat = (classType: ClassType): StatType => {
  const strClasses = [ClassType.SENTINEL, ClassType.WARDEN, ClassType.MARSHAL, ClassType.STEWARD, ClassType.NEOPHYTE];
  const intClasses = [ClassType.STRATEGIST, ClassType.ANALYST, ClassType.COMMANDER, ClassType.INNOVATOR];
  const dexClasses = [ClassType.RANGER, ClassType.ADEPT, ClassType.VANGUARD, ClassType.VOYAGER];
  
  if (intClasses.includes(classType)) return StatType.INT;
  if (dexClasses.includes(classType)) return StatType.DEX;
  if (strClasses.includes(classType)) return StatType.STR;
  return StatType.CHA;
};

const INITIAL_STATS: UserStats = {
  name: 'Neophyte',
  avatar: '👤',
  level: 1,
  xp: 0,
  maxXp: 100,
  
  classLevel: 1,
  classXp: 0,
  maxClassXp: 200,

  health: 100,
  maxHealth: 100,
  streak: 5,
  longestStreak: 12,
  history: [true, true, false, true, true, true, false], // Last 7 days mock

  classType: ClassType.NEOPHYTE,
  attributes: {
    [StatType.STR]: 10,
    [StatType.INT]: 10,
    [StatType.DEX]: 10,
    [StatType.CHA]: 10,
  },
  gold: 250,
  credits: 50, 
  dailyEarnings: { gold: 0, xp: 0, credits: 0, lastReset: Date.now() },
  skillPoints: 0,
  unlockedSkills: [],
  guildId: 'g1',
  isPro: false,
  socialRank: SocialRank.G,
  rankScore: 100,
  jobChangeStatus: JobChangeStatus.LOCKED,
  agents: [
    { id: 'a1', role: 'QUEST', name: 'Oracle', tone: 'STOIC', visualTheme: 'CYBER', avatarId: '🔮' },
    { id: 'a2', role: 'VERIFICATION', name: 'Sentinel', tone: 'STRICT', visualTheme: 'MINIMAL', avatarId: '👁️' }
  ]
};

const INITIAL_PROFILE: UserProfile = {
  goals: [],
  constraints: [],
  bio: '',
  trustScore: 80, 
  privacySettings: { shareStats: true, shareActivity: true, allowBehavioralAnalysis: true }
};

// --- DATA: Mock Social ---
const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Sarah_Str', level: 42, classType: ClassType.COMMANDER, isOnline: true, lastSeen: 'Now', avatar: '🛡️', type: FriendType.ALLY, rank: SocialRank.B, guildId: 'g1' },
  { id: 'f2', name: 'Dev_Opt', level: 28, classType: ClassType.INNOVATOR, isOnline: false, lastSeen: '2h ago', avatar: '⚡', type: FriendType.RIVAL, rank: SocialRank.C },
  { id: 'f3', name: 'Elder_Kai', level: 95, classType: ClassType.MENTOR, isOnline: true, lastSeen: 'Now', avatar: '🧙‍♂️', type: FriendType.MENTOR, rank: SocialRank.S },
];

const MOCK_GUILD: Guild = {
  id: 'g1',
  name: 'Iron Vanguard',
  description: 'We do not negotiate with mediocrity.',
  level: 4,
  members: [MOCK_FRIENDS[0], { ...MOCK_FRIENDS[2], id: 'f4', name: 'You' }], // Self + Sarah + Kai
  capacity: 12,
  trustPool: 88,
  objectives: [
    { id: 'o1', description: 'Complete 50 Verified Workouts', current: 32, target: 50, unit: 'reps', reward: 'Streak Freeze +1' }
  ],
  perks: [
    { label: 'Fast Quest Refresh', active: true },
    { label: 'XP Boost (5%)', active: true } // Active perk for logic check
  ]
};

const MOCK_CHAT: ChatMessage[] = [
  { id: 'm1', senderId: 'f1', senderName: 'Sarah_Str', text: 'Guild objective is 60% done. Lets push.', timestamp: Date.now() - 300000, channel: 'GUILD' },
  { id: 'm2', senderId: 'f3', senderName: 'Elder_Kai', text: 'Your consistency is improving. Keep the trust score above 90.', timestamp: Date.now() - 100000, channel: 'DM' },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'l1', name: 'Kael_Ascendant', classType: ClassType.STRATEGIST, rank: SocialRank.SS, title: 'The Architect', avatar: '👁️', isFriend: false },
  { id: 'l2', name: 'Viper', classType: ClassType.VANGUARD, rank: SocialRank.S, title: 'Stormbreaker', avatar: '⚔️', isFriend: false },
  { id: 'l3', name: 'Elder_Kai', classType: ClassType.MENTOR, rank: SocialRank.S, title: 'Guide', avatar: '🧙‍♂️', isFriend: true },
  { id: 'l4', name: 'Sarah_Str', classType: ClassType.COMMANDER, rank: SocialRank.A, title: 'Captain', avatar: '🛡️', isFriend: true },
  { id: 'l5', name: 'You', classType: ClassType.NEOPHYTE, rank: SocialRank.G, title: 'Initiate', avatar: '👤', isFriend: true },
];

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: 'pro_1', type: 'PREMIUM', name: 'AXIOM PRO Membership', description: '2x Daily Caps, Void Theme, Elite Badge.', cost: 5000, currency: 'CREDITS', reqLevel: 1, reqTrust: 50, icon: '👑', purchased: false },
  { id: 'm1', type: 'INTEGRATION', name: 'Calendar Sync', description: 'Auto-verify schedule based habits.', cost: 500, currency: 'CREDITS', reqLevel: 5, reqTrust: 70, icon: '📅', purchased: false },
  { id: 'm2', type: 'INTEGRATION', name: 'Github Link', description: 'XP for commits. Developer class synergy.', cost: 1000, currency: 'CREDITS', reqLevel: 10, reqTrust: 80, icon: '💻', purchased: false },
  { id: 'c1', type: 'COSMETIC', name: 'Void Theme', description: 'Darker than black UI theme.', cost: 200, currency: 'CREDITS', reqLevel: 10, reqTrust: 0, icon: '🌑', purchased: false },
  { id: 's1', type: 'SKILL', name: 'Flow State', description: 'Active: 2x XP for 1 hour. Cooldown 24h.', cost: 300, currency: 'CREDITS', reqLevel: 15, reqTrust: 60, icon: '🌊', purchased: false },
];

// --- Helpers ---
const getRankColor = (rank: SocialRank | SkillRank) => {
  const r = rank as string;
  if (['SS', 'S', 'UNIQUE'].includes(r)) return 'text-purple-400 border-purple-500/50';
  if (['A', 'DIAMOND'].includes(r)) return 'text-cyan-400 border-cyan-500/50';
  if (['B', 'GOLD'].includes(r)) return 'text-axiom-gold border-yellow-500/50';
  if (['C', 'SILVER'].includes(r)) return 'text-slate-300 border-slate-400/50';
  return 'text-slate-500 border-slate-700';
};

// --- Components ---

const StreakWidget: React.FC<{ streak: number; longest: number; history: boolean[] }> = ({ streak, longest, history }) => {
    const fireIntensity = Math.min(streak * 10, 100);
    
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-950/80 to-red-950/80 border border-orange-500/30 p-6 group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-32 h-32 text-orange-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-orange-500 to-red-600 shadow-[0_0_20px_rgba(234,88,12,0.4)] ${streak > 0 ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                        <Flame className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-xs uppercase font-bold text-orange-400 tracking-wider mb-1">Current Streak</div>
                        <div className="text-4xl font-display font-bold text-white leading-none">{streak} <span className="text-lg text-slate-400 font-normal">Days</span></div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-axiom-gold" /> Best: <span className="text-white">{longest} Days</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                     <div className="flex gap-1 mb-2">
                        {history.map((active, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-3 h-10 rounded-full transition-all ${active ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-800'}`}></div>
                                <div className="text-[8px] text-slate-500 font-mono">D{i+1}</div>
                            </div>
                        ))}
                     </div>
                     <div className="text-sm font-bold text-orange-200">
                        {streak > 3 ? "You are unstoppable!" : streak > 0 ? "Momentum building..." : "Ignite the flame."}
                     </div>
                </div>
            </div>
        </div>
    );
};

const JobChangeModal: React.FC<{ onClose: () => void; onStartTrial: () => void }> = ({ onClose, onStartTrial }) => (
  <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-700">
    <div className="max-w-2xl w-full border border-axiom-gold/30 rounded-xl p-8 relative overflow-hidden bg-axiom-900 shadow-[0_0_100px_rgba(251,191,36,0.1)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-axiom-gold to-transparent"></div>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X /></button>
      
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-axiom-900 border-2 border-axiom-gold rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <ArrowUpCircle className="w-10 h-10 text-axiom-gold" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-widest uppercase">Ascension Ceremony</h2>
        <p className="text-axiom-gold font-mono text-sm mt-2">Level 100 Reached • Rank A Required</p>
      </div>

      <div className="space-y-6 text-slate-300 text-center max-w-lg mx-auto mb-8 leading-relaxed">
        <p>You have hit the ceiling of the Neophyte. To proceed to Level 120 and unlock your True Class, you must endure the <span className="text-white font-bold">Trial of Consistency</span>.</p>
        <div className="bg-black/40 p-4 rounded border border-slate-800 text-left text-sm space-y-2">
           <div className="flex justify-between"><span>Trial Duration</span><span className="text-white">7 Days</span></div>
           <div className="flex justify-between"><span>Verification Strictness</span><span className="text-red-400">Maximum</span></div>
           <div className="flex justify-between"><span>Reward</span><span className="text-axiom-gold">Job Change & Lvl 120 Unlock</span></div>
        </div>
      </div>

      <button onClick={onStartTrial} className="w-full bg-axiom-gold text-black font-bold py-4 rounded-lg hover:bg-yellow-400 transition-all text-lg tracking-widest uppercase">
        Begin The Trial
      </button>
    </div>
  </div>
);

const VerificationModal: React.FC<{ habit: Habit; userProfile: UserProfile; onClose: () => void; onVerify: (status: VerificationStatus) => void }> = ({ habit, userProfile, onClose, onVerify }) => {
    const [evidence, setEvidence] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const handleVerify = async () => {
        if(!evidence.trim()) return;
        setVerifying(true);
        const res = await verifyEvidence(habit.title, evidence, userProfile);
        setResult(res);
        setVerifying(false);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-axiom-800 rounded-xl max-w-md w-full border border-slate-700 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-axiom-accent" /> Verify Execution</h3>
                    <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
                </div>
                
                {!result ? (
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-sm text-slate-300">
                            Protocol: <span className="text-white font-bold">{habit.title}</span>
                            <br/>
                            Method: <span className="text-axiom-accent font-mono uppercase text-xs">{habit.verificationMethod.replace('_', ' ')}</span>
                        </div>
                        <textarea 
                            className="w-full bg-axiom-900 border border-slate-600 rounded p-3 text-white text-sm h-32 focus:border-axiom-accent focus:outline-none placeholder-slate-600"
                            placeholder="Enter reflection, paste log, or describe completion..."
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                        />
                        <button 
                            onClick={handleVerify}
                            disabled={verifying || !evidence}
                            className="w-full bg-axiom-accent hover:bg-blue-600 text-white py-3 rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Evidence...</> : "Submit to Sentinel"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        <div className={`p-4 rounded border ${result.status === VerificationStatus.VERIFIED ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.status === VerificationStatus.VERIFIED ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-red-400" />}
                                <span className={`font-bold ${result.status === VerificationStatus.VERIFIED ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2 italic">"{result.notes}"</p>
                            <div className="flex gap-4 text-xs font-mono text-slate-500 border-t border-slate-700/50 pt-2">
                                <span>Fraud Score: {result.fraudScore}%</span>
                                <span>Confidence: {result.confidence}%</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onVerify(result.status)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-bold transition-colors"
                        >
                            {result.status === VerificationStatus.VERIFIED ? "Claim Rewards" : "Acknowledge Failure"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'social' | 'profile'>('dashboard');
  const [marketTab, setMarketTab] = useState<'ALL' | 'SKILL' | 'COSMETIC' | 'PREMIUM'>('ALL');
  const [socialTab, setSocialTab] = useState<'guild' | 'allies' | 'leaderboard'>('guild');
  const [user, setUser] = useState<UserStats>({ ...INITIAL_STATS, socialRank: SocialRank.G }); // Start at G
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(MARKETPLACE_ITEMS); 
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Habits & Social Data
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Morning Workout', difficulty: 'HARD', stat: StatType.STR, completed: false, streak: 5, verificationMethod: VerificationMethod.TEXT_REFLECTION }
  ]);
  const [guild, setGuild] = useState<Guild>(MOCK_GUILD);
  const [chatLog, setChatLog] = useState<ChatMessage[]>(MOCK_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [chatChannel, setChatChannel] = useState<'GUILD' | 'DM'>('GUILD');

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [verificationHabit, setVerificationHabit] = useState<Habit | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Computed Caps
  const currentDailyCaps = {
      XP: BASE_DAILY_CAPS.XP * (user.isPro ? 2 : 1),
      GOLD: BASE_DAILY_CAPS.GOLD * (user.isPro ? 2 : 1),
      CREDITS: BASE_DAILY_CAPS.CREDITS * (user.isPro ? 1.5 : 1)
  };
  
  // --- Effects ---
  
  // 1. Job Change Eligibility Check
  useEffect(() => {
    if (user.level >= LEVEL_CAP && user.jobChangeStatus === JobChangeStatus.LOCKED && user.socialRank >= SocialRank.A) {
      setUser(u => ({ ...u, jobChangeStatus: JobChangeStatus.AVAILABLE }));
    }
  }, [user.level, user.socialRank, user.jobChangeStatus]);

  // 2. Dynamic Social Rank Update (Trust + Streak)
  useEffect(() => {
      let newRank = SocialRank.G;
      const t = profile.trustScore;
      const s = user.streak;

      if (t >= 98 && s >= 60) newRank = SocialRank.SS;
      else if (t >= 95 && s >= 30) newRank = SocialRank.S;
      else if (t >= 90 && s >= 14) newRank = SocialRank.A;
      else if (t >= 80 && s >= 7) newRank = SocialRank.B;
      else if (t >= 70) newRank = SocialRank.C;
      else if (t >= 60) newRank = SocialRank.D;
      else if (t >= 50) newRank = SocialRank.E;
      else newRank = SocialRank.F;

      if (newRank !== user.socialRank) {
          setUser(u => ({ ...u, socialRank: newRank }));
      }
  }, [profile.trustScore, user.streak, user.socialRank]);

  // --- Handlers ---

  const handleOnboardingComplete = (data: Partial<UserStats>) => {
    setUser(prev => ({ ...prev, ...data }));
    setOnboardingComplete(true);
  };

  const handleStartTrial = () => {
    setUser(prev => ({ ...prev, jobChangeStatus: JobChangeStatus.IN_TRIAL }));
    // Inject Trial Quest
    setHabits(prev => [
        { 
            id: 'trial_1', 
            title: 'TRIAL: Perfect Consistency (Day 1)', 
            difficulty: 'HARD', 
            stat: StatType.INT, 
            completed: false, 
            streak: 0, 
            verificationMethod: VerificationMethod.TEXT_REFLECTION, 
            description: "The Trial of Consistency requires absolute adherence. Any failure resets the trial." 
        },
        ...prev
    ]);
    setShowJobModal(false);
  };

  const handleBuyItem = (item: MarketplaceItem) => {
      if (item.currency === 'CREDITS' && user.credits < item.cost) return alert("Insufficient Credits");
      if (item.currency === 'GOLD' && user.gold < item.cost) return alert("Insufficient Gold");
      if (user.level < item.reqLevel) return alert("Level too low");
      if (profile.trustScore < item.reqTrust) return alert("Trust score too low");
 
      // Handle PRO_SUB
      if (item.type === 'PREMIUM') {
          setUser(prev => ({
              ...prev,
              credits: item.currency === 'CREDITS' ? prev.credits - item.cost : prev.credits,
              gold: item.currency === 'GOLD' ? prev.gold - item.cost : prev.gold,
              isPro: true
          }));
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, purchased: true } : i));
          alert("Welcome to AXIOM PRO. Neural limiters removed.");
          return;
      }

      // Deduct
      setUser(prev => ({
          ...prev,
          credits: item.currency === 'CREDITS' ? prev.credits - item.cost : prev.credits,
          gold: item.currency === 'GOLD' ? prev.gold - item.cost : prev.gold,
          // If it's a SKILL, add to unlockedSkills
          unlockedSkills: item.type === 'SKILL' 
            ? [...prev.unlockedSkills, { 
                id: item.id, 
                name: item.name, 
                description: item.description, 
                type: SkillType.ACTIVE, 
                rank: SkillRank.BRONZE, 
                progress: 0, 
                cost: 0, 
                reqLevel: 0, 
                reqClassLevel: 0, 
                reqTrust: 0, 
                effect: { type: 'XP_BOOST', value: 2 } // Mock effect
              }] 
            : prev.unlockedSkills
      }));
 
      // Mark purchased
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, purchased: true } : i));
  };

  const handleUseSkill = (skillId: string) => {
      alert("Skill Activated! (Mock Effect)");
  };

  const finalizeHabitCompletion = (status: VerificationStatus) => {
     if (!verificationHabit) return;
     // Allow 'SOFT_APPROVE' to pass but with reduced rewards (logic implicit in fraud score handling if expanded)
     if (status === VerificationStatus.REJECTED) {
         setVerificationHabit(null);
         return;
     }

     const id = verificationHabit.id;
     setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: true, streak: h.streak + 1, verificationStatus: status } : h));
     
     // 1. Calculate Base Rewards
     let baseXp = verificationHabit.difficulty === 'HARD' ? 100 : verificationHabit.difficulty === 'MEDIUM' ? 50 : 25;
     
     // 2. Guild Perks Integration
     const xpPerk = guild.perks.find(p => p.label.includes('XP Boost') && p.active);
     if (xpPerk) {
         baseXp = Math.floor(baseXp * 1.05); // 5% Boost
     }

     // 3. Level Cap Check
     // XP is completely PAUSED at level 100 unless Job Change is COMPLETE.
     const canGainXp = user.level < LEVEL_CAP || user.jobChangeStatus === JobChangeStatus.COMPLETE;
     const actualXp = canGainXp ? baseXp : 0; 

     setUser(prev => {
         let newXp = prev.xp + actualXp;
         let newLevel = prev.level;
         let newMaxXp = prev.maxXp;
         
         if (canGainXp && newXp >= prev.maxXp) {
             newLevel++;
             newXp -= prev.maxXp;
             newMaxXp = calculateMaxXp(newLevel);
         }
         
         // Class XP Logic (Simplified)
         let newClassXp = prev.classXp + Math.floor(actualXp * 0.5);
         let newClassLevel = prev.classLevel;
         if (newClassXp >= prev.maxClassXp) {
            newClassLevel++;
            newClassXp -= prev.maxClassXp;
         }

         return { 
             ...prev, 
             level: newLevel, 
             xp: newXp, 
             maxXp: newMaxXp,
             classLevel: newClassLevel,
             classXp: newClassXp,
             gold: prev.gold + (actualXp / 2),
             streak: prev.streak + 1, // Increment global streak
             // Mock history update (push true, remove first)
             history: [...prev.history.slice(1), true]
         };
     });
     
     // Trust update
     if(status === VerificationStatus.VERIFIED) {
         setProfile(prev => ({ ...prev, trustScore: Math.min(100, prev.trustScore + 0.5) }));
     } else if (status === VerificationStatus.SOFT_APPROVE) {
         // Slight trust hit for soft approve (suspicious but allowed)
         setProfile(prev => ({ ...prev, trustScore: Math.max(0, prev.trustScore - 1) }));
     }
     setVerificationHabit(null);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: user.name || 'Me',
      text: chatInput,
      timestamp: Date.now(),
      channel: chatChannel
    };
    setChatLog([...chatLog, newMsg]);
    setChatInput('');
  };

  // --- Renderers ---

  const renderProfile = () => (
      <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {/* Left Column: Identity & Stats */}
          <div className="space-y-6">
              {/* Identity Card */}
              <div className={`bg-axiom-800 border ${user.isPro ? 'border-axiom-gold shadow-[0_0_20px_rgba(251,191,36,0.1)]' : 'border-slate-700'} rounded-xl p-6 text-center relative overflow-hidden`}>
                   {user.isPro && <div className="absolute top-0 right-0 p-2"><Crown className="w-5 h-5 text-axiom-gold" /></div>}
                   <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-4xl border-2 border-axiom-accent relative z-10 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                       {user.avatar}
                   </div>
                   <h2 className="text-2xl font-display font-bold text-white">{user.name}</h2>
                   <p className="text-axiom-accent font-mono text-sm uppercase tracking-widest mb-4">{user.classType}</p>
                   
                   <div className="grid grid-cols-2 gap-4 text-left bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Social Rank</div>
                           <div className={`text-xl font-bold ${getRankColor(user.socialRank)}`}>{user.socialRank}</div>
                       </div>
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Trust Score</div>
                           <div className={`text-xl font-bold ${profile.trustScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{profile.trustScore.toFixed(0)}%</div>
                       </div>
                   </div>
              </div>

              {/* Stat Radar */}
              <div className="bg-axiom-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Attribute Matrix</h3>
                  <StatRadar attributes={user.attributes} />
              </div>
          </div>

          {/* Right Column: Skills & Details */}
          <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <div className="bg-axiom-800 border border-slate-700 rounded-xl p-6">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-display font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-axiom-gold" /> Active Skills</h3>
                       <span className="text-xs text-slate-500 uppercase font-bold">{user.unlockedSkills.length} Unlocked</span>
                   </div>
                   
                   {user.unlockedSkills.length > 0 ? (
                       <div className="grid md:grid-cols-2 gap-4">
                           {user.unlockedSkills.map(skill => (
                               <div key={skill.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg hover:border-axiom-gold/50 transition-colors group">
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-white group-hover:text-axiom-gold transition-colors">{skill.name}</h4>
                                       <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{skill.type}</span>
                                   </div>
                                   <p className="text-sm text-slate-400 mb-4">{skill.description}</p>
                                   <button 
                                      onClick={() => handleUseSkill(skill.id)}
                                      className="w-full py-2 bg-slate-800 hover:bg-axiom-gold hover:text-black text-slate-300 rounded text-xs font-bold uppercase tracking-wider transition-all"
                                   >
                                      Activate
                                   </button>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
                           <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                           <p>No skills acquired.</p>
                           <button onClick={() => setActiveTab('marketplace')} className="text-axiom-accent text-sm font-bold hover:underline mt-2">Visit Marketplace</button>
                       </div>
                   )}
              </div>

              {/* Bio & Settings */}
              <div className="bg-axiom-800 border border-slate-700 rounded-xl p-6">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Neural Configuration</h3>
                   <div className="space-y-4">
                       <div>
                           <label className="text-xs text-slate-500 uppercase block mb-1">Directives (Goals)</label>
                           <div className="flex flex-wrap gap-2">
                               {profile.goals.length > 0 ? profile.goals.map((g, i) => (
                                   <span key={i} className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-sm text-slate-300">{g}</span>
                               )) : <span className="text-sm text-slate-600 italic">No directives set.</span>}
                           </div>
                       </div>
                       <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                            <span className="text-sm text-slate-400">Public Profile Visibility</span>
                            <div className="w-10 h-6 bg-axiom-accent rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                       </div>
                   </div>
              </div>
          </div>
      </div>
  );

  const renderMarketplace = () => (
      <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* Marketplace Header / Wallet */}
          <div className="bg-axiom-800 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-xl">
               <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-axiom-accent" /> Marketplace</h2>
                  <p className="text-slate-400 text-sm">Acquire tools to optimize your existence.</p>
               </div>
               <div className="flex gap-4">
                   <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
                       <div className="text-right">
                           <div className="text-[10px] uppercase text-cyan-500 font-bold">Credits</div>
                           <div className="text-xl font-bold text-white leading-none">{user.credits}</div>
                       </div>
                       <Coins className="w-8 h-8 text-cyan-500 opacity-20" />
                   </div>
                   <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
                       <div className="text-right">
                           <div className="text-[10px] uppercase text-axiom-gold font-bold">Gold</div>
                           <div className="text-xl font-bold text-white leading-none">{user.gold}</div>
                       </div>
                       <Gem className="w-8 h-8 text-axiom-gold opacity-20" />
                   </div>
               </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
             {(['ALL', 'SKILL', 'COSMETIC', 'PREMIUM'] as const).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setMarketTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${marketTab === tab ? 'bg-white text-axiom-900' : 'bg-axiom-800 text-slate-400 hover:text-white'}`}
                 >
                    {tab === 'PREMIUM' ? <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-axiom-gold" /> PRO MODE</span> : tab}
                 </button>
             ))}
          </div>

          {/* Banner for Pro Mode */}
          {!user.isPro && (marketTab === 'ALL' || marketTab === 'PREMIUM') && (
               <div className="bg-gradient-to-r from-yellow-900/40 to-axiom-900 border border-yellow-600/30 rounded-xl p-6 relative overflow-hidden group">
                   <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-yellow-500/10 to-transparent"></div>
                   <div className="relative z-10">
                       <h3 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2"><Crown className="w-6 h-6 text-yellow-400" /> AXIOM PRO</h3>
                       <ul className="text-sm text-slate-300 mb-4 space-y-1">
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Double Daily XP & Gold Caps</li>
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Exclusive "Void" Neural Theme</li>
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Elite Profile Badge</li>
                       </ul>
                       <button 
                         onClick={() => {
                             const proItem = marketItems.find(i => i.type === 'PREMIUM');
                             if(proItem) handleBuyItem(proItem);
                         }}
                         className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg transition-colors"
                       >
                           Unlock for 5000 Credits
                       </button>
                   </div>
               </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketItems.filter(i => marketTab === 'ALL' || i.type === marketTab || (marketTab === 'PREMIUM' && i.type === 'PREMIUM')).map(item => {
                  const canBuyLevel = user.level >= item.reqLevel;
                  const canBuyTrust = profile.trustScore >= item.reqTrust;
                  const canBuyCost = item.currency === 'CREDITS' ? user.credits >= item.cost : user.gold >= item.cost;
                  const locked = !canBuyLevel || !canBuyTrust;

                  return (
                      <div key={item.id} className={`bg-axiom-800 border ${item.purchased ? 'border-emerald-500/50' : item.type === 'PREMIUM' ? 'border-yellow-500/30' : 'border-slate-700'} rounded-xl p-6 relative group overflow-hidden flex flex-col`}>
                           {locked && (
                               <div className="absolute inset-0 bg-axiom-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                                   <Lock className="w-8 h-8 text-slate-500 mb-2" />
                                   <p className="text-xs text-slate-400 font-bold uppercase">Locked</p>
                                   {!canBuyLevel && <div className="text-xs text-red-400">Req. Level {item.reqLevel}</div>}
                                   {!canBuyTrust && <div className="text-xs text-red-400">Req. Trust {item.reqTrust}%</div>}
                               </div>
                           )}
                           <div className="flex justify-between items-start mb-4">
                               <div className="text-4xl">{item.icon}</div>
                               <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${item.type === 'PREMIUM' ? 'border-yellow-500/30 text-yellow-500' : 'border-slate-600 text-slate-400'}`}>
                                   {item.type}
                               </div>
                           </div>
                           <div className="flex-1">
                               <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                               <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                           </div>
                           
                           <div className="flex items-center justify-between mt-auto">
                               <div className="text-sm font-bold flex items-center gap-1 text-white">
                                   {item.currency === 'CREDITS' ? <Coins className="w-4 h-4 text-cyan-400" /> : <Gem className="w-4 h-4 text-axiom-gold" />}
                                   {item.cost}
                               </div>
                               {item.purchased ? (
                                   <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Owned</span>
                               ) : (
                                   <button 
                                      onClick={() => handleBuyItem(item)}
                                      disabled={locked || !canBuyCost}
                                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${canBuyCost ? 'bg-axiom-accent text-white hover:bg-blue-600' : 'bg-slate-700 text-slate-500'}`}
                                   >
                                       Purchase
                                   </button>
                               )}
                           </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );

  const renderSocial = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Social Navigation */}
      <div className="flex gap-4 border-b border-slate-700 pb-2">
        {['guild', 'allies', 'leaderboard'].map(tab => (
           <button 
             key={tab}
             onClick={() => setSocialTab(tab as any)}
             className={`px-4 py-2 font-bold uppercase text-sm tracking-wider transition-colors ${socialTab === tab ? 'text-axiom-accent border-b-2 border-axiom-accent' : 'text-slate-500 hover:text-white'}`}
           >
             {tab}
           </button>
        ))}
      </div>

      {/* GUILD TAB */}
      {socialTab === 'guild' && (
        <div className="grid lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              {/* Guild Header */}
              <div className="bg-axiom-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-32 h-32" /></div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h2 className="text-3xl font-display font-bold text-white">{guild.name}</h2>
                          <p className="text-slate-400">{guild.description}</p>
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-bold text-white">{guild.members.length}/{guild.capacity}</div>
                          <div className="text-xs uppercase text-slate-500">Members</div>
                       </div>
                    </div>
                    
                    {/* Trust Pool */}
                    <div className="bg-slate-900/50 rounded-lg p-4 flex items-center gap-4 border border-slate-800">
                       <Shield className={`w-8 h-8 ${guild.trustPool > 80 ? 'text-emerald-400' : 'text-yellow-400'}`} />
                       <div className="flex-1">
                          <div className="flex justify-between mb-1">
                             <span className="text-sm font-bold text-slate-300">Guild Trust Pool</span>
                             <span className="text-sm font-bold text-white">{guild.trustPool}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                             <div className={`h-full ${guild.trustPool > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${guild.trustPool}%` }}></div>
                          </div>
                       </div>
                    </div>

                    {/* Active Perks */}
                    <div className="mt-4 flex gap-2">
                        {guild.perks.filter(p => p.active).map((p, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-axiom-accent/10 text-axiom-accent border border-axiom-accent/30">
                                {p.label} Active
                            </span>
                        ))}
                    </div>
                 </div>
              </div>

              {/* Objectives */}
              <div>
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-red-400" /> Active Directives</h3>
                 <div className="space-y-3">
                    {guild.objectives.map(obj => (
                       <div key={obj.id} className="bg-axiom-800 border border-slate-700 p-4 rounded-xl">
                          <div className="flex justify-between mb-2">
                             <span className="font-bold text-white">{obj.description}</span>
                             <span className="text-xs text-axiom-gold border border-axiom-gold/30 px-2 py-0.5 rounded">Reward: {obj.reward}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                             <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${(obj.current / obj.target) * 100}%` }}></div>
                             </div>
                             <span>{obj.current}/{obj.target} {obj.unit}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Guild Chat */}
              <div className="bg-axiom-800 border border-slate-700 rounded-xl h-[400px] flex flex-col">
                 <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Guild Comms</span>
                    <span className="text-xs text-slate-600 uppercase">Secure Channel</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatLog.filter(m => m.channel === 'GUILD').map(msg => (
                       <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.senderId === 'me' ? 'bg-axiom-accent text-white' : 'bg-slate-700 text-slate-200'}`}>
                             {msg.senderId !== 'me' && <div className="text-xs opacity-50 mb-1">{msg.senderName}</div>}
                             {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-600 mt-1">Just now</span>
                       </div>
                    ))}
                    <div ref={chatEndRef}></div>
                 </div>
                 <div className="p-3 border-t border-slate-700 flex gap-2">
                    <input 
                      className="flex-1 bg-axiom-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-axiom-accent"
                      placeholder="Transmission..."
                      value={chatInput}
                      onChange={e => { setChatInput(e.target.value); setChatChannel('GUILD'); }}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} className="p-2 bg-slate-700 hover:bg-axiom-accent text-white rounded transition-colors"><Send className="w-4 h-4" /></button>
                 </div>
              </div>
           </div>

           {/* Sidebar: Members */}
           <div className="space-y-6">
              <div className="bg-axiom-800 border border-slate-700 rounded-xl p-4">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Roster</h3>
                 <div className="space-y-3">
                    {guild.members.map(m => (
                       <div key={m.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                             <div className="text-xl">{m.avatar}</div>
                             <div>
                                <div className="text-sm font-bold text-white group-hover:text-axiom-accent transition-colors">{m.name}</div>
                                <div className="text-[10px] text-slate-500">{m.classType} • {m.isOnline ? 'Online' : 'Offline'}</div>
                             </div>
                          </div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRankColor(m.rank)}`}>{m.rank}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ALLIES TAB */}
      {socialTab === 'allies' && (
         <div className="grid md:grid-cols-2 gap-6">
             {MOCK_FRIENDS.map(f => (
                <div key={f.id} className="bg-axiom-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between group hover:border-axiom-accent transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-2xl border border-slate-700">
                           {f.avatar}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white">{f.name}</h3>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${f.type === FriendType.MENTOR ? 'bg-purple-900 text-purple-300' : f.type === FriendType.RIVAL ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
                                 {f.type}
                              </span>
                           </div>
                           <p className="text-xs text-slate-400 mt-1">{f.classType} • Rank {f.rank}</p>
                        </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white"><MessageSquare className="w-5 h-5" /></button>
                </div>
             ))}
             <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors cursor-pointer min-h-[100px]">
                 <UserPlus className="w-8 h-8 mb-2" />
                 <span className="text-sm font-bold">Add Ally</span>
             </div>
         </div>
      )}

      {/* LEADERBOARD TAB */}
      {socialTab === 'leaderboard' && (
         <div className="bg-axiom-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 bg-slate-900/50 border-b border-slate-700 text-center">
               <h3 className="text-2xl font-display font-bold text-white">Global Hierarchy</h3>
               <p className="text-slate-400 text-sm mt-1">Rank represents reliability, not grind.</p>
            </div>
            <div className="divide-y divide-slate-700">
               {MOCK_LEADERBOARD.map((entry, idx) => (
                  <div key={entry.id} className={`p-4 flex items-center justify-between ${entry.name === 'You' ? 'bg-axiom-accent/10' : ''}`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 flex items-center justify-center font-display font-bold ${idx < 3 ? 'text-axiom-gold text-xl' : 'text-slate-500'}`}>
                            {idx + 1}
                         </div>
                         <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl">
                            {entry.avatar}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-white">{entry.name}</span>
                               {entry.isFriend && <Users className="w-3 h-3 text-slate-500" />}
                            </div>
                            <div className="text-xs text-slate-400">{entry.title} • {entry.classType}</div>
                         </div>
                      </div>
                      <div className={`text-xl font-display font-bold ${getRankColor(entry.rank)}`}>
                         {entry.rank}
                      </div>
                  </div>
               ))}
            </div>
         </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-axiom-900 text-slate-200 font-sans selection:bg-axiom-accent selection:text-white overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-700 bg-axiom-800 sticky top-0 z-30">
            <div className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center font-bold text-white text-xs">A</div>
                AXIOM
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-axiom-900/95 lg:hidden flex flex-col p-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-8"><span className="font-display font-bold text-2xl text-white">Menu</span><button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button></div>
                <nav className="space-y-4">
                    <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="w-full text-left text-xl font-bold text-slate-500">Dashboard</button>
                    <button onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }} className="w-full text-left text-xl font-bold text-slate-500">Marketplace</button>
                    <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className="w-full text-left text-xl font-bold text-slate-500">Identity</button>
                    <button onClick={() => { setActiveTab('social'); setMobileMenuOpen(false); }} className="w-full text-left text-xl font-bold text-slate-500">Social Hub</button>
                </nav>
            </div>
        )}

        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col w-64 border-r border-slate-700 bg-axiom-900 p-6">
                <div className="mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">A</div>
                    <h1 className="font-display font-bold text-2xl text-white tracking-tight">AXIOM</h1>
                </div>
                <nav className="space-y-2 flex-1">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'dashboard' ? 'bg-axiom-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-axiom-800/50'}`}><Activity className="w-5 h-5" /> Dashboard</button>
                    <button onClick={() => setActiveTab('marketplace')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'marketplace' ? 'bg-axiom-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-axiom-800/50'}`}><ShoppingBag className="w-5 h-5" /> Marketplace</button>
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-axiom-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-axiom-800/50'}`}><Fingerprint className="w-5 h-5" /> Identity</button>
                    <button onClick={() => setActiveTab('social')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'social' ? 'bg-axiom-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-axiom-800/50'}`}><Users className="w-5 h-5" /> Social Hub</button>
                </nav>
                
                {/* Job Change Notification */}
                {user.jobChangeStatus === JobChangeStatus.AVAILABLE && (
                    <button onClick={() => setShowJobModal(true)} className="w-full bg-axiom-gold/10 border border-axiom-gold text-axiom-gold p-3 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse hover:bg-axiom-gold hover:text-black transition-all">
                       Ascension Available
                    </button>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-axiom-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
                    {activeTab === 'dashboard' && <div className="space-y-6">
                        
                        {/* 1. Streak Widget (NEW) */}
                        <StreakWidget streak={user.streak} longest={user.longestStreak} history={user.history} />

                        {/* 2. Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="col-span-2 bg-axiom-800 p-4 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
                               <div className="flex justify-between items-start mb-2 relative z-10">
                                  <div>
                                      <h3 className="font-display font-bold text-white text-lg flex items-center">
                                          {user.name} <span className="ml-2 text-sm text-slate-400">({user.socialRank})</span>
                                          {user.isPro && <Crown className="w-4 h-4 text-axiom-gold ml-2" />}
                                      </h3>
                                      <div className="flex flex-col gap-1 mt-1">
                                           <div className="flex items-center gap-2">
                                               <span className="text-xs text-white font-bold w-12">Global</span>
                                               <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-24">
                                                   <div className="bg-axiom-accent h-full" style={{ width: `${(user.xp / user.maxXp) * 100}%` }}></div>
                                               </div>
                                               <span className="text-[10px] text-slate-400">Lvl {user.level}</span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                               <span className="text-xs text-purple-400 font-bold w-12">{user.classType}</span>
                                               <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-24">
                                                   <div className="bg-purple-500 h-full" style={{ width: `${(user.classXp / user.maxClassXp) * 100}%` }}></div>
                                               </div>
                                               <span className="text-[10px] text-slate-400">CL {user.classLevel}</span>
                                           </div>
                                      </div>
                                  </div>
                                  <div className="text-right text-3xl mb-1">{user.avatar}</div>
                               </div>
                               <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center relative z-10">
                                   <span className={`text-xs font-bold flex items-center gap-1 ${profile.trustScore > 80 ? 'text-emerald-400' : profile.trustScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      <Shield className="w-3 h-3" /> Trust: {profile.trustScore.toFixed(0)}%
                                   </span>
                                   <span className="text-[10px] text-slate-500">Daily Cap: {user.dailyEarnings.xp}/{currentDailyCaps.XP} XP</span>
                               </div>
                           </div>
                           <div className="bg-axiom-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
                               <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Credits</div>
                               <div className="text-2xl font-display font-bold text-cyan-400 flex items-center gap-2"><Coins className="w-5 h-5" /> {user.credits}</div>
                           </div>
                           <div className="bg-axiom-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
                               <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Gold</div>
                               <div className="text-2xl font-display font-bold text-axiom-gold flex items-center gap-2"><Gem className="w-5 h-5" /> {user.gold}</div>
                           </div>
                        </div>
                        
                        {/* 3. Daily Operations */}
                         <div className="space-y-3">
                            <h2 className="text-xl font-display font-bold text-white">Daily Operations</h2>
                            {habits.map(habit => (
                               <div key={habit.id} className={`group relative overflow-hidden bg-axiom-800 border ${habit.completed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700 hover:border-axiom-accent'} p-4 rounded-xl transition-all duration-300`}>
                                   {/* Trial Visual */}
                                   {habit.id.startsWith('trial') && (
                                       <div className="absolute top-0 right-0 bg-axiom-gold text-black text-[10px] font-bold px-2 py-0.5 z-20">TRIAL OBJECTIVE</div>
                                   )}
                                   <div className="flex items-center justify-between z-10 relative">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => !habit.completed && setVerificationHabit(habit)} className={`rounded-full p-2 ${habit.completed ? 'text-emerald-400' : 'text-slate-600 hover:text-white'}`}>
                                                {habit.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                            </button>
                                            <div>
                                                <h4 className={`font-medium ${habit.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{habit.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 text-slate-400 border-slate-700`}>{habit.stat} +1</span>
                                                    {habit.id.startsWith('trial') && <span className="text-xs text-axiom-gold">Crucial</span>}
                                                </div>
                                            </div>
                                        </div>
                                   </div>
                               </div>
                            ))}
                            <button onClick={() => setShowQuestModal(true)} className="w-full py-3 bg-axiom-700/50 hover:bg-axiom-700 text-slate-300 rounded-xl border border-dashed border-slate-600 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Protocol</button>
                         </div>
                    </div>}
                    
                    {activeTab === 'marketplace' && renderMarketplace()}
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'social' && renderSocial()}
                </div>
            </main>
        </div>

        {/* Modals */}
        {showQuestModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-axiom-800 p-6 rounded-xl max-w-md w-full">
                    <h3 className="text-xl font-bold text-white mb-4">Generate Quest Chain</h3>
                    <p className="text-slate-400 mb-6">Oracle is analyzing your goals...</p>
                    <button 
                        onClick={async () => {
                            const result = await generateQuestFromGoal("General Improvement", profile, user.classType);
                            if(result) {
                                const newHabits = result.habits.map((h, i) => ({ 
                                    id: Date.now().toString()+i, title: h.title, difficulty: h.difficulty, stat: h.stat, completed: false, streak: 0, verificationMethod: h.verificationMethod 
                                }));
                                setHabits(prev => [...prev, ...newHabits]);
                                setShowQuestModal(false);
                            }
                        }}
                        className="w-full bg-axiom-accent py-3 rounded font-bold text-white"
                    >
                        Confirm Generation
                    </button>
                    <button onClick={() => setShowQuestModal(false)} className="w-full mt-2 text-slate-500">Cancel</button>
                </div>
            </div>
        )}
        
        {showJobModal && <JobChangeModal onClose={() => setShowJobModal(false)} onStartTrial={handleStartTrial} />}
        {verificationHabit && <VerificationModal habit={verificationHabit} userProfile={profile} onClose={() => setVerificationHabit(null)} onVerify={finalizeHabitCompletion} />}
        {!onboardingComplete && <div className="fixed inset-0 z-[100] bg-axiom-900"><Onboarding onComplete={handleOnboardingComplete} /></div>}
    </div>
  );
}