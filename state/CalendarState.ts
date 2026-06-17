import type { Agent } from "@tokenring-ai/agent";
import { AgentStateSlice } from "@tokenring-ai/agent/types";
import deepClone from "@tokenring-ai/utility/object/deepClone";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import { z } from "zod";
import { CalendarEventSchema, type ParsedCalendarEvent } from "../CalendarProvider.ts";
import { type CalendarAgentConfigSchema, CalendarWatchSchema } from "../schema.ts";

const serializationSchema = z
  .object({
    activeProvider: z.string().nullable(),
    currentEvent: CalendarEventSchema.nullable().optional(),
    watch: CalendarWatchSchema.optional(),
    processedEventIds: z.array(z.string()).optional(),
  })
  .prefault({ activeProvider: null, currentEvent: null });

export class CalendarState extends AgentStateSlice<typeof serializationSchema> {
  activeProvider: string | null;
  currentEvent: ParsedCalendarEvent | null;
  watch: z.output<typeof CalendarWatchSchema> | undefined;
  processedEventIds: Set<string>;
  isWatching: boolean;

  constructor(readonly initialConfig: z.output<typeof CalendarAgentConfigSchema>) {
    super("CalendarState", serializationSchema);
    this.activeProvider = initialConfig.provider ?? null;
    this.currentEvent = null;
    this.watch = deepClone(initialConfig.watch);
    this.processedEventIds = new Set();
    this.isWatching = false;
  }

  transferStateFromParent(parent: Agent): void {
    const parentState = parent.getState(CalendarState);
    this.activeProvider ??= parentState.activeProvider;
    this.currentEvent ??= deepClone(parentState.currentEvent);
    this.watch ??= deepClone(parentState.watch);
  }

  serialize(): z.output<typeof serializationSchema> {
    return {
      activeProvider: this.activeProvider,
      currentEvent: this.currentEvent,
      watch: this.watch,
      processedEventIds: Array.from(this.processedEventIds),
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.activeProvider = data.activeProvider;
    this.currentEvent = data.currentEvent ?? null;
    this.watch = data.watch;
    this.processedEventIds = new Set(data.processedEventIds ?? []);
  }

  show(): string {
    const watchLines =
      this.watch && Object.keys(this.watch.actions ?? {}).length > 0
        ? Object.entries(this.watch.actions).map(([key, value]) => `${key}: Pattern: ${value.pattern}, Command: ${value.command}`)
        : ["No watches configured"];
    return `Active Calendar Provider: ${this.activeProvider}
Current Event: ${this.currentEvent?.title ?? "None"}
Watching: ${this.isWatching ? "Yes" : "No"}
Calendar Watches:
${markdownList(watchLines)}`;
  }
}
