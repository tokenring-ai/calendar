import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const [title, startAt, endAt, ...descriptionParts] = remainder.split("|").map(part => part.trim());
  if (!title || !startAt || !endAt) {
    throw new CommandFailedError("Usage: /calendar event create <title> | <start ISO> | <end ISO> | [description]");
  }

  const event = await agent.requireServiceByType(CalendarService).createEvent({
    title,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    description: descriptionParts.join(" | ") || undefined,
  }, agent);

  return `Created event "${event.title}" (${event.id}) starting ${event.startAt.toLocaleString()}`;
}

const help = `# /calendar event create <title> | <start ISO> | <end ISO> | [description]

Create a new calendar event.

## Example

/calendar event create Team sync | 2026-03-10T17:00:00.000Z | 2026-03-10T17:30:00.000Z | Weekly status sync`;

export default {name: "calendar event create", description: "Create an event", help, execute} satisfies TokenRingAgentCommand;
