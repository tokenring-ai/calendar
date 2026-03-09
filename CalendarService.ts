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
import {CalendarAgentConfigSchema, CalendarConfigSchema} from "./schema.ts";
import {CalendarState} from "./state/CalendarState.ts";

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
      provider?.attach(agent, creationContext);
    }
    creationContext.items.push(`Selected calendar provider: ${agentConfig.provider ?? "(none)"}`);
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
    return this.requireActiveCalendarProvider(agent).createEvent(data, agent);
  }

  async updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent> {
    return this.requireActiveCalendarProvider(agent).updateEvent(data, agent);
  }

  async selectEventById(id: string, agent: Agent): Promise<CalendarEvent> {
    return this.requireActiveCalendarProvider(agent).selectEventById(id, agent);
  }

  getCurrentEvent(agent: Agent): CalendarEvent | null {
    const activeProvider = agent.getState(CalendarState).activeProvider;
    if (!activeProvider) return null;
    const provider = this.providers.getItemByName(activeProvider);
    if (!provider) return null;
    return provider.getCurrentEvent(agent);
  }

  async clearCurrentEvent(agent: Agent): Promise<void> {
    await this.requireActiveCalendarProvider(agent).clearCurrentEvent(agent);
  }

  async deleteCurrentEvent(agent: Agent): Promise<void> {
    await this.requireActiveCalendarProvider(agent).deleteCurrentEvent(agent);
  }
}
