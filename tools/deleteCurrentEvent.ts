import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_deleteCurrentEvent";
const displayName = "Calendar/deleteCurrentEvent";
const description = "Delete the currently selected calendar event";

const inputSchema = z.object({});

async function execute(_input: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  await agent.requireServiceByType(CalendarService).deleteCurrentEvent(agent);
  return "Deleted current calendar event.";
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
