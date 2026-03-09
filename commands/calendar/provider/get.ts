import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CalendarState} from "../../../state/CalendarState.ts";

export default {
  name: "calendar provider get",
  description: "/calendar provider get - Show current provider",
  help: `# /calendar provider get

Display the currently active calendar provider.

## Example

/calendar provider get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> =>
    `Current provider: ${agent.getState(CalendarState).activeProvider ?? "(none)"}`,
} satisfies TokenRingAgentCommand;
