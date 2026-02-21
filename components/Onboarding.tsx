import React, { useState } from 'react';
import { Shield, Brain, Zap, Users, ArrowRight, Check, Activity, Cpu, Fingerprint, Star } from 'lucide-react';
import { ClassType, StatType, UserStats } from '../types';

interface OnboardingProps {
  onComplete: (data: Partial<UserStats>) => void;
}

type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

const QUESTIONS = [
  {
    id: 1,
    dimensionPair: ['I', 'E'],
    text: "How do you recharge your energy?",
    options: [
      { text: "Solitude, reflection, and inner worlds.", value: 'I' },
      { text: "Social interaction, action, and external stimuli.", value: 'E' },
    ]
  },
  {
    id: 2,
    dimensionPair: ['S', 'N'],
    text: "How do you process information?",
    options: [
      { text: "I focus on facts, details, and what is real.", value: 'S' },
      { text: "I focus on concepts, patterns, and possibilities.", value: 'N' },
    ]
  },
  {
    id: 3,
    dimensionPair: ['T', 'F'],
    text: "How do you make decisions?",
    options: [
      { text: "Logic, objective analysis, and efficiency.", value: 'T' },
      { text: "Values, harmony, and impact on people.", value: 'F' },
    ]
  },
  {
    id: 4,
    dimensionPair: ['J', 'P'],
    text: "How do you approach tasks?",
    options: [
      { text: "Structured, planned, and decisive.", value: 'J' },
      { text: "Flexible, spontaneous, and open-ended.", value: 'P' },
    ]
  }
];

