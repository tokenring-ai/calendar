import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const calendarService = agent.requireServiceByType(CalendarService);
  const providerName = remainder.trim();
  if (!providerName) throw new CommandFailedError("Usage: /calendar provider set <name>");
  const available = calendarService.getAvailableProviders();
  if (available.includes(providerName)) {
    calendarService.setActiveProvider(providerName, agent);
    return `Active provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

const help = `# /calendar provider set <name>

Set the active calendar provider by name.

## Example

/calendar provider set google-calendar`;

export default {name: "calendar provider set", description: "Set the active provider", help, execute} satisfies TokenRingAgentCommand;
