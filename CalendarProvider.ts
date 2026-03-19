import {Agent} from "@tokenring-ai/agent";
import type {AgentCreationContext} from "@tokenring-ai/agent/types";
import z from "zod";

export interface CalendarAttendee {
  email: string;
  name?: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
}


export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.date(),
  endAt: z.date(),
  allDay: z.boolean().optional(),
  attendees: z.array(z.object({
    email: z.string(),
    name: z.string().optional(),
    responseStatus: z.enum(["accepted", "declined", "tentative", "needsAction"]).optional(),
  })).optional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).optional(),
  url: z.string().optional(),
  meetingUrl: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export type CalendarEvent = z.input<typeof CalendarEventSchema>

export interface CalendarEventFilterOptions {
  limit?: number;
  from?: Date;
  to?: Date;
}

export interface CalendarEventSearchOptions {
  query: string;
  limit?: number;
  from?: Date;
  to?: Date;
}

export type CreateCalendarEventData = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">;

export type UpdateCalendarEventData = Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>;

/**
 * CalendarProvider interface for calendar platform integrations.
 * 
 * NOTE: State management (currentEvent, activeProvider) is handled by CalendarService
 * and stored in CalendarState. Providers should NOT manage their own state slices.
 * 
 * - Providers should return event data without modifying agent state
 * - CalendarService manages setting currentEvent after create/select/update operations
 * - Providers can read currentEvent via getCurrentEvent() for operations like update/delete
 * - Providers should NOT call agent.mutateState() or agent.initializeState()
 */
export interface CalendarProvider {
  description: string;

  /**
   * Attach the provider to the agent.
   * Providers should NOT initialize state here - state is managed by CalendarService.
   */
  attach?(agent: Agent, creationContext: AgentCreationContext): void;

  /**
   * Get upcoming calendar events.
   * @returns Array of events (state not modified)
   */
  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;

  /**
   * Search calendar events.
   * @returns Array of events (state not modified)
   */
  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;

  /**
   * Create a new calendar event.
   * @returns The created event (CalendarService will set it as current)
   */
  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  /**
   * Update the currently selected event.
   * @returns The updated event (CalendarService will update current state)
   */
  updateEvent(id: string, data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  /**
   * Select an event by ID.
   * @returns The selected event (CalendarService will set it as current)
   */
  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;

  /**
   * Delete the currently selected event.
   * CalendarService will handle clearing the state after deletion.
   */
  deleteEvent(id: string, agent: Agent): Promise<void>;
}
