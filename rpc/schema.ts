import type {RPCSchema} from "@tokenring-ai/rpc/types";
import {z} from "zod";
import {AgentNotFoundSchema} from "@tokenring-ai/agent/schema";
import {CalendarEventSchema} from "../CalendarProvider.ts";

export default {
  name: "Calendar RPC",
  path: "/rpc/calendar",
  methods: {
    getCalendarProviders: {
      type: "query",
      input: z.object({}),
      result: z.object({
        providers: z.array(z.string()),
      }),
    },
    getUpcomingEvents: {
      type: "query",
      input: z.object({
        provider: z.string(),
        limit: z.number().int().positive().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
      result: z.object({
        events: z.array(CalendarEventSchema),
        count: z.number(),
        message: z.string(),
      }),
    },
    searchEvents: {
      type: "query",
      input: z.object({
        provider: z.string(),
        query: z.string(),
        limit: z.number().int().positive().optional(),
      }),
      result: z.object({
        events: z.array(CalendarEventSchema),
        count: z.number(),
        message: z.string(),
      }),
    },
    createEvent: {
      type: "mutation",
      input: z.object({
        provider: z.string(),
        title: z.string(),
        startAt: z.string().datetime(),
        endAt: z.string().datetime(),
        description: z.string().optional(),
        location: z.string().optional(),
        allDay: z.boolean().optional(),
      }),
      result: z.object({
        event: CalendarEventSchema,
        message: z.string(),
      }),
    },
    updateEvent: {
      type: "mutation",
      input: z.object({
        id: z.string(),
        provider: z.string(),
        updatedData: CalendarEventSchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }).partial(),
      }),
      result: z.object({
        event: CalendarEventSchema,
        message: z.string(),
      }),
    },
    deleteEvent: {
      type: "mutation",
      input: z.object({
        id: z.string(),
        provider: z.string(),
      }),
      result: z.object({
        message: z.string(),
      }),
    },
    getCalendarState: {
      type: "query",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.discriminatedUnion("status", [
        z.object({
          status: z.literal('success'),
          selectedEventId: z.string().nullable(),
          selectedProvider: z.string().nullable(),
          availableProviders: z.array(z.string()),
        }),
        AgentNotFoundSchema
      ]),
    },
    updateCalendarState: {
      type: "mutation",
      input: z.object({
        agentId: z.string(),
        selectedProvider: z.string().optional(),
        selectedEventId: z.string().optional(),
      }),
      result: z.discriminatedUnion("status", [
        z.object({
          status: z.literal('success'),
          selectedEventId: z.string().nullable(),
          selectedProvider: z.string().nullable(),
          availableProviders: z.array(z.string()),
        }),
        AgentNotFoundSchema
      ]),
    },
  },
} satisfies RPCSchema;
