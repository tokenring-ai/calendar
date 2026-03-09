import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";
import {CalendarState} from "../../../state/CalendarState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const initialProvider = agent.getState(CalendarState).initialConfig.provider;
  if (!initialProvider) throw new CommandFailedError("No initial provider configured");
  agent.requireServiceByType(CalendarService).setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

const help = `# /calendar provider reset

Reset the active calendar provider to the initial configured value.

## Example

/calendar provider reset`;

export default {name: "calendar provider reset", description: "/calendar provider reset - Reset to initial provider", help, execute} satisfies TokenRingAgentCommand;
