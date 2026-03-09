import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const [title, startAt, endAt, ...descriptionParts] = remainder.split("|").map(part => part.trim());
  if (!title && !startAt && !endAt && descriptionParts.length === 0) {
    throw new CommandFailedError("Usage: /calendar event update [title] | [start ISO] | [end ISO] | [description]");
  }

  const event = await agent.requireServiceByType(CalendarService).updateEvent({
    title: title || undefined,
    startAt: startAt ? new Date(startAt) : undefined,
    endAt: endAt ? new Date(endAt) : undefined,
    description: descriptionParts.length > 0 ? descriptionParts.join(" | ") || undefined : undefined,
  }, agent);

  return `Updated event "${event.title}" (${event.id})`;
}

const help = `# /calendar event update [title] | [start ISO] | [end ISO] | [description]

Update the currently selected event.

## Example

/calendar event update Team sync | 2026-03-10T17:00:00.000Z | 2026-03-10T17:45:00.000Z | Extended sync`;

export default {name: "calendar event update", description: "/calendar event update - Update current event", help, execute} satisfies TokenRingAgentCommand;
