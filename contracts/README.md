# CampusGig smart contracts

This folder contains the on-chain stub for CampusGig:

- `CampusGigEscrow` — Buyers deposit native currency when hiring a gig. Funds release to the
  seller on confirmation (and mint reputation), refund to the buyer after the deadline, or go
  to a `Disputed` state for off-chain arbitration.
- `CampusGigReputation` (CGREP) — Soulbound ERC-20-like token. The `_beforeTokenTransfer`
  hook blocks every transfer (mints/burns excepted), so reputation can't be bought, sold, or
  moved between wallets.

These contracts ship as a reference implementation. Deploy with Foundry / Hardhat / Remix on
any EVM-compatible chain (e.g. Base Sepolia for testing) and wire the deployed address into
the CampusGig wallet flow. The Connect Wallet modal in the app already detects browser
wallets via `window.ethereum`.
