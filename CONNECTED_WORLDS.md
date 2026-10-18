# Axiom Connected Worlds — Prototype

This branch extends the existing Google AI Studio React app, preserving its quests, personality classes, social features, and existing marketplace.

## Try it

Run `npm install` and `npm run dev`. Sign in through the existing onboarding flow, then select **Worlds** from the desktop sidebar or mobile menu. Pick Ascension, Neon Frontier, or The Labyrinth, complete a simulated encounter, view the item in Universal Inventory, and list or cancel it in the local Marketplace tab.

## Scope and limitations

- This is a **client-only vertical slice**. Items, dungeon clears, and listings are stored in browser localStorage. They are not synced to accounts or other devices.
- Dungeon encounters currently resolve instantly with a randomized rarity drop; there is no tactical combat or anti-cheat verification.
- AXM balances are **simulated**, with no blockchain, cash-out, payments, or peer-to-peer trades.
- Listed items can be cancelled, but cannot yet be purchased by other players.
- World names and item catalogs are illustrative. Third-party developer authorization and interoperability SDK are future work.
- The existing habit and quest progression system is intentionally not modified by demo dungeon rewards.

## Recommended next steps

1. Introduce authenticated API and persistent inventory tables.
2. Implement server-authoritative dungeon encounters and signed reward issuance.
3. Implement escrow, orders, atomic ownership transfer, and double-entry simulated AXM ledger.
4. Add developer world registration, scoped keys, asset namespaces, and certification.
5. Add automated tests and connect achievements to verified real-world quests.
6. Review legal, safety, and security requirements before real-token transactions.
