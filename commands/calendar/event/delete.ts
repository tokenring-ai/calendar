import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import CalendarService from "../../../CalendarService.ts";

export default {
  name: "calendar event delete",
  description: "Delete current event",
  help: `# /calendar event delete

Delete the currently selected event.

## Example

/calendar event delete`,
  execute: async (_remainder: string, agent: Agent): Promise<string> => {
    await agent.requireServiceByType(CalendarService).deleteCurrentEvent(agent);
    return "Deleted current calendar event.";
  },
} satisfies TokenRingAgentCommand;
