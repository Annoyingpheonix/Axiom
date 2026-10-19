import React, { useEffect, useState } from 'react';
import { Globe, Swords, Gem, ShoppingBag, Shield, ArrowRight, Package } from 'lucide-react';

type Rarity = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Unique';
type Item = { id: string; name: string; rarity: Rarity; worldId: string; power: number; tradable: boolean };
type State = { items: Item[]; axm: number; clears: Record<string, number>; listings: Item[] };
const WORLDS = [
  { id: 'ascension', name: 'Ascension', genre: 'Fantasy RPG', icon: '⚔️', enemy: 'Shadow Warden', description: 'Face dungeon guardians and earn enchanted relics.' },
  { id: 'frontier', name: 'Neon Frontier', genre: 'Sci-fi', icon: '🚀', enemy: 'Rogue Sentinel', description: 'Fight rogue machines for experimental technology.' },
  { id: 'labyrinth', name: 'The Labyrinth', genre: 'Puzzle realm', icon: '🧩', enemy: 'Mirror Keeper', description: 'Solve a logic encounter to earn ancient artifacts.' }
] as const;
const DROPS: Record<string, string[]> = {
  ascension: ['Warden Blade', 'Runic Cloak', 'Crown of Resolve'],
  frontier: ['Plasma Core', 'Quantum Visor', 'Nova Module'],
  labyrinth: ['Echo Compass', 'Paradox Key', 'Memory Prism']
};
const START: State = { items: [], axm: 100, clears: {}, listings: [] };
const KEY = 'axiom-worlds-demo-v1';
const rollRarity = (): Rarity => {
  const r = Math.random();
  return r < .005 ? 'Unique' : r < .05 ? 'Diamond' : r < .18 ? 'Gold' : r < .45 ? 'Silver' : 'Bronze';
};
const price = (item: Item) => ({ Bronze: 5, Silver: 12, Gold: 30, Diamond: 75, Unique: 200 })[item.rarity];
export default function WorldsPortal({ playerName = 'Adventurer' }: { playerName?: string }) {
  const [state, setState] = useState<State>(() => {
    try { const saved = localStorage.getItem(KEY); return saved ? { ...START, ...JSON.parse(saved) } : START; }
    catch { return START; }
  });
  const [selected, setSelected] = useState<string>('ascension');
  const [message, setMessage] = useState('Select a world and complete a demo encounter.');
  const [view, setView] = useState<'worlds' | 'inventory' | 'market'>('worlds');
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } }, [state]);
  const enter = () => {
    const world = WORLDS.find(w => w.id === selected)!;
    const rarity = rollRarity();
    const count = state.clears[selected] || 0;
    const names = DROPS[selected];
    const item: Item = { id: crypto.randomUUID(), name: names[Math.floor(Math.random() * names.length)], rarity, worldId: selected, power: 1 + count, tradable: true };
    setState(s => ({ ...s, items: [...s.items, item], clears: { ...s.clears, [selected]: (s.clears[selected] || 0) + 1 } }));
    setMessage(`Victory over ${world.enemy}! You obtained ${rarity} ${item.name}. Demo encounters do not award real AXM or global XP.`);
  };
  const listItem = (item: Item) => {
    setState(s => ({ ...s, items: s.items.filter(i => i.id !== item.id), listings: [...s.listings, item] }));
    setMessage(`Listed ${item.name} for ${price(item)} simulated AXM. Listings are local and not visible to other players.`);
  };
  const cancelListing = (item: Item) => {
    setState(s => ({ ...s, listings: s.listings.filter(i => i.id !== item.id), items: [...s.items, item] }));
    setMessage(`Cancelled listing for ${item.name}.`);
  };
  return <section className="space-y-6 text-slate-100" aria-label="Connected worlds prototype">
    <header className="rounded-2xl border border-violet-500/30 bg-slate-900 p-6">
      <div className="flex items-center gap-3"><Globe className="text-violet-400" /><h2 className="text-2xl font-bold">Connected Worlds</h2></div>
      <p className="text-slate-400 mt-2">Welcome, {playerName}. Your Axiom identity travels across worlds. This is an offline gameplay and marketplace simulation.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['worlds','inventory','market'] as const).map(tab => <button key={tab} onClick={() => setView(tab)} className={`rounded-lg px-4 py-2 capitalize ${view === tab ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{tab}</button>)}
      </div>
    </header>
    <p role="status" className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm">{message}</p>
    {view === 'worlds' && <div className="grid gap-4 md:grid-cols-3">{WORLDS.map(world => <button key={world.id} onClick={() => setSelected(world.id)} className={`text-left rounded-2xl border p-5 transition ${selected === world.id ? 'border-violet-400 bg-violet-950/40' : 'border-slate-700 bg-slate-900'}`}>
      <div className="text-4xl">{world.icon}</div><h3 className="mt-3 text-xl font-semibold">{world.name}</h3><p className="text-xs text-violet-300">{world.genre}</p><p className="mt-2 text-sm text-slate-400">{world.description}</p><p className="mt-3 text-xs text-slate-500">Clears: {state.clears[world.id] || 0}</p>
    </button>)}</div>}
    {view === 'worlds' && <button onClick={enter} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"><Swords size={18}/> Complete demo encounter <ArrowRight size={18}/></button>}
    {view === 'inventory' && <div className="space-y-3"><h3 className="flex items-center gap-2 text-lg font-semibold"><Package size={18}/> Universal Inventory ({state.items.length})</h3>{state.items.length === 0 && <p className="text-slate-400">Clear a dungeon to find your first item.</p>}{state.items.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 p-4"><div><p className="font-semibold">{item.name} · {item.rarity}</p><p className="text-xs text-slate-400">Origin: {item.worldId} · Power {item.power} · Usable only in origin world</p></div><button onClick={() => listItem(item)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm">List for {price(item)} AXM</button></div>)}</div>}
    {view === 'market' && <div className="space-y-3"><h3 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={18}/> Local Marketplace</h3><p className="text-sm text-amber-300">Simulated balance: {state.axm} AXM. No real trades, tokens, or cash-out.</p>{state.listings.length === 0 && <p className="text-slate-400">List an inventory item to see it here.</p>}{state.listings.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-900 p-4"><div><p>{item.name} · {item.rarity}</p><p className="text-sm text-slate-400">{price(item)} simulated AXM</p></div><button onClick={() => cancelListing(item)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm">Cancel listing</button></div>)}</div>}
    <footer className="flex items-center gap-2 text-xs text-slate-500"><Shield size={14}/><span>Prototype only: random outcomes are client-side, inventory is stored locally, and third-party SDK authorization is not implemented.</span></footer>
  </section>;
}
