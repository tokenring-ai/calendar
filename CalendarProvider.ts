import z from "zod";

export interface CalendarAttendee {
  email: string;
  name?: string | undefined;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
}

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().exactOptional(),
  location: z.string().exactOptional(),
  startAt: z.date(),
  endAt: z.date(),
  allDay: z.boolean().exactOptional(),
  attendees: z
    .array(
      z.object({
        email: z.string(),
        name: z.string().exactOptional(),
        responseStatus: z.enum(["accepted", "declined", "tentative", "needsAction"]).exactOptional(),
      }),
    )
    .exactOptional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).exactOptional(),
  url: z.string().exactOptional(),
  meetingUrl: z.string().exactOptional(),
  createdAt: z.number().exactOptional(),
  updatedAt: z.number().exactOptional(),
});

export type CalendarEvent = z.input<typeof CalendarEventSchema>;

export interface CalendarEventFilterOptions {
  limit?: number | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
}

export interface CalendarEventSearchOptions {
  query: string;
  limit?: number | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
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
   * Get upcoming calendar events.
   * @returns Array of events
   */
  getUpcomingEvents(filter: CalendarEventFilterOptions): Promise<CalendarEvent[]>;

  /**
   * Search calendar events.
   * @returns Array of events
   */
  searchEvents(filter: CalendarEventSearchOptions): Promise<CalendarEvent[]>;

  /**
   * Create a new calendar event.
   * @returns The created event
   */
  createEvent(data: CreateCalendarEventData): Promise<CalendarEvent>;

  /**
   * Update an event.
   * @returns The updated event
   */
  updateEvent(id: string, data: UpdateCalendarEventData): Promise<CalendarEvent>;

  /**
   * Get an event by ID.
   * @returns The selected event
   */
  getEventById(id: string): Promise<CalendarEvent>;

  /**
   * Delete an event.
   * CalendarService will handle clearing the state after deletion.
   */
  deleteEvent(id: string): Promise<void>;
}
