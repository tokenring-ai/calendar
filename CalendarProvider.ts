import {Agent} from "@tokenring-ai/agent";
import type {AgentCreationContext} from "@tokenring-ai/agent/types";

export interface CalendarAttendee {
  email: string;
  name?: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
}

export interface CalendarEvent {
  id: string;
  calendarId?: string;
  title: string;
  description?: string;
  location?: string;
  startAt: Date;
  endAt: Date;
  allDay?: boolean;
  attendees?: CalendarAttendee[];
  status?: "confirmed" | "tentative" | "cancelled";
  url?: string;
  meetingUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CalendarEventFilterOptions {
  limit?: number;
  from?: Date;
  to?: Date;
  calendarId?: string;
}

export interface CalendarEventSearchOptions {
  query: string;
  limit?: number;
  from?: Date;
  to?: Date;
  calendarId?: string;
}

export type CreateCalendarEventData = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">;

export type UpdateCalendarEventData = Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>;

export interface CalendarProvider {
  description: string;

  attach(agent: Agent, creationContext: AgentCreationContext): void;

  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;

  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;

  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;

  getCurrentEvent(agent: Agent): CalendarEvent | null;

  clearCurrentEvent(agent: Agent): Promise<void>;

  deleteCurrentEvent(agent: Agent): Promise<void>;
}
