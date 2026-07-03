import type { TreeLeaf } from "@tokenring-ai/agent/question";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";
import { CalendarState } from "../../../state/CalendarState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({ agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const calendarService = agent.requireServiceByType(CalendarService);
  const available = calendarService.getAvailableProviders();
  if (available.length === 0) return "No calendar providers are registered.";
  if (available.length === 1 && available[0]) {
    calendarService.setActiveProvider(available[0], agent);
    return `Only one provider configured, auto-selecting: ${available[0]}`;
  }

  const activeProvider = agent.getState(CalendarState).activeProvider;
  const tree: TreeLeaf[] = available.map((name: string) => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));
  const selection = await agent.askQuestion({
    message: "Select an active calendar provider",
    question: {
      type: "treeSelect",
      label: "Calendar Provider Selection",
      key: "result",
      defaultValue: activeProvider ? [activeProvider] : undefined,
      minimumSelections: 1,
      maximumSelections: 1,
      tree,
    },
  });

  if (selection?.[0]) {
    calendarService.setActiveProvider(selection[0], agent);
    return `Active provider set to: ${selection[0]}`;
  }

  return "Provider selection cancelled.";
}

const help = `Interactively select the active calendar provider.

## Example

/calendar provider select`;

export default {
  name: "calendar provider select",
  description: "Interactively select a provider",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
