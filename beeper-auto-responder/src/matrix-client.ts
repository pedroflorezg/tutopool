import * as sdk from "matrix-js-sdk";
import { config } from "./config";
import { logger } from "./logger";

let client: sdk.MatrixClient | null = null;

export type MatrixMessageEvent = {
  roomId: string;
  senderId: string;
  eventId: string;
  body: string;
  displayName: string;
};

export type MessageCallback = (event: MatrixMessageEvent) => void;

/**
 * Create and return the Matrix client connected to Beeper.
 * Reuses the same client if called multiple times.
 */
export function getMatrixClient(): sdk.MatrixClient {
  if (client) return client;

  client = sdk.createClient({
    baseUrl: config.matrix.homeserverUrl,
    accessToken: config.matrix.accessToken,
    userId: config.matrix.userId,
  });

  return client;
}

/**
 * Start syncing with the Beeper/Matrix server and listen for new messages.
 * Only processes messages that arrive AFTER sync starts (ignores history).
 */
export async function startSync(onMessage: MessageCallback): Promise<void> {
  const matrixClient = getMatrixClient();
  let initialSyncComplete = false;

  matrixClient.on(sdk.ClientEvent.Sync, (state: string) => {
    if (state === "PREPARED") {
      initialSyncComplete = true;
      logger.info("Matrix sync ready — listening for messages");
    }
  });

  matrixClient.on(
    sdk.RoomEvent.Timeline,
    (event: sdk.MatrixEvent, room: sdk.Room | undefined) => {
      // Skip until initial sync is done (avoids replaying old messages)
      if (!initialSyncComplete) return;

      // Only handle text messages
      if (event.getType() !== "m.room.message") return;
      const content = event.getContent();
      if (!content || content.msgtype !== "m.text") return;

      // Ignore our own messages
      const senderId = event.getSender();
      if (!senderId || senderId === config.matrix.userId) return;

      const roomId = event.getRoomId();
      if (!roomId) return;

      const displayName =
        room?.getMember(senderId)?.name || senderId;

      onMessage({
        roomId,
        senderId,
        eventId: event.getId() || "",
        body: content.body || "",
        displayName,
      });
    }
  );

  await matrixClient.startClient({ initialSyncLimit: 0 });
  logger.info("Matrix client started", {
    homeserver: config.matrix.homeserverUrl,
    userId: config.matrix.userId,
  });
}

/**
 * Send a text message to a Matrix room.
 */
export async function sendMessage(roomId: string, body: string): Promise<string> {
  const matrixClient = getMatrixClient();
  const res = await matrixClient.sendTextMessage(roomId, body);
  logger.debug("Message sent", { roomId, eventId: res.event_id });
  return res.event_id;
}

/**
 * Get room display name (contact name or group name).
 */
export function getRoomName(roomId: string): string {
  const matrixClient = getMatrixClient();
  const room = matrixClient.getRoom(roomId);
  return room?.name || roomId;
}

/**
 * Check if a room is a direct message (1:1 chat) vs a group.
 */
export function isDirectMessage(roomId: string): boolean {
  const matrixClient = getMatrixClient();
  const room = matrixClient.getRoom(roomId);
  if (!room) return false;

  const members = room.getJoinedMembers();
  return members.length === 2;
}

/**
 * Get the other user's Matrix ID in a DM room.
 */
export function getDmPartnerId(roomId: string): string | null {
  const matrixClient = getMatrixClient();
  const room = matrixClient.getRoom(roomId);
  if (!room) return null;

  const members = room.getJoinedMembers();
  const other = members.find((m) => m.userId !== config.matrix.userId);
  return other?.userId || null;
}

/**
 * Stop the Matrix client and clean up.
 */
export async function stopSync(): Promise<void> {
  if (client) {
    client.stopClient();
    logger.info("Matrix client stopped");
    client = null;
  }
}
