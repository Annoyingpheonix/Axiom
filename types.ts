
export enum ClassType {
  NEOPHYTE = 'Neophyte',
  
  // Analyst (NT)
  STRATEGIST = 'Strategist',   // INTJ
  ANALYST = 'Analyst',         // INTP
  COMMANDER = 'Commander',     // ENTJ
  INNOVATOR = 'Innovator',     // ENTP
  
  // Diplomat (NF)
  MENTOR = 'Mentor',           // INFJ
  SCHOLAR = 'Scholar',         // INFP
  AMBASSADOR = 'Ambassador',   // ENFJ
  ENCHANTER = 'Enchanter',     // ENFP
  
  // Sentinel (SJ)
  SENTINEL = 'Sentinel',       // ISTJ
  WARDEN = 'Warden',           // ISFJ
  MARSHAL = 'Marshal',         // ESTJ
  STEWARD = 'Steward',         // ESFJ
  
  // Explorer (SP)
  RANGER = 'Ranger',           // ISTP
  ADEPT = 'Adept',             // ISFP
  VANGUARD = 'Vanguard',       // ESTP
  VOYAGER = 'Voyager'          // ESFP
}

export enum Archetype {
  ANALYST = 'Analyst',
  DIPLOMAT = 'Diplomat',
  SENTINEL = 'Sentinel',
  EXPLORER = 'Explorer',
  NEOPHYTE = 'Neophyte'
}

export enum StatType {
  STR = 'STR', // Physical
  INT = 'INT', // Mental
  DEX = 'DEX', // Productivity/Speed
  CHA = 'CHA'  // Social/Wellness
}

export enum SkillRank {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
  UNIQUE = 'Unique'
}

export enum SkillType {
  PASSIVE = 'PASSIVE',
  ACTIVE = 'ACTIVE',
  API = 'API'
}

export enum SocialRank {
  G = 'G',
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  SS = 'SS',
  SSS = 'SSS'
}

export enum FriendType {
  ALLY = 'ALLY',
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
  RIVAL = 'RIVAL'
}

export enum JobChangeStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_TRIAL = 'IN_TRIAL',
  COMPLETE = 'COMPLETE'
}

export enum VerificationMethod {
  AUTO_CONFIRM = 'AUTO_CONFIRM', // Trivial tasks
  TEXT_REFLECTION = 'TEXT_REFLECTION', // Journaling, thoughts
  GPS_CHECK = 'GPS_CHECK', // (Mock) Location based
  PHOTO_EVIDENCE = 'PHOTO_EVIDENCE', // (Mock) Image upload
  METADATA_CHECK = 'METADATA_CHECK' // (Mock) File timestamps
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SOFT_APPROVE = 'SOFT_APPROVE' // Delayed payout, flagged
}

export interface UserProfile {
  goals: string[]; // Structured + Free text
  constraints: string[]; // e.g., "No gym access", "Morning only"
  bio: string;
  trustScore: number; // 0-100
  behavioralEmbedding?: string; // (Mock) Represents the 'fingerprint'
  privacySettings: {
    shareStats: boolean;
    shareActivity: boolean;
    allowBehavioralAnalysis: boolean;
  };
}

export interface AgentConfig {
  id: string;
  role: 'QUEST' | 'VERIFICATION';
  name: string;
  tone: 'STRICT' | 'ENCOURAGING' | 'STOIC' | 'CHAOTIC';
  visualTheme: 'CYBER' | 'FANTASY' | 'MINIMAL';
  avatarId: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  rank: SkillRank;
  progress: number; // 0-100 to next rank
  cost: number;
  reqLevel: number; // Global Level
  reqClassLevel: number;
  reqTrust: number;
  classType?: ClassType; // If undefined, it is Universal
  apiIntegrationId?: string; // ID of the real-world API
  cooldownEnd?: number; // Timestamp
  cooldownDuration?: number; // MS
  effect: {
    type: 'XP_BOOST' | 'GOLD_BOOST' | 'DEFENSE' | 'STREAK_SAVE' | 'STAT_BOOST' | 'API_ACTION';
    value: number;
    statTarget?: StatType;
  };
}

export interface MarketplaceItem {
  id: string;
  type: 'SKILL' | 'COSMETIC' | 'INTEGRATION' | 'PREMIUM';
  name: string;
  description: string;
  cost: number;
  currency: 'CREDITS' | 'GOLD';
  reqLevel: number;
  reqTrust: number;
  icon: string;
  purchased: boolean;
}

export interface Friend {
  id: string;
  name: string;
  level: number; // Hidden in UI, used for sorting
  classType: ClassType;
  isOnline: boolean;
  lastSeen: string;
  avatar: string;
  type: FriendType;
  rank: SocialRank;
  guildId?: string;
}

export interface GuildObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  reward: string; // Cosmetic or Buff description
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  members: Friend[];
  capacity: number;
  trustPool: number; // Average Trust Score (0-100)
  objectives: GuildObjective[];
  perks: {
    label: string;
    active: boolean;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  channel: 'DM' | 'GUILD';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  classType: ClassType;
  rank: SocialRank; // G-SS
  title: string;
  avatar: string;
  isFriend: boolean;
}

export interface UserStats {
  level: number; // Global Level (Cap 100)
  xp: number;
  maxXp: number;
  
  classLevel: number; // Class specific level
  classXp: number;
  maxClassXp: number;

  health: number;
  maxHealth: number;
  streak: number;
  longestStreak: number;
  history: boolean[]; // Last 7 days, true = active
  
  classType: ClassType;
  attributes: Record<StatType, number>;
  gold: number; // In-game currency
  credits: number; // Marketplace currency (off-chain token)
  
  socialRank: SocialRank;
  rankScore: number; // Internal composite score (hidden)
  jobChangeStatus: JobChangeStatus;

  dailyEarnings: {
    gold: number;
    xp: number;
    credits: number;
    lastReset: number;
  };

  skillPoints: number;
  unlockedSkills: Skill[]; // Full skill objects
  guildId?: string;
  isPro: boolean;
  name?: string;
  avatar?: string;
  agents: AgentConfig[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  stat: StatType;
  completed: boolean;
  streak: number;
  verificationMethod: VerificationMethod;
  verificationStatus?: VerificationStatus;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goldReward: number;
  isDaily: boolean;
  habits: Habit[];
}

export interface GeneratedQuestData {
  title: string;
  description: string;
  habits: {
    title: string;
    stat: StatType;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    verificationMethod: VerificationMethod;
    estimatedTimeMin: number;
  }[];
}

export interface VerificationResult {
  fraudScore: number; // 0-100
  confidence: number; // 0-100
  status: VerificationStatus;
  notes: string; // Internal agent notes
}
