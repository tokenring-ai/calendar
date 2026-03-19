import {Agent} from "@tokenring-ai/agent";
import {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {CalendarAgentConfigSchema, CalendarWatchSchema} from "../schema.ts";
import {type CalendarEvent, CalendarEventSchema} from "../CalendarProvider.ts";


const serializationSchema = z.object({
  activeProvider: z.string().nullable(),
  currentEvent: CalendarEventSchema.nullable().optional(),
  watch: CalendarWatchSchema.optional(),
  processedEventIds: z.array(z.string()).optional(),
}).prefault({activeProvider: null, currentEvent: null});

export class CalendarState extends AgentStateSlice<typeof serializationSchema> {
  activeProvider: string | null;
  currentEvent: CalendarEvent | null;
  watch: z.output<typeof CalendarWatchSchema> | undefined;
  processedEventIds: Set<string>;
  isWatching: boolean;

  constructor(readonly initialConfig: z.output<typeof CalendarAgentConfigSchema>) {
    super("CalendarState", serializationSchema);
    this.activeProvider = initialConfig.provider ?? null;
    this.currentEvent = null;
    this.watch = initialConfig.watch;
    this.processedEventIds = new Set();
    this.isWatching = false;
  }

  transferStateFromParent(parent: Agent): void {
    const parentState = parent.getState(CalendarState);
    this.activeProvider ??= parentState.activeProvider;
    this.currentEvent ??= parentState.currentEvent;
    this.watch ??= parentState.watch;
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

  show(): string[] {
    return [
      `Active Calendar Provider: ${this.activeProvider}`,
      `Current Event: ${this.currentEvent?.title ?? "None"}`,
      `Watching: ${this.isWatching ? "Yes" : "No"}`,
      ...(this.watch && Object.keys(this.watch.actions ?? {}).length > 0
        ? ["Calendar Watches:", ...Object.entries(this.watch.actions).map(([key, value]) => `  - ${key}: Pattern: ${value.pattern}, Command: ${value.command}`)]
        : ["No watches configured"]),
    ];
  }
}
