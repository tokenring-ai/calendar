import {z} from "zod";

export const CalendarAgentConfigSchema = z.object({
  provider: z.string().optional(),
}).default({});

export const CalendarConfigSchema = z.object({
  providers: z.record(z.string(), z.any()).default({}),
  agentDefaults: CalendarAgentConfigSchema.prefault({}),
});
