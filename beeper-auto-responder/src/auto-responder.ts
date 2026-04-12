import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";
import { logger } from "./logger";
import { loadRules, findContactRule } from "./rules-engine";
import { MessageRow } from "./db";

const anthropic = new Anthropic({ apiKey: config.claude.apiKey });

export interface AutoResponseDecision {
  action: "respond" | "skip" | "escalate";
  reason: string;
  response?: string;
}

/**
 * Analyze an incoming message using Claude and decide how to respond.
 *
 * Claude receives:
 * - The owner's persona and rules
 * - Recent conversation history for context
 * - The new incoming message
 *
 * Claude decides:
 * - "respond" — auto-reply with a generated message
 * - "skip" — no reply needed (e.g., it's just a reaction, "ok", etc.)
 * - "escalate" — the message needs the real user's attention
 */
export async function analyzeAndRespond(
  senderName: string,
  senderId: string,
  incomingMessage: string,
  recentHistory: MessageRow[]
): Promise<AutoResponseDecision> {
  const rules = loadRules();
  const contactRule = findContactRule(senderId, senderName);

  // Build conversation context
  const historyText = recentHistory
    .reverse() // oldest first
    .map((m) => {
      const who = m.sender_id === config.matrix.userId ? rules.ownerName : senderName;
      const tag = m.is_auto_reply ? " [auto-reply]" : "";
      return `${who}${tag}: ${m.body}`;
    })
    .join("\n");

  const persona = contactRule?.persona || rules.defaultPersona;

  const systemPrompt = `You are an AI assistant that helps ${rules.ownerName} manage their messages.
Your job is to analyze incoming messages and decide how to handle them.

## Your persona when replying
${persona}

## Rules
- If the message is casual/routine and you can reply naturally as ${rules.ownerName}, respond.
- If the message requires a personal decision, contains sensitive/private information, or is about an important topic that ${rules.ownerName} should handle personally, escalate.
- If the message doesn't need a reply (reactions, "ok", "thanks", thumbs up, etc.), skip.
- Keep replies concise and natural — match the tone and language of the conversation.
- If the conversation is in Spanish, reply in Spanish. If in English, reply in English. Match whatever language is being used.
- Never reveal that you are an AI or that this is an automated reply.
- Never make commitments, promises, or decisions on behalf of ${rules.ownerName} about money, schedules, or important matters.

## Response format
Reply with a JSON object (no markdown, no code fences):
{"action": "respond"|"skip"|"escalate", "reason": "brief explanation", "response": "your reply text if action is respond"}`;

  const userPrompt = `## Recent conversation history
${historyText || "(no prior messages)"}

## New incoming message from ${senderName}
${incomingMessage}

Analyze this message and decide: respond, skip, or escalate?`;

  try {
    const response = await anthropic.messages.create({
      model: config.claude.model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse Claude's JSON response
    const decision = parseDecision(text);
    logger.info("Auto-response decision", {
      sender: senderName,
      action: decision.action,
      reason: decision.reason,
    });
    return decision;
  } catch (err) {
    logger.error("Claude API error in auto-responder", { error: err });
    return {
      action: "escalate",
      reason: "Claude API error — escalating to user",
    };
  }
}

/**
 * Generate a personalized re-engagement message for a contact.
 */
export async function generateReengagementMessage(
  contactName: string,
  contactId: string,
  lastMessageDate: string,
  recentHistory: MessageRow[]
): Promise<string> {
  const rules = loadRules();
  const contactRule = findContactRule(contactId, contactName);

  const customPrompt =
    contactRule?.reengagementPrompt ||
    `Write a brief, warm, personalized message from ${rules.ownerName} to ${contactName} to reconnect after not being in touch for a while.`;

  const historyText = recentHistory
    .reverse()
    .map((m) => {
      const who = m.sender_id === config.matrix.userId ? rules.ownerName : contactName;
      return `${who}: ${m.body}`;
    })
    .join("\n");

  const systemPrompt = `You are helping ${rules.ownerName} stay in touch with their contacts.
Generate a short, natural message to send to ${contactName}.
The last interaction was on ${lastMessageDate}.

## Guidelines
${customPrompt}

## Important
- Be genuine and personal, not generic.
- Reference something from the conversation history if relevant.
- Keep it to 1-3 sentences.
- Match the language used in the conversation (Spanish or English).
- Don't mention that this is automated.
- Just output the message text, nothing else.`;

  const userPrompt = historyText
    ? `## Recent conversation history with ${contactName}\n${historyText}`
    : `No recent conversation history available. Write a general check-in message.`;

  try {
    const response = await anthropic.messages.create({
      model: config.claude.model,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    return response.content[0].type === "text"
      ? response.content[0].text.trim()
      : `Hey ${contactName}! Just wanted to check in — hope you're doing well!`;
  } catch (err) {
    logger.error("Claude API error in re-engagement", { error: err });
    return `Hey ${contactName}! Just wanted to check in — hope everything is going great!`;
  }
}

function parseDecision(text: string): AutoResponseDecision {
  try {
    // Try to extract JSON from the response (handle markdown fences if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);
    const action = parsed.action;

    if (!["respond", "skip", "escalate"].includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    return {
      action,
      reason: parsed.reason || "No reason provided",
      response: action === "respond" ? parsed.response : undefined,
    };
  } catch (err) {
    logger.warn("Failed to parse Claude decision, escalating", { text, error: err });
    return {
      action: "escalate",
      reason: "Could not parse Claude response",
    };
  }
}
