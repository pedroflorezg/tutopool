import { config } from "./config";
import { logger } from "./logger";
import { MatrixMessageEvent, sendMessage } from "./matrix-client";
import {
  trackIncomingMessage,
  trackOutgoingMessage,
  getConversationContext,
  wasLastMessageAutoReply,
} from "./contact-tracker";
import { analyzeAndRespond } from "./auto-responder";
import { logResponse } from "./db";
import {
  isRoomIgnored,
  containsEscalationKeyword,
  loadRules,
  findContactRule,
} from "./rules-engine";

// Debounce map: roomId → timeout handle
// Groups rapid messages from the same room to avoid replying to each one
const pendingMessages = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_MS = 3000; // Wait 3 seconds after last message before analyzing

/**
 * Main message handler — called for every incoming message from the Matrix sync.
 */
export function handleIncomingMessage(event: MatrixMessageEvent): void {
  const { roomId, senderId, eventId, body, displayName } = event;

  // 1) Track the message regardless of auto-respond settings
  trackIncomingMessage(roomId, senderId, displayName, body, eventId);

  // 2) Check if auto-respond is enabled
  if (!config.autoRespond.enabled) return;

  // 3) Check if room is ignored
  const roomName = displayName; // For DMs, this is the contact name
  if (isRoomIgnored(roomId, roomName)) {
    logger.debug("Ignoring message from ignored room", { roomId, roomName });
    return;
  }

  // 4) In whitelist mode, check if contact has explicit rules
  const rules = loadRules();
  const contactRule = findContactRule(senderId, displayName);
  if (rules.whitelistMode && !contactRule) {
    logger.debug("Whitelist mode: no rule for contact, skipping", {
      sender: displayName,
    });
    return;
  }

  // 5) If contact rule explicitly disables auto-respond
  if (contactRule && contactRule.autoRespond === false) {
    logger.debug("Auto-respond disabled for contact", { sender: displayName });
    return;
  }

  // 6) Debounce: if multiple messages come quickly, wait for the last one
  if (pendingMessages.has(roomId)) {
    clearTimeout(pendingMessages.get(roomId)!);
  }

  pendingMessages.set(
    roomId,
    setTimeout(() => {
      pendingMessages.delete(roomId);
      processMessage(roomId, senderId, displayName, body).catch((err) => {
        logger.error("Error processing message", { error: err, roomId });
      });
    }, DEBOUNCE_MS)
  );
}

/**
 * Process a message after debounce: analyze with Claude and optionally respond.
 */
async function processMessage(
  roomId: string,
  senderId: string,
  displayName: string,
  body: string
): Promise<void> {
  // Check for immediate escalation keywords
  const escalationKeyword = containsEscalationKeyword(body);
  if (escalationKeyword) {
    logger.info("Escalation keyword detected", {
      sender: displayName,
      keyword: escalationKeyword,
    });
    logResponse(roomId, body, "escalated", `Contains keyword: ${escalationKeyword}`, null);
    return;
  }

  // Prevent auto-reply loops
  if (wasLastMessageAutoReply(roomId)) {
    logger.debug("Last message was auto-reply, skipping to avoid loop", {
      room: roomId,
    });
    logResponse(roomId, body, "skipped", "Previous message was auto-reply", null);
    return;
  }

  // Get conversation context
  const history = getConversationContext(roomId);

  // Ask Claude to analyze and decide
  const decision = await analyzeAndRespond(displayName, senderId, body, history);

  switch (decision.action) {
    case "respond": {
      if (!decision.response) {
        logger.warn("Claude decided to respond but provided no text");
        break;
      }

      const eventId = await sendMessage(roomId, decision.response);
      trackOutgoingMessage(roomId, decision.response, eventId, true);
      logResponse(roomId, body, "responded", decision.reason, decision.response);

      logger.info("Auto-replied", {
        to: displayName,
        response: decision.response.substring(0, 80),
      });
      break;
    }

    case "skip":
      logResponse(roomId, body, "skipped", decision.reason, null);
      logger.debug("Skipped message", { from: displayName, reason: decision.reason });
      break;

    case "escalate":
      logResponse(roomId, body, "escalated", decision.reason, null);
      logger.info("ESCALATED — needs your attention", {
        from: displayName,
        message: body.substring(0, 100),
        reason: decision.reason,
      });
      break;
  }
}
