import type { ConfigFieldMeta } from "@tokenring-ai/app/config/metadata";
import { z } from "zod";

export const CalendarWatchSchema = z
  .object({
    checkInterval: z.number().int().positive().default(300).meta({ unit: "s", advanced: true, description: "How often to check for new events" } satisfies ConfigFieldMeta),
    lookbackMinutes: z
      .number()
      .int()
      .positive()
      .default(15)
      .meta({ unit: "min", advanced: true, description: "How far back to check for new events" } satisfies ConfigFieldMeta),
    actions: z
      .array(
        z.object({
          pattern: z.string().meta({ description: "Pattern matched against event content" } satisfies ConfigFieldMeta),
          command: z.string().meta({ description: "Command/prompt run when the pattern matches" } satisfies ConfigFieldMeta),
        }),
      )
      .default([])
      .meta({ description: "Actions triggered by matching calendar events" } satisfies ConfigFieldMeta),
  })
  .prefault({});

export const CalendarAgentConfigSchema = z
  .object({
    provider: z.string().exactOptional(),
    watch: CalendarWatchSchema.exactOptional(),
  })
  .default({});

export const CalendarConfigSchema = z
  .object({
    pollInterval: z
      .number()
      .default(300)
      .meta({ unit: "s", advanced: true, description: "How often calendars are polled" } satisfies ConfigFieldMeta)
      .transform(seconds => seconds * 1000), // default 5 minutes
    agentDefaults: CalendarAgentConfigSchema.prefault({}).meta({ label: "Agent Defaults" } satisfies ConfigFieldMeta),
  })
  .meta({ label: "Calendar", description: "Calendar integration and event-watching settings" } satisfies ConfigFieldMeta);
