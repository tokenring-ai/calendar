import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {
  args: {
    "--limit": {
      type: "number",
      required: false,
      description: "Optional limit for number of events",
      defaultValue: 10,
      minimum: 1,
      maximum: 100,
    }
  }
} as const satisfies AgentCommandInputSchema;

async function execute({args, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const limit = args["--limit"];

  const events = await agent.requireServiceByType(CalendarService).getUpcomingEvents({limit}, agent);
  return `
Upcoming events:

${markdownTable(
  ["ID", "Title", "Start", "End"],
  events.map(event => [event.id, event.title, event.startAt.toLocaleString(), event.endAt.toLocaleString()]),
)}
  `.trim();
}

const help = `# /calendar event list [limit]

List upcoming events from the active calendar provider.

## Example

/calendar event list
/calendar event list 5`;

export default {name: "calendar event list", description: "List upcoming events", inputSchema, help, execute} satisfies TokenRingAgentCommand<typeof inputSchema>;
