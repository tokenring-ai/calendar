import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

export default {
  name: "calendar event get",
  description: "Show current event",
  help: `# /calendar event get

Display the currently selected calendar event title.

## Example

/calendar event get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    const event = agent.requireServiceByType(CalendarService).getCurrentEvent(agent);
    return event ? `Current event: ${event.title}` : "No calendar event is currently selected.";
  },
} satisfies TokenRingAgentCommand;
