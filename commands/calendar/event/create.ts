import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {
  args: {
    "title": {
      type: "string",
      required: true,
      description: "Event title",
    },
    "start": {
      type: "string",
      required: true,
      description: "Event start time in ISO format",
    },
    "end": {
      type: "string",
      required: true,
      description: "Event end time in ISO format",
    },
  },
  positionals: [
    {
      name: "description",
      description: "Description of the event",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

async function execute({
                         args,
                         positionals,
                         agent,
                       }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const title = args.title;
  const startAt = args.start;
  const endAt = args.end;
  const description = positionals.description;

  const event = await agent.requireServiceByType(CalendarService).createEvent(
    {
      title,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      description,
    },
    agent,
  );

  return `Created event "${event.title}" (${event.id}) starting ${event.startAt.toLocaleString()}`;
}

const help = `Create a new calendar event.

## Example

/calendar event create Team sync | 2026-03-10T17:00:00.000Z | 2026-03-10T17:30:00.000Z | Weekly status sync`;

export default {
  name: "calendar event create",
  description: "Create an event",
  inputSchema,
  help,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
