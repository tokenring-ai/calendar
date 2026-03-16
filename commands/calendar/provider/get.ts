import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CalendarState} from "../../../state/CalendarState.ts";

const inputSchema = {
  args: {},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  return `Current provider: ${agent.getState(CalendarState).activeProvider ?? "(none)"}`;
}

export default {
  name: "calendar provider get",
  description: "Show current provider",
  inputSchema,
  execute,
  help: `# /calendar provider get

Display the currently active calendar provider.

## Example

/calendar provider get`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
