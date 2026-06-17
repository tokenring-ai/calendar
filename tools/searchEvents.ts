import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_searchEvents";
const displayName = "Calendar/searchEvents";
const description = "Search calendar events using the active provider";

const inputSchema = z.object({
  query: z.string().describe("Search query for calendar events"),
  limit: z.number().int().positive().default(10),
  from: z.string().datetime().exactOptional(),
  to: z.string().datetime().exactOptional(),
});

async function execute({ query, limit, from, to }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const events = await agent.requireServiceByType(CalendarService).searchEvents(
    {
      query,
      limit,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    },
    agent,
  );

  return `
Search results for "${query}":

${markdownTable(
  ["ID", "Title", "Start", "Status"],
  events.map(event => [event.id, event.title, event.startAt.toISOString(), event.status ?? ""]),
)}
  `.trim();
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
