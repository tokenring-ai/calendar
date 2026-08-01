import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_getUpcomingEvents";
const displayName = "Calendar/getUpcomingEvents";
const description = "Retrieve upcoming calendar events from the active provider";

const inputSchema = z.object({
  limit: z.number().int().positive().default(10),
  from: z.string().datetime().exactOptional().describe("Optional ISO date-time to start listing from"),
  to: z.string().datetime().exactOptional().describe("Optional ISO date-time upper bound"),
});

async function execute({ limit, from, to }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const events = await agent.requireService(CalendarService).getUpcomingEvents(
    {
      limit,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    },
    agent,
  );

  return {
    message: `**Calendar** Listed ${events.length} upcoming events`,
    result: `
Upcoming events:

${markdownTable(
  ["ID", "Title", "Start", "End", "Location"],
  events.map(event => [event.id, event.title, event.startAt.toISOString(), event.endAt.toISOString(), event.location ?? ""]),
)}
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
