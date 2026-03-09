import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownTable from "@tokenring-ai/utility/string/markdownTable";
import CalendarService from "../../../CalendarService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const trimmed = remainder.trim();
  const limit = trimmed ? Number.parseInt(trimmed, 10) : 10;
  if (!Number.isFinite(limit) || limit <= 0) throw new CommandFailedError("Usage: /calendar event list [limit]");

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

export default {name: "calendar event list", description: "/calendar event list - List upcoming events", help, execute} satisfies TokenRingAgentCommand;
