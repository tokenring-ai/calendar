import Agent from "@tokenring-ai/agent/Agent";
import type {AgentCreationContext} from "@tokenring-ai/agent/types";
import {TokenRingService} from "@tokenring-ai/app/types";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import {z} from "zod";
import type {
  CalendarEvent,
  CalendarEventFilterOptions,
  CalendarEventSearchOptions,
  CalendarProvider,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from "./CalendarProvider.ts";
import {CalendarAgentConfigSchema, CalendarConfigSchema, CalendarWatchSchema} from "./schema.ts";
import {CalendarState} from "./state/CalendarState.ts";
import {setTimeout as delay} from "node:timers/promises";

export default class CalendarService implements TokenRingService {
  readonly name = "CalendarService";
  description = "Abstract interface for calendar operations";

  private providers = new KeyedRegistry<CalendarProvider>();

  registerCalendarProvider = this.providers.register;
  getAvailableProviders = this.providers.getAllItemNames;

  constructor(readonly options: z.output<typeof CalendarConfigSchema>) {}

  attach(agent: Agent, creationContext: AgentCreationContext): void {
    const agentConfig = deepMerge(this.options.agentDefaults, agent.getAgentConfigSlice("calendar", CalendarAgentConfigSchema));
    agent.initializeState(CalendarState, agentConfig);
    for (const provider of this.providers.getAllItemValues()) {
      provider.attach?.(agent, creationContext);
    }
    creationContext.items.push(`Selected calendar provider: ${agentConfig.provider ?? "(none)"}`);

    if (agentConfig.watch) {
      this.watchCalendar(agent);
    }
  }

  watchCalendar(agent: Agent): void {
    const wasWatching = agent.mutateState(CalendarState, state => {
      if (state.isWatching) return true;
      state.isWatching = true;
      return false;
    });

    if (wasWatching) return;

    const watchConfig = agent.getState(CalendarState).watch;
    if (!watchConfig) return;

    const checkInterval = watchConfig.checkInterval * 1000; // Convert to milliseconds

    agent.runBackgroundTask(async (signal) => {
      while (!signal.aborted) {
        try {
          const watch = agent.getState(CalendarState).watch;
          if (!watch) break;

          await this.checkForNewEvents(watch, agent);
          await delay(checkInterval, null, {signal});
        } catch (error) {
          agent.errorMessage(`Error while checking for new calendar events: ${error}`);
        }
      }
      agent.mutateState(CalendarState, state => {
        state.isWatching = false;
      });
    });
  }

  async checkForNewEvents(watch: z.output<typeof CalendarWatchSchema>, agent: Agent): Promise<void> {
    const provider = this.requireActiveCalendarProvider(agent);
    
    // Calculate the time window to check
    const lookbackMs = watch.lookbackMinutes * 60 * 1000;
    const sinceTime = new Date(Date.now() - lookbackMs);

    // Get upcoming events from the provider
    const events = await provider.getUpcomingEvents({
      limit: 50,
      from: sinceTime,
    }, agent);

    // Filter for new events that haven't been processed
    const newEvents = agent.mutateState(CalendarState, state => {
      const newEvents: CalendarEvent[] = [];
      for (const event of events) {
        if (!state.processedEventIds.has(event.id)) {
          newEvents.push(event);
          state.processedEventIds.add(event.id);
        }
      }
      return newEvents;
    });

    // Process new events with configured actions
    for (const event of newEvents) {
      if (!watch.actions || watch.actions.length === 0) continue;

      const eventText = this.formatEventForPatternMatching(event);

      for (const action of watch.actions) {
        const pattern = new RegExp(action.pattern, "is");
        if (pattern.test(eventText)) {
          // Trigger the configured command
          agent.handleInput({
            from: `Calendar event: ${event.title}`,
            message: action.command,
            attachments: [
              {
                type: "attachment",
                name: event.title,
                encoding: "text",
                mimeType: "text/calendar",
                body: eventText,
                timestamp: Date.now(),
              },
            ],
          });
        }
      }
    }
  }

  formatEventForPatternMatching(event: CalendarEvent): string {
    const lines = [
      `Title: ${event.title}`,
      `Description: ${event.description ?? ""}`,
      `Location: ${event.location ?? ""}`,
      `Start: ${event.startAt.toISOString()}`,
      `End: ${event.endAt.toISOString()}`,
      `All Day: ${event.allDay ?? false}`,
    ];

    if (event.attendees?.length) {
      lines.push(`Attendees: ${event.attendees.map(a => `${a.name ?? ""} <${a.email}>`).join(", ")}`);
    }

    if (event.status) {
      lines.push(`Status: ${event.status}`);
    }

    if (event.url) {
      lines.push(`URL: ${event.url}`);
    }

    if (event.meetingUrl) {
      lines.push(`Meeting URL: ${event.meetingUrl}`);
    }

    return lines.join("\n");
  }

  requireActiveCalendarProvider(agent: Agent): CalendarProvider {
    const activeProvider = agent.getState(CalendarState).activeProvider;
    if (!activeProvider) throw new Error("No calendar provider is currently selected");
    return this.providers.requireItemByName(activeProvider);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(CalendarState, state => {
      state.activeProvider = name;
    });
  }

  async getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]> {
    return this.requireActiveCalendarProvider(agent).getUpcomingEvents(filter, agent);
  }

  async searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]> {
    return this.requireActiveCalendarProvider(agent).searchEvents(filter, agent);
  }

  async createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent> {
    const event = await this.requireActiveCalendarProvider(agent).createEvent(data, agent);
    // Set the created event as current
    agent.mutateState(CalendarState, state => {
      state.currentEvent = event;
    });
    return event;
  }

  async updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent> {
    const currentEvent = agent.getState(CalendarState).currentEvent;
    if (!currentEvent) throw new Error("No calendar event is currently selected");

    const newEvent = {
      ...currentEvent,
      ...data
    };
    newEvent.updatedAt = Date.now();

    const event = await this.requireActiveCalendarProvider(agent).updateEvent(currentEvent.id, newEvent, agent);
    // Update the current event in state
    agent.mutateState(CalendarState, state => {
      state.currentEvent = event;
    });
    return event;
  }

  async selectEventById(id: string, agent: Agent): Promise<CalendarEvent> {
    const event = await this.requireActiveCalendarProvider(agent).selectEventById(id, agent);
    // Set the selected event as current
    agent.mutateState(CalendarState, state => {
      state.currentEvent = event;
    });
    return event;
  }

  getCurrentEvent(agent: Agent): CalendarEvent | null {
    return agent.getState(CalendarState).currentEvent;
  }

  async clearCurrentEvent(agent: Agent): Promise<void> {
    agent.mutateState(CalendarState, state => {
      state.currentEvent = null;
    });
  }

  async deleteCurrentEvent(agent: Agent): Promise<void> {
    const currentEvent = this.getCurrentEvent(agent);
    if (!currentEvent) throw new Error("No calendar event is currently selected");

    await this.requireActiveCalendarProvider(agent).deleteEvent(currentEvent.id, agent);
    
    // Clear the current event from state after deletion
    agent.mutateState(CalendarState, state => {
      state.currentEvent = null;
    });
  }
}
