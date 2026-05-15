import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { TreeLeaf } from "@tokenring-ai/agent/question";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

async function execute({ agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const calendarService = agent.requireServiceByType(CalendarService);

  try {
    const events = await calendarService.getUpcomingEvents({ limit: 25 }, agent);
    if (!events?.length) return "No events found.";

    const tree: TreeLeaf[] = events.map(event => ({
      name: `${event.title} (${new Date(event.startAt).toLocaleString()})`,
      value: event.id,
    }));

    const selection = await agent.askQuestion({
      message: "Choose a calendar event to inspect",
      question: {
        type: "treeSelect",
        label: "Calendar Event Selection",
        key: "result",
        minimumSelections: 1,
        maximumSelections: 1,
        tree,
      },
    });

    if (!selection) return "Event selection cancelled.";

    const event = await calendarService.selectEventById(selection[0], agent);
    return `Selected event: "${event.title}"`;
  } catch (error: unknown) {
    throw new CommandFailedError(`Error during event selection: ${Error.isError(error) ? error.message : String(error)}`);
  }
}

const help = `Interactively select an upcoming event.

## Example

/calendar event select`;

export default {
  name: "calendar event select",
  description: "Select an event",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
