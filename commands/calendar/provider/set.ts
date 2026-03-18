import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "providerName",
      description: "The provider name to set",
      required: true,
    },
  ]
} as const satisfies AgentCommandInputSchema;

async function execute({positionals: {providerName}, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const calendarService = agent.requireServiceByType(CalendarService);

  const available = calendarService.getAvailableProviders();
  if (available.includes(providerName)) {
    calendarService.setActiveProvider(providerName, agent);
    return `Active provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

const help = `Set the active calendar provider by name.

## Example

/calendar provider set google-calendar`;

export default {name: "calendar provider set", description: "Set the active provider", inputSchema, help, execute} satisfies TokenRingAgentCommand<typeof inputSchema>;
