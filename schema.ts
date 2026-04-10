import {z} from "zod";

export const CalendarWatchSchema = z
  .object({
    checkInterval: z.number().int().positive().default(300), // seconds
    lookbackMinutes: z.number().int().positive().default(15), // how far back to check for new events
    actions: z
      .array(
        z.object({
          pattern: z.string(),
          command: z.string(),
        }),
      )
      .default([]),
  })
  .prefault({});

export const CalendarAgentConfigSchema = z
  .object({
    provider: z.string().optional(),
    watch: CalendarWatchSchema.optional(),
  })
  .default({});

export const CalendarConfigSchema = z.object({
  pollInterval: z
    .number()
    .default(300)
    .transform((seconds) => seconds * 1000), // default 5 minutes
  agentDefaults: CalendarAgentConfigSchema.prefault({}),
});
