import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  await agent.requireServiceByType(CalendarService).deleteCurrentEvent(agent);
  return "Deleted current calendar event.";
}

export default {
  name: "calendar event delete",
  description: "Delete current event",
  inputSchema,
  execute,
  help: `Delete the currently selected event.

## Example

/calendar event delete`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
