import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_createEvent";
const displayName = "Calendar/createEvent";
const description = "Create a new calendar event";

const attendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().exactOptional(),
});

const inputSchema = z.object({
  title: z.string().describe("Event title"),
  startAt: z.string().datetime().describe("Event start time in ISO format"),
  endAt: z.string().datetime().describe("Event end time in ISO format"),
  description: z.string().exactOptional(),
  location: z.string().exactOptional(),
  allDay: z.boolean().exactOptional(),
  attendees: z.array(attendeeSchema).exactOptional(),
});

async function execute(input: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const event = await agent.requireServiceByType(CalendarService).createEvent(
    {
      ...input,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
    },
    agent,
  );
  agent.infoMessage(`[${name}] Event created with ID: ${event.id}`);
  return JSON.stringify(event);
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
