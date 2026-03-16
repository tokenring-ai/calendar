import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";
import {CalendarState} from "../../../state/CalendarState.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const calendarService = agent.requireServiceByType(CalendarService);
  const currentEvent = calendarService.getCurrentEvent(agent);
  if (!currentEvent) return "No calendar event is currently selected.\nUse /calendar event select to choose an event.";

  const lines = [
    `Provider: ${agent.getState(CalendarState).activeProvider}`,
    `Title: ${currentEvent.title}`,
    `Start: ${new Date(currentEvent.startAt).toLocaleString()}`,
    `End: ${new Date(currentEvent.endAt).toLocaleString()}`,
  ];
  if (currentEvent.location) lines.push(`Location: ${currentEvent.location}`);
  if (currentEvent.status) lines.push(`Status: ${currentEvent.status}`);
  if (currentEvent.attendees?.length) lines.push(`Attendees: ${currentEvent.attendees.map(attendee => attendee.name ?? attendee.email).join(", ")}`);
  if (currentEvent.description) lines.push(`Description: ${currentEvent.description}`);
  if (currentEvent.url) lines.push(`URL: ${currentEvent.url}`);
  if (currentEvent.meetingUrl) lines.push(`Meeting URL: ${currentEvent.meetingUrl}`);
  return lines.join("\n");
}

const help = `# /calendar event info

Display information about the currently selected event.

## Example

/calendar event info`;

export default {name: "calendar event info", description: "Show event details", help, execute} satisfies TokenRingAgentCommand;
