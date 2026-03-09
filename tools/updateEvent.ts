import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_updateEvent";
const displayName = "Calendar/updateEvent";
const description = "Update the currently selected calendar event";

const attendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const inputSchema = z.object({
  title: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  allDay: z.boolean().optional(),
  attendees: z.array(attendeeSchema).optional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).optional(),
});

async function execute(input: z.output<typeof inputSchema>, agent: Agent) {
  const event = await agent.requireServiceByType(CalendarService).updateEvent({
    ...input,
    startAt: input.startAt ? new Date(input.startAt) : undefined,
    endAt: input.endAt ? new Date(input.endAt) : undefined,
  }, agent);
  agent.infoMessage(`[${name}] Event updated: ${event.id}`);
  return {type: "json" as const, data: event};
}

export default {name, displayName, description, inputSchema, execute} satisfies TokenRingToolDefinition<typeof inputSchema>;
