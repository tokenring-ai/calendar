import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_selectEvent";
const displayName = "Calendar/selectEvent";
const description = "Select a calendar event by ID for follow-up actions";

const inputSchema = z.object({
  id: z.string().describe("The unique identifier of the event"),
});

async function execute({ id }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const event = await agent.requireService(CalendarService).selectEventById(id, agent);
  return {
    message: `**Calendar** Selected event ${event.title}`,
    result: `
Selected event: "${event.title}" (ID: ${event.id})
Start: ${event.startAt.toISOString()}
End: ${event.endAt.toISOString()}

JSON representation:
${JSON.stringify(event, null, 2)}
  `.trim(),
  };
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