const AVATARS = ['👤', '🤖', '🦊', '⚡', '🛡️', '🧠', '🔮', '⚔️'];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=Identity, 2=Test, 3=Result
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [answers, setAnswers] = useState<Dimension[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const getClassFromMBTI = (mbti: string): ClassType => {
    switch (mbti) {
        // Analysts (NT)
        case 'INTJ': return ClassType.STRATEGIST;
        case 'INTP': return ClassType.ANALYST;
        case 'ENTJ': return ClassType.COMMANDER;
        case 'ENTP': return ClassType.INNOVATOR;
        // Diplomats (NF)
        case 'INFJ': return ClassType.MENTOR;
        case 'INFP': return ClassType.SCHOLAR;
        case 'ENFJ': return ClassType.AMBASSADOR;
        case 'ENFP': return ClassType.ENCHANTER;
        // Sentinels (SJ)
        case 'ISTJ': return ClassType.SENTINEL;
        case 'ISFJ': return ClassType.WARDEN;
        case 'ESTJ': return ClassType.MARSHAL;
        case 'ESFJ': return ClassType.STEWARD;
        // Explorers (SP)
        case 'ISTP': return ClassType.RANGER;
        case 'ISFP': return ClassType.ADEPT;
        case 'ESTP': return ClassType.VANGUARD;
        case 'ESFP': return ClassType.VOYAGER;
        default: return ClassType.NEOPHYTE;
    }
  };

  const getClassDetails = (c: ClassType) => {
      // Short descriptions based on prompt
      const details: Record<string, { desc: string, bonus: string, stat: StatType }> = {
          [ClassType.STRATEGIST]: { desc: "Long-term architect of systems. Gains bonus XP from completed arcs.", bonus: "Reduced XP Decay", stat: StatType.INT },
          [ClassType.ANALYST]: { desc: "Master of understanding. Gains XP from research and optimization.", bonus: "Experimentation Efficiency", stat: StatType.INT },
          [ClassType.COMMANDER]: { desc: "Leader of vision. Gains XP from coordination and completion.", bonus: "Guild Synergy", stat: StatType.CHA },
          [ClassType.INNOVATOR]: { desc: "Chaos-engine of ideas. Gains XP from variety and novelty.", bonus: "Anti-Burnout", stat: StatType.INT },
          
          [ClassType.MENTOR]: { desc: "Quiet guide. Gains XP from consistency and helping others.", bonus: "Strong Recovery", stat: StatType.INT },
          [ClassType.SCHOLAR]: { desc: "Values-driven seeker. Gains XP from alignment-based quests.", bonus: "Solo Performance", stat: StatType.INT },
          [ClassType.AMBASSADOR]: { desc: "Social catalyst. Gains XP from engagement and influence.", bonus: "Social Multiplier", stat: StatType.CHA },
          [ClassType.ENCHANTER]: { desc: "Inspirational spark. Gains XP from creative output.", bonus: "Early Momentum", stat: StatType.CHA },

          [ClassType.SENTINEL]: { desc: "The unbreakable foundation. Gains XP from routines and reliability.", bonus: "Streak Mastery", stat: StatType.STR },
          [ClassType.WARDEN]: { desc: "Protector of systems. Gains XP from maintenance and support.", bonus: "Support Sustain", stat: StatType.STR },
          [ClassType.MARSHAL]: { desc: "Enforcer of order. Gains XP from completion and deadlines.", bonus: "PvP Efficiency", stat: StatType.STR },
          [ClassType.STEWARD]: { desc: "Social stabilizer. Gains XP from community upkeep.", bonus: "Group Buffs", stat: StatType.CHA },

          [ClassType.RANGER]: { desc: "Tactical problem-solver. Gains XP from challenges and efficiency.", bonus: "High Difficulty XP", stat: StatType.DEX },
          [ClassType.ADEPT]: { desc: "Precision artisan. Gains XP from skill quality and flow.", bonus: "Skill Mastery", stat: StatType.DEX },
          [ClassType.VANGUARD]: { desc: "High-risk executor. Gains XP from intensity and bold actions.", bonus: "Burst XP", stat: StatType.DEX },
          [ClassType.VOYAGER]: { desc: "Experiential maximizer. Gains XP from participation and variety.", bonus: "Event Bonuses", stat: StatType.DEX },
          
          [ClassType.NEOPHYTE]: { desc: "The unwritten page.", bonus: "None", stat: StatType.STR }
      };
      return details[c] || details[ClassType.NEOPHYTE];
  };

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, val as Dimension];
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep(3);
    }
  };

  const handleFinish = () => {
    const mbti = answers.join('');
    const determinedClass = getClassFromMBTI(mbti);
    const details = getClassDetails(determinedClass);
    
    // Calculate starting stats based on class main stat
    const initialAttributes = {
      [StatType.STR]: 8,
      [StatType.INT]: 8,
      [StatType.DEX]: 8,
      [StatType.CHA]: 8,
    };
    
    // Bonus to main stat
    initialAttributes[details.stat] = 12;

    onComplete({
      name,
      avatar,
      classType: determinedClass,
      attributes: initialAttributes,
      health: 100,
      maxHealth: 100,
    });
  };

  return (
    <div className="min-h-screen bg-axiom-900 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-2xl w-full bg-axiom-800 border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="font-mono text-xs text-slate-500">AXIOM_INIT_SEQ_V2.0 // PSYCH_EVAL</div>
        </div>

        <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-axiom-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-axiom-accent">
                            <Fingerprint className="w-8 h-8 text-axiom-accent" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white">Identity Calibration</h2>
                        <p className="text-slate-400 mt-2">Establish your unique signature in the AXIOM network.</p>
                    </div>

                    <div className="space-y-6 max-w-sm mx-auto w-full">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Designation (Username)</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-axiom-900 border border-slate-700 rounded-lg p-3 text-white focus:border-axiom-accent focus:outline-none font-mono"
                                placeholder="Enter codename..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Avatar Signature</label>
                            <div className="grid grid-cols-4 gap-2">
                                {AVATARS.map(a => (
                                    <button 
                                        key={a}
                                        onClick={() => setAvatar(a)}
                                        className={`text-2xl p-3 rounded-lg border transition-all ${avatar === a ? 'bg-axiom-accent/20 border-axiom-accent' : 'bg-axiom-900 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={() => name.trim() && setStep(2)}
                            disabled={!name.trim()}
                            className="w-full bg-axiom-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Begin Psychometric Eval <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: ANALYSIS (MBTI) */}
            {step === 2 && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="mb-8 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-axiom-accent">
                             <Activity className="w-5 h-5 animate-pulse" />
                             <span className="font-mono text-sm">CALIBRATING NEURAL ARCHETYPE...</span>
                         </div>
                         <div className="font-mono text-slate-500 text-sm">
                             {currentQuestionIndex + 1}/{QUESTIONS.length}
                         </div>
                    </div>

                    <h3 className="text-2xl font-display font-bold text-white mb-8">
                        {QUESTIONS[currentQuestionIndex].text}
                    </h3>

                    <div className="space-y-4">
                        {QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option.value)}
                                className="w-full text-left p-6 rounded-xl border border-slate-700 bg-axiom-900/50 hover:bg-axiom-700 hover:border-axiom-accent transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300 text-lg group-hover:text-white transition-colors">{option.text}</span>
                                    <div className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-axiom-accent"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: DESIGNATION (RESULT) */}
            {step === 3 && (
                <div className="flex-1 flex flex-col justify-center text-center animate-in zoom-in-95 duration-700">
                    {(() => {
                        const mbti = answers.join('');
                        const cls = getClassFromMBTI(mbti);
                        const details = getClassDetails(cls);
                        
                        return (
                            <>
                                <div className="w-24 h-24 mx-auto mb-6 bg-axiom-900 rounded-full flex items-center justify-center border-4 border-axiom-gold shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                                    <Star className="w-12 h-12 text-axiom-gold" />
                                </div>

                                <h2 className="text-sm font-mono text-axiom-gold mb-2 tracking-[0.2em] uppercase">Archetype Detected: {mbti}</h2>
                                <h1 className="text-4xl font-display font-bold text-white mb-4">
                                    You are a <span className="text-axiom-accent">{cls}</span>
                                </h1>
                                
                                <p className="text-slate-300 max-w-md mx-auto leading-relaxed mb-6 bg-axiom-900 p-4 rounded border border-slate-700">
                                    {details.desc}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                                    <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                        <div className="text-xs text-slate-500 uppercase">Specialty</div>
                                        <div className="font-bold text-white">{details.bonus}</div>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                        <div className="text-xs text-slate-500 uppercase">Primary Stat</div>
                                        <div className="font-bold text-axiom-gold">{details.stat}</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleFinish}
                                    className="w-full max-w-md mx-auto bg-white text-axiom-900 font-bold py-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Cpu className="w-5 h-5" /> Initialize System
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;