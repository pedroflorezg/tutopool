import { config } from "./config";
import { logger } from "./logger";
import {
  upsertContact,
  insertMessage,
  getRecentMessages,
  getContact,
  MessageRow,
} from "./db";
import {
  getRoomName,
  isDirectMessage,
  getDmPartnerId,
} from "./matrix-client";

/**
 * Record an incoming message from someone else.
 * Updates the contact's last-message timestamp and stores the message for context.
 */
export function trackIncomingMessage(
  roomId: string,
  senderId: string,
  displayName: string,
  body: string,
  eventId: string
): void {
  const isDm = isDirectMessage(roomId);
  const roomName = getRoomName(roomId);

  upsertContact(
    roomId,
    isDm ? displayName : roomName,
    isDm ? senderId : null,
    !isDm,
    "them"
  );

  insertMessage(roomId, senderId, body, eventId, false);

  logger.debug("Tracked incoming message", {
    room: roomName,
    sender: displayName,
    isDm,
  });
}

/**
 * Record an outgoing message (sent by us, including auto-replies).
 */
export function trackOutgoingMessage(
  roomId: string,
  body: string,
  eventId: string,
  isAutoReply: boolean
): void {
  const isDm = isDirectMessage(roomId);
  const roomName = getRoomName(roomId);
  const partnerId = isDm ? getDmPartnerId(roomId) : null;

  upsertContact(
    roomId,
    roomName,
    partnerId,
    !isDm,
    "self"
  );

  insertMessage(roomId, config.matrix.userId, body, eventId, isAutoReply);

  logger.debug("Tracked outgoing message", {
    room: roomName,
    isAutoReply,
  });
}

/**
 * Get recent conversation history for a room (for Claude context).
 */
export function getConversationContext(roomId: string): MessageRow[] {
  return getRecentMessages(roomId, config.autoRespond.contextMessageCount);
}

/**
 * Check if the last message in a room was already an auto-reply from us.
 * Prevents infinite loops and double-replies.
 */
export function wasLastMessageAutoReply(roomId: string): boolean {
  const recent = getRecentMessages(roomId, 1);
  if (recent.length === 0) return false;

  const last = recent[0];
  return last.sender_id === config.matrix.userId && last.is_auto_reply === 1;
}

/**
 * Get info about a tracked contact.
 */
export function getContactInfo(roomId: string) {
  return getContact(roomId);
}
