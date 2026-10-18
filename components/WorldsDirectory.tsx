import React from 'react';
import { Monitor, ShieldCheck, ExternalLink, ShoppingBag, Gamepad2 } from 'lucide-react';

const games = [
 { name:'Axiom: Ascension', genre:'Third-person action roguelite', status:'Planned first PC game', details:'15–25 minute runs, loot, bosses, and class-sensitive bonuses.' },
 { name:'Axiom: The Labyrinth', genre:'Isometric puzzle-action', status:'Concept', details:'Logic encounters, traps, and exploration.' },
 { name:'Axiom: Neon Frontier', genre:'Sci-fi extraction', status:'Concept', details:'Recover technology and escape dangerous facilities.' },
 { name:'Axiom: Sanctuary', genre:'Crafting and settlement', status:'Concept', details:'Noncombat building, exploration, and community play.' },
 { name:'Axiom: Crucible', genre:'Third-person PvP arena', status:'Concept', details:'Ranked 1v1 duels, 2v2 battles, seasonal tournaments, and fair stat-normalized matchmaking.' },
 { name:'Axiom: Dreadveil', genre:'First-person horror thriller', status:'Concept', details:'Stealth, psychological horror, puzzles, and survival against an intelligent pursuer.' },
 { name:'Axiom: Skybound', genre:'2D or 3D precision platformer', status:'Concept', details:'Time trials, movement challenges, secret routes, and ghost racing.' }
];
export default function WorldsDirectory() {
 return <section className="space-y-6 text-slate-100" aria-label="PC worlds directory">
  <div className="rounded-2xl border border-violet-500/30 bg-slate-900 p-6">
   <h2 className="text-2xl font-bold flex items-center gap-3"><Monitor className="text-violet-400"/> Axiom PC Worlds</h2>
   <p className="text-slate-400 mt-2">Axiom is your universal identity and real-life progression profile. Dungeons will be standalone PC games, not embedded in this app.</p>
   <p className="mt-3 text-sm text-amber-300">No PC game is currently available for download. These are development concepts.</p>
  </div>
  <div className="grid gap-4 md:grid-cols-2">{games.map(game=><article key={game.name} className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
   <h3 className="text-xl font-semibold flex items-center gap-2"><Gamepad2 className="text-violet-400"/>{game.name}</h3>
   <p className="text-violet-300 text-sm mt-2">{game.genre}</p><p className="text-slate-400 text-sm mt-2">{game.details}</p>
   <p className="mt-4 text-xs uppercase tracking-wider text-amber-300">{game.status}</p>
  </article>)}</div>
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-2">
   <h3 className="font-semibold flex gap-2 items-center"><ShieldCheck size={18}/> How linked games will work</h3>
   <p className="text-sm text-slate-400">Sign in to the standalone PC game with your Axiom account. With your permission, the game reads your eligible character stats and compatible assets. Rewards are validated by Axiom servers before entering the shared inventory.</p>
   <a className="inline-flex gap-2 items-center text-violet-300 hover:underline text-sm" href="#marketplace" onClick={e=>{e.preventDefault();document.dispatchEvent(new CustomEvent('axiom:navigate-marketplace'));}}><ShoppingBag size={16}/> Open Axiom marketplace <ExternalLink size={14}/></a>
  </div>
 </section>;
}
