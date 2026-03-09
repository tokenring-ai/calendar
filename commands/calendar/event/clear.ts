import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

export default {
  name: "calendar event clear",
  description: "/calendar event clear - Clear current event selection",
  help: `# /calendar event clear

Clear the current event selection.

## Example

/calendar event clear`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    await agent.requireServiceByType(CalendarService).clearCurrentEvent(agent);
    return "Event cleared. No calendar event is currently selected.";
  },
} satisfies TokenRingAgentCommand;
