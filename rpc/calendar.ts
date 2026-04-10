import {AgentManager} from "@tokenring-ai/agent";
import type TokenRingApp from "@tokenring-ai/app";
import {createRPCEndpoint} from "@tokenring-ai/rpc/createRPCEndpoint";
import CalendarService from "../CalendarService.ts";
import {CalendarState} from "../state/CalendarState.ts";
import CalendarRpcSchema from "./schema.ts";

export default createRPCEndpoint(CalendarRpcSchema, {
  getCalendarProviders(_args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);

    return {
      providers: calendarService.getAvailableProviders(),
    };
  },
  async getUpcomingEvents(args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);
    const provider = calendarService.requireCalendarProvider(args.provider);

    const events = await provider.getUpcomingEvents({
      limit: args.limit,
      from: args.from ? new Date(args.from) : undefined,
      to: args.to ? new Date(args.to) : undefined,
    });

    return {
      events,
      count: events.length,
      message: `Found ${events.length} upcoming events`,
    };
  },

  async searchEvents(args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);
    const provider = calendarService.requireCalendarProvider(args.provider);

    const events = await provider.searchEvents({
      query: args.query,
      limit: args.limit,
    });

    return {
      events,
      count: events.length,
      message: `Found ${events.length} events matching "${args.query}"`,
    };
  },

  async createEvent(args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);
    const provider = calendarService.requireCalendarProvider(args.provider);

    const event = await provider.createEvent({
      title: args.title,
      startAt: new Date(args.startAt),
      endAt: new Date(args.endAt),
      description: args.description,
      location: args.location,
      allDay: args.allDay,
    });

    return {
      event,
      message: `Created event: ${event.id}`,
    };
  },

  async updateEvent(args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);
    const provider = calendarService.requireCalendarProvider(args.provider);

    const event = await provider.updateEvent(args.id, args.updatedData);

    return {
      event,
      message: `Updated event: ${event.id}`,
    };
  },

  async deleteEvent(args, app: TokenRingApp) {
    const calendarService = app.requireService(CalendarService);
    const provider = calendarService.requireCalendarProvider(args.provider);

    await provider.deleteEvent(args.id);

    return {
      message: `Deleted event: ${args.id}`,
    };
  },

  getCalendarState(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const calendarService = app.requireService(CalendarService);

    const state = agent.getState(CalendarState);

    return {
      selectedEventId: state.currentEvent?.id ?? null,
      selectedProvider: state.activeProvider,
      availableProviders: calendarService.getAvailableProviders(),
    };
  },

  async updateCalendarState(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) throw new Error("Agent not found");
    const calendarService = app.requireService(CalendarService);

    if (args.selectedProvider) {
      calendarService.setActiveProvider(args.selectedProvider, agent);
    }

    if (args.selectedEventId) {
      await calendarService.selectEventById(args.selectedEventId, agent);
    }

    const state = agent.getState(CalendarState);

    return {
      selectedEventId: state.currentEvent?.id ?? null,
      selectedProvider: state.activeProvider,
      availableProviders: calendarService.getAvailableProviders(),
    };
  },
});
