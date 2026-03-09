import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import CalendarService from "../../../CalendarService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const query = remainder.trim();
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

export default {name: "calendar event search", description: "/calendar event search - Search events", help, execute} satisfies TokenRingAgentCommand;
