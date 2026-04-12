import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";
import {CalendarState} from "../../../state/CalendarState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const initialProvider = agent.getState(CalendarState).initialConfig.provider;
  if (!initialProvider)
    throw new CommandFailedError("No initial provider configured");
  agent
    .requireServiceByType(CalendarService)
    .setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

const help = `Reset the active calendar provider to the initial configured value.

## Example

/calendar provider reset`;

export default {
  name: "calendar provider reset",
  description: "Reset to initial provider",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
