import type { Agent } from "@tokenring-ai/agent";
import { AgentStateSlice } from "@tokenring-ai/agent/types";
import deepClone from "@tokenring-ai/utility/object/deepClone";
import isEmpty from "@tokenring-ai/utility/object/isEmpty";
import EnhancedSet from "@tokenring-ai/utility/set/enhancedSet";
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
  currentEvent: ParsedCalendarEvent | null = null;
  watch: z.output<typeof CalendarWatchSchema> | undefined;
  processedEventIds = new EnhancedSet<string>();
  isWatching: boolean = false;

  constructor(readonly initialConfig: z.output<typeof CalendarAgentConfigSchema>) {
    super("CalendarState", serializationSchema);
    this.activeProvider = initialConfig.provider ?? null;
    this.watch = deepClone(initialConfig.watch);
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
      processedEventIds: this.processedEventIds.valuesArray(),
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.activeProvider = data.activeProvider;
    this.currentEvent = data.currentEvent ?? null;
    this.watch = data.watch;
    this.processedEventIds = new EnhancedSet(data.processedEventIds);
  }

  show(): string {
    const watchLines =
      this.watch && isEmpty(this.watch.actions)
        ? ["No watches configured"]
        : this.watch!.actions.map(action => `Pattern: ${action.pattern}, Command: ${action.command}`);

    return `Active Calendar Provider: ${this.activeProvider}
Current Event: ${this.currentEvent?.title ?? "None"}
Watching: ${this.isWatching ? "Yes" : "No"}
Calendar Watches:
${markdownList(watchLines)}`;
  }
}
