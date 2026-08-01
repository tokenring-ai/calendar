import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({ agent }: AgentCommandInputType<typeof inputSchema>) {
  agent.requireService(CalendarService).clearCurrentEvent(agent);
  return "Event cleared. No calendar event is currently selected.";
}

export default {
  name: "calendar event clear",
  description: "Clear current event selection",
  inputSchema,
  execute,
  help: `Clear the current event selection.

## Example

/calendar event clear`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
