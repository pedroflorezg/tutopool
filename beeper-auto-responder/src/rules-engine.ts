import fs from "fs";
import { config } from "./config";
import { logger } from "./logger";

// ── Rule Types ────────────────────────────────

export interface ContactRule {
  /** Matrix user ID or display name pattern (supports * wildcards) */
  contact: string;
  /** Whether auto-respond is enabled for this contact */
  autoRespond: boolean;
  /** Custom persona/tone instructions for Claude when replying to this contact */
  persona?: string;
  /** Days of inactivity before re-engagement (overrides global default) */
  reengagementDays?: number;
  /** Custom re-engagement prompt for Claude */
  reengagementPrompt?: string;
  /** Priority: higher = checked first (default: 0) */
  priority?: number;
}

export interface GlobalRules {
  /** Your name, so Claude knows who it's speaking as */
  ownerName: string;
  /** Default persona/tone for auto-replies */
  defaultPersona: string;
  /** Topics or keywords that should NEVER be auto-replied (escalate to you) */
  escalationKeywords: string[];
  /** Room IDs or name patterns to completely ignore */
  ignoreRooms: string[];
  /** If true, only auto-respond to contacts with explicit rules */
  whitelistMode: boolean;
  /** Per-contact rules */
  contacts: ContactRule[];
}

const DEFAULT_RULES: GlobalRules = {
  ownerName: "User",
  defaultPersona:
    "You are a helpful assistant replying on behalf of the user. " +
    "Keep replies brief, friendly, and natural. " +
    "If the message requires the user's personal decision or is sensitive, " +
    "reply that the user will get back to them soon.",
  escalationKeywords: ["urgent", "emergency", "asap", "call me"],
  ignoreRooms: [],
  whitelistMode: false,
  contacts: [],
};

let rulesCache: GlobalRules | null = null;
let rulesLastModified = 0;

export function loadRules(): GlobalRules {
  if (!fs.existsSync(config.rulesPath)) {
    logger.warn("No rules.json found, using defaults. Create one from rules.example.json");
    return DEFAULT_RULES;
  }

  const stat = fs.statSync(config.rulesPath);
  const mtime = stat.mtimeMs;

  // Return cached if file hasn't changed
  if (rulesCache && mtime === rulesLastModified) {
    return rulesCache;
  }

  try {
    const raw = fs.readFileSync(config.rulesPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<GlobalRules>;
    rulesCache = { ...DEFAULT_RULES, ...parsed };
    rulesLastModified = mtime;
    logger.info("Rules loaded", { contacts: rulesCache.contacts.length });
    return rulesCache;
  } catch (err) {
    logger.error("Failed to parse rules.json, using defaults", { error: err });
    return DEFAULT_RULES;
  }
}

/** Find the most specific rule for a given contact */
export function findContactRule(
  userId: string,
  displayName: string
): ContactRule | null {
  const rules = loadRules();
  const sorted = [...rules.contacts].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  for (const rule of sorted) {
    if (matchesPattern(rule.contact, userId) || matchesPattern(rule.contact, displayName)) {
      return rule;
    }
  }
  return null;
}

/** Check if a room should be ignored */
export function isRoomIgnored(roomId: string, roomName: string): boolean {
  const rules = loadRules();
  return rules.ignoreRooms.some(
    (pattern) => matchesPattern(pattern, roomId) || matchesPattern(pattern, roomName)
  );
}

/** Check if message contains escalation keywords */
export function containsEscalationKeyword(message: string): string | null {
  const rules = loadRules();
  const lower = message.toLowerCase();
  for (const keyword of rules.escalationKeywords) {
    if (lower.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

/** Simple wildcard pattern matching (supports * as any characters) */
function matchesPattern(pattern: string, value: string): boolean {
  if (pattern === value) return true;
  if (!pattern.includes("*")) return false;

  const regex = new RegExp(
    "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
    "i"
  );
  return regex.test(value);
}
