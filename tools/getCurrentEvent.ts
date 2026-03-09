import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import CalendarService from "../CalendarService.ts";

const name = "calendar_getCurrentEvent";
const displayName = "Calendar/getCurrentEvent";
const description = "Retrieve the currently selected calendar event";

const inputSchema = z.object({});

async function execute(_input: z.output<typeof inputSchema>, agent: Agent) {
  const event = agent.requireServiceByType(CalendarService).getCurrentEvent(agent);
  return event ? {type: "json" as const, data: event} : "No calendar event is currently selected.";
}

export default {name, displayName, description, inputSchema, execute} satisfies TokenRingToolDefinition<typeof inputSchema>;
