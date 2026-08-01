import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_getCurrentEvent";
const displayName = "Calendar/getCurrentEvent";
const description = "Retrieve the currently selected calendar event";

const inputSchema = z.object({});

function execute(_input: z.output<typeof inputSchema>, agent: Agent): TokenRingToolResult {
  const event = agent.requireService(CalendarService).getCurrentEvent(agent);
  return {
    message: `**Calendar** Retrieved selected event`,
    result: event ? JSON.stringify(event) : "No calendar event is currently selected.",
  };
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
