import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import CalendarService from "../../../CalendarService.ts";

const inputSchema = {
  args: {},
  prompt: {
    description: "Search query",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const query = prompt.trim();
  if (!query) throw new CommandFailedError("Usage: /calendar event search <query>");

  const events = await agent.requireServiceByType(CalendarService).searchEvents({query}, agent);
  return `
Search results for "${query}":

${markdownTable(
  ["ID", "Title", "Start", "Location"],
  events.map(event => [event.id, event.title, event.startAt.toLocaleString(), event.location ?? ""]),
)}
  `.trim();
}

const help = `# /calendar event search <query>

Search calendar events.

## Example

/calendar event search standup`;

export default {name: "calendar event search", description: "Search events", inputSchema, help, execute} satisfies TokenRingAgentCommand<typeof inputSchema>;
