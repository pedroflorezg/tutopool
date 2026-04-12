import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Matrix / Beeper
  matrix: {
    homeserverUrl: process.env.MATRIX_HOMESERVER_URL || "https://matrix.beeper.com",
    userId: requireEnv("MATRIX_USER_ID"),
    accessToken: requireEnv("MATRIX_ACCESS_TOKEN"),
  },

  // Claude AI
  claude: {
    apiKey: requireEnv("ANTHROPIC_API_KEY"),
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
  },

  // Auto-responder
  autoRespond: {
    enabled: process.env.AUTO_RESPOND_ENABLED !== "false",
    contextMessageCount: parseInt(process.env.CONTEXT_MESSAGE_COUNT || "20", 10),
  },

  // Re-engagement
  reengagement: {
    enabled: process.env.REENGAGEMENT_ENABLED !== "false",
    cron: process.env.REENGAGEMENT_CRON || "0 9 * * *",
    defaultInactivityDays: parseInt(process.env.DEFAULT_INACTIVITY_DAYS || "7", 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Paths
  dbPath: path.resolve(__dirname, "../data/responder.db"),
  rulesPath: path.resolve(__dirname, "../rules.json"),
} as const;
