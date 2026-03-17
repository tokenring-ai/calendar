import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const event = agent.requireServiceByType(CalendarService).getCurrentEvent(agent);
  return event ? `Current event: ${event.title}` : "No calendar event is currently selected.";
}

export default {
  name: "calendar event get",
  description: "Show current event",
  inputSchema,
  execute,
  help: `Display the currently selected calendar event title.

## Example

/calendar event get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
