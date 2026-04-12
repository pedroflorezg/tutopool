import cron from "node-cron";
import { config } from "./config";
import { logger } from "./logger";
import { getStaleContacts, getRecentMessages, logReengagement, getLastReengagement } from "./db";
import { loadRules, findContactRule } from "./rules-engine";
import { generateReengagementMessage } from "./auto-responder";
import { sendMessage } from "./matrix-client";

let cronTask: cron.ScheduledTask | null = null;

/**
 * Start the re-engagement scheduler.
 * Runs on the configured cron schedule and checks for stale contacts.
 */
export function startReengagementScheduler(): void {
  if (!config.reengagement.enabled) {
    logger.info("Re-engagement scheduler is disabled");
    return;
  }

  cronTask = cron.schedule(config.reengagement.cron, () => {
    runReengagementCheck().catch((err) => {
      logger.error("Re-engagement check failed", { error: err });
    });
  });

  logger.info("Re-engagement scheduler started", {
    cron: config.reengagement.cron,
    defaultInactivityDays: config.reengagement.defaultInactivityDays,
  });
}

/**
 * Run a single re-engagement check.
 * Finds contacts who haven't been in touch and sends personalized messages.
 */
export async function runReengagementCheck(): Promise<void> {
  const rules = loadRules();
  const defaultDays = config.reengagement.defaultInactivityDays;

  // Get contacts that are stale by the minimum possible threshold (1 day)
  // We'll filter more precisely per-contact below
  const staleContacts = getStaleContacts(1);

  logger.info("Running re-engagement check", {
    candidateContacts: staleContacts.length,
  });

  let sentCount = 0;

  for (const contact of staleContacts) {
    try {
      // Determine this contact's inactivity threshold
      const contactRule = findContactRule(
        contact.matrix_user_id || "",
        contact.display_name
      );

      const inactivityDays = contactRule?.reengagementDays || defaultDays;

      // Check if this contact is actually stale enough
      const lastMsg = new Date(contact.last_message_at + "Z");
      const daysSince = Math.floor(
        (Date.now() - lastMsg.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince < inactivityDays) continue;

      // Skip if auto-respond is explicitly disabled for this contact
      if (contactRule && contactRule.autoRespond === false) continue;

      // In whitelist mode, only message contacts with explicit rules
      if (rules.whitelistMode && !contactRule) continue;

      // Skip groups — only re-engage in DMs
      if (contact.is_group) continue;

      // Don't send re-engagement if we already sent one within the threshold period
      const lastReengagement = getLastReengagement(contact.matrix_room_id);
      if (lastReengagement) {
        const lastSent = new Date(lastReengagement.sent_at + "Z");
        const daysSinceReengagement = Math.floor(
          (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceReengagement < inactivityDays) continue;
      }

      // Get recent messages for context
      const history = getRecentMessages(contact.matrix_room_id, 10);

      // Generate personalized message with Claude
      const message = await generateReengagementMessage(
        contact.display_name,
        contact.matrix_user_id || "",
        contact.last_message_at,
        history
      );

      // Send the message
      await sendMessage(contact.matrix_room_id, message);
      logReengagement(contact.matrix_room_id, message);
      sentCount++;

      logger.info("Re-engagement message sent", {
        contact: contact.display_name,
        daysSinceContact: daysSince,
        message: message.substring(0, 80) + "...",
      });

      // Small delay between sends to avoid rate limiting
      await sleep(2000);
    } catch (err) {
      logger.error("Failed to send re-engagement to contact", {
        contact: contact.display_name,
        error: err,
      });
    }
  }

  logger.info("Re-engagement check complete", { messagesSent: sentCount });
}

export function stopReengagementScheduler(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info("Re-engagement scheduler stopped");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
