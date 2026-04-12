import { config } from "./config";
import { logger } from "./logger";
import { startSync, stopSync } from "./matrix-client";
import { handleIncomingMessage } from "./message-handler";
import {
  startReengagementScheduler,
  stopReengagementScheduler,
} from "./re-engagement";
import { closeDb } from "./db";

async function main(): Promise<void> {
  logger.info("═══════════════════════════════════════════════");
  logger.info("  Beeper Auto-Responder — powered by Claude AI");
  logger.info("═══════════════════════════════════════════════");
  logger.info("Configuration:", {
    homeserver: config.matrix.homeserverUrl,
    userId: config.matrix.userId,
    autoRespond: config.autoRespond.enabled,
    reengagement: config.reengagement.enabled,
    claudeModel: config.claude.model,
  });

  // Start listening for messages via Matrix protocol
  await startSync(handleIncomingMessage);

  // Start the re-engagement cron scheduler
  startReengagementScheduler();

  logger.info("Bot is running. Press Ctrl+C to stop.");
}

// ── Graceful shutdown ─────────────────────────

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down...`);
  stopReengagementScheduler();
  await stopSync();
  closeDb();
  logger.info("Goodbye!");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
});

// ── Start ─────────────────────────────────────

main().catch((err) => {
  logger.error("Fatal error starting bot", { error: err });
  process.exit(1);
});
