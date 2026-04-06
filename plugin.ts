import {AgentCommandService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {RpcService} from "@tokenring-ai/rpc";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService";
import {z} from "zod";
import CalendarService from "./CalendarService.ts";
import commands from "./commands.ts";
import calendarRPC from "./rpc/calendar.ts";
import {CalendarConfigSchema} from "./index.ts";
import packageJSON from "./package.json" with {type: "json"};
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  calendar: CalendarConfigSchema.prefault({}),
});

export default {
  name: packageJSON.name,
  displayName: "Calendar Service",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    const service = new CalendarService(config.calendar);
    app.services.register(service);

    app.services.waitForItemByType(ScriptingService, (scriptingService: ScriptingService) => {
      scriptingService.registerFunction("getUpcomingCalendarEvents", {
        type: "native",
        params: ["limit"],
        async execute(this: ScriptingThis, limit?: string): Promise<string> {
          const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
          const events = await this.agent.requireServiceByType(CalendarService).getUpcomingEvents({
            limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
          }, this.agent);
          return JSON.stringify(events);
        },
      });

      scriptingService.registerFunction("searchCalendarEvents", {
        type: "native",
        params: ["query", "limit"],
        async execute(this: ScriptingThis, query: string, limit?: string): Promise<string> {
          const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
          const events = await this.agent.requireServiceByType(CalendarService).searchEvents({
            query,
            limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
          }, this.agent);
          return JSON.stringify(events);
        },
      });

      scriptingService.registerFunction("createCalendarEvent", {
        type: "native",
        params: ["title", "startIso", "endIso", "description"],
        async execute(this: ScriptingThis, title: string, startIso: string, endIso: string, description?: string): Promise<string> {
          const event = await this.agent.requireServiceByType(CalendarService).createEvent({
            title,
            startAt: new Date(startIso),
            endAt: new Date(endIso),
            description,
          }, this.agent);
          return `Created event: ${event.id}`;
        },
      });

      scriptingService.registerFunction("deleteCurrentCalendarEvent", {
        type: "native",
        params: [],
        async execute(this: ScriptingThis): Promise<string> {
          await this.agent.requireServiceByType(CalendarService).deleteCurrentEvent(this.agent);
          return "Deleted current calendar event";
        },
      });
    });

    app.waitForService(ChatService, chatService => chatService.addTools(tools));
    app.waitForService(AgentCommandService, commandService => commandService.addAgentCommands(commands));

    app.waitForService(RpcService, rpcService => {
      rpcService.registerEndpoint(calendarRPC);
    });
  },
  config: packageConfigSchema,
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
