# Axiom — Profile-First Product Architecture

**Decision:** Axiom is a universal player identity and positive-habit progression platform. It is **not** a dungeon game. Dungeons are separate downloadable PC games requiring Axiom login. The marketplace is a responsive web product, accessible from the Axiom app and all major browsers.

## 1. Axiom App / Profile
- Mobile-first web/app for onboarding, shortened personality assessment, MBTI-inspired class, goals, habit tracking, AI-generated real-world quests, evidence verification, stats, global XP, social ranks G–SS, friends, guilds, customizable avatar, skills, and level-100 ascension.
- Verified positive habits build global stats. Axiom is the canonical source for identity and global progression.
- Distinguish *global stats* from *game combat stats*: each PC game translates global attributes according to its own balancing rules.
- Do not force players to install or play a dungeon to use the habit tracker.

## 2. Independent PC Worlds
- Games built and distributed separately (e.g., Steam/standalone PC installers). No dungeon combat UI inside the Axiom profile app.
- Require Axiom login via OAuth 2.1/OIDC Authorization Code + PKCE using the system browser; game clients never receive permanent user passwords or privileged API secrets.
- Game backend validates tokens, retrieves scoped profile and eligible inventory, and submits authenticated signed/idempotent events for authorized rewards.
- Developers register a world, define asset compatibility and stat mappings, and pass certification. Games cannot unilaterally mint universal assets or global XP.
- Game offline behavior and outage handling must be explicit: if a valid Axiom session cannot be established, entry is blocked; brief session outages may allow a time-limited grace period without tradable rewards.

## 3. Universal Marketplace Website
- Responsive web marketplace on its own route/domain, deep-linked from mobile app and games.
- Search, buy, sell, escrow/listings, history, rarity, asset provenance, world compatibility, binding rules, and developer royalties.
- Marketplace ownership transfers and currency ledger updates are atomic, server-side, auditable, and idempotent.
- Items/skills may be universal, adaptable, or game-specific; ownership portability does not guarantee usability in every game.

## 4. Gold and AXM Economy — proposal pending legal/economic design
- **Gold**: internal off-chain ledger balance earned from approved activities and/or game transactions; not a blockchain token.
- **AXM**: optional transferable token, subject to regulatory, custody, KYC/AML, sanctions, tax, and money-transmission requirements where applicable.
- **Gold-to-AXM conversion**: proposed user-facing flow, *not a guaranteed redemption promise*. Do not implement a fixed exchange rate or promise cash-out before identifying a sustainable funded conversion mechanism, eligibility, fees, liquidity and jurisdictional restrictions.
- A conversion request must check eligibility, quote an actual funded rate with expiry, reserve/debit Gold atomically, record fees, and credit/transfer AXM only after settlement succeeds. Reversals and failed settlement must be handled.
- In-app wallet may be custodial (regulated provider) or self-custodial; choose explicitly. A cold wallet is an **external self-custody destination**, not something the app can assume it controls. On-chain transfers require user confirmation, correct network/address validation, and withdrawal protections.
- Keep Gold, AXM, and XP in separate ledgers; never represent simulated AXM as real value.

## 5. Services and data boundaries
- Identity/Auth (OIDC), Profiles/Habits/Quests, Stats/Progression, World Registry/Developer SDK, Asset Registry/Inventory, Marketplace/Orders, Gold Ledger, AXM Settlement/Wallet Integration, Fraud/Risk, Social/Guilds, Audit/Operations.
- MVP: modular monolith, PostgreSQL, server-issued event IDs, transactional item ownership and ledger, rate limiting and audit logs. Isolate wallet signing and token settlement.
- Privacy: granular player consent for which habit-derived stats are shared with each PC world; worlds do not receive raw evidence, personal goals, or sensitive activity history by default.

## 6. Revised milestones
1. Refine existing AI Studio React app as profile/habit tracker, remove in-app dungeon gameplay from main product direction.
2. Implement secure profile backend and documented OIDC login flow for PC game prototypes.
3. Build standalone PC world proof-of-concept with game-specific stat mapping and authorized reward events.
4. Launch responsive marketplace web prototype with simulated Gold and simulated AXM, real server ownership and ledger.
5. Pilot regulated conversion and wallet integration only after legal and economic validation.

## Previous PR scope
The current WorldsPortal component is an **exploratory demo only** and conflicts with the desired separation of standalone PC games from the profile app. Do not merge it as a production feature. Replace with a *World Directory / Linked Games* section (install/link/login/status) and move game simulation to a separate PC client project.
