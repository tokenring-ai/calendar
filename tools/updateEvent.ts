import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_updateEvent";
const displayName = "Calendar/updateEvent";
const description = "Update the currently selected calendar event";

const attendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().exactOptional(),
});

const inputSchema = z.object({
  title: z.string().exactOptional(),
  startAt: z.string().datetime().exactOptional(),
  endAt: z.string().datetime().exactOptional(),
  description: z.string().exactOptional(),
  location: z.string().exactOptional(),
  allDay: z.boolean().exactOptional(),
  attendees: z.array(attendeeSchema).exactOptional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).exactOptional(),
});

async function execute({ startAt, endAt, ...input }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const event = await agent.requireService(CalendarService).updateEvent(
    {
      ...input,
      ...(startAt && { startAt: new Date(startAt) }),
      ...(endAt && { endAt: new Date(endAt) }),
    },
    agent,
  );
  agent.infoMessage(`[${name}] Event updated: ${event.id}`);
  return {
    message: "**Calendar** Updated event",
    result: JSON.stringify(event),
  };
}

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
