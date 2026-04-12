import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CalendarState} from "../../../state/CalendarState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  return `Current provider: ${agent.getState(CalendarState).activeProvider ?? "(none)"}`;
}

export default {
  name: "calendar provider get",
  description: "Show current provider",
  inputSchema,
  execute,
  help: `Display the currently active calendar provider.

## Example

/calendar provider get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
