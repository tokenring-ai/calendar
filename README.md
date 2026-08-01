# @tokenring-ai/calendar

## Overview

`@tokenring-ai/calendar` provides an abstract calendar interface for Token Ring. It defines a provider-based
architecture that enables agents to interact with calendar systems through tools, slash commands, RPC endpoints,
and scripting functions.

Key capabilities:

- List upcoming events from active calendar provider
- Search events by free-text query
- Select events for follow-up actions
- Create new calendar events
- Update currently selected events
- Delete currently selected events
- Manage calendar provider selection per agent
- Watch for new calendar events with automated pattern-based actions

This package is designed to be extended by provider packages such as Google Calendar, Outlook Calendar, CalDAV, or
custom scheduling systems.

## Installation

```bash
bun install
```

Typical usage in a Token Ring application:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import CalendarPlugin from "@tokenring-ai/calendar/plugin";

const app = new TokenRingApp();
app.usePlugin(CalendarPlugin, {
  calendar: {
    pollInterval: 300,
    agentDefaults: {
      provider: "google-calendar",
    },
  },
});
```

## Features

- Provider-based calendar architecture for multiple integrations
- Centralized `CalendarService` for provider registration and event routing
- State management through `CalendarState` (active provider, current event, watch configuration)
- Background event watching with configurable pattern matching and automated actions
- Chat tools for event operations (list, search, create, update, delete)
- Slash commands for provider and event workflows
- RPC endpoints for external integration
- Scripting functions for programmatic access

## Chat Commands

The package provides slash commands for calendar operations. Commands are organized into two groups:

### Provider Commands

| Command                         | Description                                    |
| :------------------------------ | :--------------------------------------------- |
| `/calendar provider get`        | Display the currently active calendar provider |
| `/calendar provider set <name>` | Set the active provider by name                |
| `/calendar provider select`     | Interactively select a calendar provider       |
| `/calendar provider reset`      | Reset to the initially configured provider     |

### Event Commands

| Command                                          | Description                                        |
| :----------------------------------------------- | :------------------------------------------------- |
| `/calendar event list [<limit>]` | List upcoming events (default: 10, range: 1-100) |
| `/calendar event search <query>`                 | Search events by query                             |
| `/calendar event create`                         | Create a new event (see examples for syntax)       |
| `/calendar event get`                            | Display the currently selected event title         |
| `/calendar event select`                         | Interactively select an upcoming event             |
| `/calendar event info`                           | Show detailed information about the selected event |
| `/calendar event clear`                          | Clear the current event selection                  |
| `/calendar event delete`                         | Delete the currently selected event                |

### Command Examples

```text
/calendar provider get
/calendar provider set google-calendar
/calendar provider select
/calendar provider reset

/calendar event list
/calendar event list 20
/calendar event search standup
/calendar event create --title "Team sync" --start "2026-03-10T17:00:00.000Z" --end "2026-03-10T17:30:00.000Z" "Weekly status sync"
/calendar event get
/calendar event select
/calendar event info
/calendar event clear
/calendar event delete
```

## Tools

The package provides the following tools for AI agent interaction:

| Tool                          | Description                                 |
|-------------------------------|---------------------------------------------|
| `calendar_getUpcomingEvents` | Retrieve upcoming calendar events (returns a markdown table) |
| `calendar_searchEvents` | Search calendar events by query (returns a markdown table) |
| `calendar_selectEvent` | Select an event by ID for follow-up actions (returns formatted event details and JSON) |
| `calendar_getCurrentEvent` | Get the currently selected event (returns JSON or "no event selected") |
| `calendar_createEvent`        | Create a new calendar event                 |
| `calendar_updateEvent`        | Update the currently selected event         |
| `calendar_deleteCurrentEvent` | Delete the currently selected event         |

### Tool Schema Examples

```typescript
// calendar_getUpcomingEvents
{
  limit?: number;      // Optional limit (default: 10)
  from?: string;       // Optional ISO date-time start bound
  to?: string;         // Optional ISO date-time end bound
}

// calendar_searchEvents
{
  query: string;       // Required search query
  limit?: number;      // Optional limit (default: 10)
  from?: string;       // Optional ISO date-time start bound
  to?: string;         // Optional ISO date-time end bound
}

// calendar_selectEvent
{
  id: string;          // Unique identifier of the event to select
}

// calendar_getCurrentEvent
{}

// calendar_createEvent
{
  title: string;                       // Event title (required)
  startAt: string;                     // ISO format start time (required)
  endAt: string;                       // ISO format end time (required)
  description?: string;                // Optional description
  location?: string;                   // Optional location
  allDay?: boolean;                    // Optional all-day flag
  attendees?: Array<{                  // Optional attendees
    email: string;                     // Valid email address (required, validated)
    name?: string;                     // Optional display name
  }>;
}

// calendar_updateEvent
{
  title?: string;                      // Optional event title
  startAt?: string;                    // Optional ISO format start time
  endAt?: string;                      // Optional ISO format end time
  description?: string;                // Optional description
  location?: string;                   // Optional location
  allDay?: boolean;                    // Optional all-day flag
  attendees?: Array<{                  // Optional attendees
    email: string;                     // Valid email address (required, validated)
    name?: string;                     // Optional display name
  }>;
  status?: "confirmed" | "tentative" | "cancelled";  // Optional event status
}

// calendar_deleteCurrentEvent
{}
```

## Scripting Functions

The package registers the following scripting functions for programmatic access:

| Function                          | Parameters                          | Description                        |
| :-------------------------------- | :---------------------------------- | :--------------------------------- |
| `getUpcomingCalendarEvents`       | `limit?`                            | Get upcoming events as JSON string |
| `searchCalendarEvents`            | `query`, `limit?`                   | Search events by query             |
| `createCalendarEvent`             | `title`, `startIso`, `endIso`, `description?` | Create a new event       |
| `deleteCurrentCalendarEvent`      | (none)                              | Delete the currently selected event |

### Scripting Examples

```text
# Get upcoming events
getUpcomingCalendarEvents(5)

# Search for events
searchCalendarEvents("standup", 10)

# Create an event
createCalendarEvent("Team sync", "2026-03-10T17:00:00.000Z", "2026-03-10T17:30:00.000Z", "Weekly status sync")

# Delete current event
deleteCurrentCalendarEvent()
```

## Configuration

The package is configured under the `calendar` key in your plugin configuration.

```yaml
calendar:
  pollInterval: 300  # Default poll interval in seconds (transformed to milliseconds internally)
  agentDefaults:
    provider: "google-calendar"  # Initial provider name
    watch:
      checkInterval: 300  # Seconds between watch checks (default: 300)
      lookbackMinutes: 15  # How far back to check for new events (default: 15)
      actions:
        - pattern: "meeting|sync|standup"
          command: "/calendar event info"
        - pattern: "urgent|important"
          command: "/message alert --priority high"
```

### Configuration Schemas

#### CalendarConfigSchema

```typescript
{
  pollInterval: number;        // Default poll interval in seconds (default: 300, transformed to milliseconds)
  agentDefaults: CalendarAgentConfigSchema;
}
```

#### CalendarAgentConfigSchema

```typescript
{
  provider?: string;           // Initial provider name
  watch?: CalendarWatchSchema; // Watch configuration
}
```

#### CalendarWatchSchema

```typescript
{
  checkInterval: number;      // Seconds between checks (default: 300)
  lookbackMinutes: number;    // How far back to check (default: 15)
  actions: Array<{
    pattern: string;          // Regex pattern to match
    command: string;          // Command to execute on match
  }>;
}
```

### Environment Variables

This package does not define any environment variables. Configuration is handled through the plugin configuration.

## License

MIT License - see LICENSE file for details.

---

## Developer Reference

### Core Components

#### CalendarService

The main service class that provides calendar operations and provider management.

```typescript
class CalendarService implements TokenRingService {
  readonly name = "CalendarService";
  description = "Abstract interface for calendar operations";

  // Provider management (via KeyedRegistry)
  registerCalendarProvider: (name: string, provider: CalendarProvider) => void;
  getAvailableProviders: () => string[];
  requireCalendarProvider: (name: string) => CalendarProvider;

  // Event operations
  getUpcomingEvents: (filter: CalendarEventFilterOptions, agent: Agent) => Promise<ParsedCalendarEvent[]>;
  searchEvents: (filter: CalendarEventSearchOptions, agent: Agent) => Promise<ParsedCalendarEvent[]>;
  createEvent: (data: CreateCalendarEventData, agent: Agent) => Promise<ParsedCalendarEvent>;
  updateEvent: (data: UpdateCalendarEventData, agent: Agent) => Promise<ParsedCalendarEvent>;
  selectEventById: (id: string, agent: Agent) => Promise<ParsedCalendarEvent>;
  getCurrentEvent: (agent: Agent) => ParsedCalendarEvent | null;
  clearCurrentEvent: (agent: Agent) => void;
  deleteCurrentEvent: (agent: Agent) => Promise<void>;

  // Provider management per agent
  setActiveProvider: (name: string, agent: Agent) => void;

  // Watch functionality
  watchCalendar: (agent: Agent) => void;
  checkForNewEvents: (watch: CalendarWatchSchema, agent: Agent) => Promise<void>;

  // Utility methods
  formatEventForPatternMatching: (event: ParsedCalendarEvent) => string;
  requireActiveCalendarProvider: (agent: Agent) => CalendarProvider;
}
```

#### CalendarProvider

Interface for calendar provider implementations.

**Important**: Providers should NOT manage their own state. All state is handled by `CalendarService` in
`CalendarState`.

```typescript
interface CalendarProvider {
  description: string;

  /**
   * Get upcoming calendar events.
   * @returns Array of events
   */
  getUpcomingEvents: (filter: CalendarEventFilterOptions) => Promise<ParsedCalendarEvent[]>;

  /**
   * Search calendar events.
   * @returns Array of events
   */
  searchEvents: (filter: CalendarEventSearchOptions) => Promise<ParsedCalendarEvent[]>;

  /**
   * Create a new calendar event.
   * @returns The created event
   */
  createEvent: (data: CreateCalendarEventData) => Promise<ParsedCalendarEvent>;

  /**
   * Update an event.
   * @returns The updated event
   */
  updateEvent: (id: string, data: UpdateCalendarEventData) => Promise<ParsedCalendarEvent>;

  /**
   * Get an event by ID.
   * @returns The selected event
   */
  getEventById: (id: string) => Promise<ParsedCalendarEvent>;

  /**
   * Delete an event.
   * CalendarService will handle clearing the state after deletion.
   */
  deleteEvent: (id: string) => Promise<void>;
}
```

### Services

#### CalendarService Implementation

The `CalendarService` implements the `TokenRingService` interface and provides:

- **Provider Registry**: Uses `KeyedRegistry` to manage multiple calendar providers
- **Agent Attachment**: Initializes `CalendarState` and configures watch functionality
- **Background Tasks**: Runs periodic checks for new events when watching is enabled
- **State Management**: Centralizes all calendar-related state in `CalendarState`

Key methods:

```typescript
attach(agent: Agent, creationContext: AgentCreationContext): void {
  // Initialize state with agent config
  // Add provider info to creation context
  // Start watch if configured
}

watchCalendar(agent: Agent): void {
  // Start background task for periodic event checking
  // Respects agent signal for cancellation
}

checkForNewEvents(watch: CalendarWatchSchema, agent: Agent): Promise<void> {
  // Fetch events within lookback window
  // Filter for new events using processedEventIds
  // Match patterns and execute commands
}
```

### State Management

#### CalendarState

Manages all calendar-related agent state:

```typescript
class CalendarState extends AgentStateSlice {
  activeProvider: string | null;        // Currently active provider
  currentEvent: ParsedCalendarEvent | null;  // Currently selected event
  watch: CalendarWatchSchema | undefined; // Watch configuration
  processedEventIds: Set<string>;       // IDs of already processed events
  isWatching: boolean;                  // Whether watch is active

  constructor(readonly initialConfig: CalendarAgentConfigSchema);
  transferStateFromParent(parent: Agent): void;
  serialize(): z.output<typeof serializationSchema>;
  deserialize(data: z.output<typeof serializationSchema>): void;
  show(): string;
}
```

**State Properties**:

- `activeProvider`: Currently active calendar provider (from initial config or set via `setActiveProvider`)
- `currentEvent`: Currently selected event for follow-up actions
- `watch`: Watch configuration for automatic event processing
- `processedEventIds`: Set of event IDs that have been processed by watches
- `isWatching`: Flag indicating if background watch task is active

**State Transitions**:

- `createEvent()` -> sets `currentEvent` to created event
- `updateEvent()` -> updates `currentEvent` with modified data
- `selectEventById()` -> sets `currentEvent` to selected event
- `clearCurrentEvent()` -> sets `currentEvent` to null
- `deleteCurrentEvent()` -> sets `currentEvent` to null after deletion
- `watchCalendar()` -> sets `isWatching` to true, starts background task
- `checkForNewEvents()` -> adds new event IDs to `processedEventIds`

### RPC Endpoints

The package registers an RPC endpoint at `/rpc/calendar` with the following methods:

#### getCalendarProviders

```typescript
{
  type: "query";
  input: {};
  result: {
    providers: string[];
  };
}
```

#### getUpcomingEvents

```typescript
{
  type: "query";
  input: {
    provider: string;
    limit?: number;
    from?: string;  // ISO datetime
    to?: string;    // ISO datetime
  };
  result: {
    events: ParsedCalendarEvent[];
    count: number;
    message: string;
  };
}
```

#### searchEvents

```typescript
{
  type: "query";
  input: {
    provider: string;
    query: string;
    limit?: number;
  };
  result: {
    events: ParsedCalendarEvent[];
    count: number;
    message: string;
  };
}
```

#### createEvent

```typescript
{
  type: "mutation";
  input: {
    provider: string;
    title: string;
    startAt: string;  // ISO datetime
    endAt: string;    // ISO datetime
    description?: string;
    location?: string;
    allDay?: boolean;
  };
  result: {
    event: ParsedCalendarEvent;
    message: string;
  };
}
```

#### updateEvent

```typescript
{
  type: "mutation";
  input: {
    id: string;
    provider: string;
    updatedData: Partial<Omit<ParsedCalendarEvent, "id" | "createdAt" | "updatedAt">>;
  };
  result: {
    event: ParsedCalendarEvent;
    message: string;
  };
}
```

#### deleteEvent

```typescript
{
  type: "mutation";
  input: {
    id: string;
    provider: string;
  };
  result: {
    message: string;
  };
}
```

#### getCalendarState

```typescript
{
  type: "query";
  input: {
    agentId: string;
  };
  result: {
    status: "success" | "agentNotFound";
    selectedEventId: string | null;
    selectedProvider: string | null;
    availableProviders: string[];
  };
}
```

#### updateCalendarState

```typescript
{
  type: "mutation";
  input: {
    agentId: string;
    selectedProvider?: string;
    selectedEventId?: string;
  };
  result: {
    status: "success" | "agentNotFound";
    selectedEventId: string | null;
    selectedProvider: string | null;
    availableProviders: string[];
  };
}
```

### Usage Examples

#### Provider Registration

```typescript
import CalendarService from "@tokenring-ai/calendar/CalendarService";
import type { CalendarProvider } from "@tokenring-ai/calendar/CalendarProvider";

class MyCalendarProvider implements CalendarProvider {
  description = "My Custom Calendar";

  async getUpcomingEvents(filter) {
    // Implementation
    return events;
  }

  async searchEvents(filter) {
    // Implementation
    return events;
  }

  async createEvent(data) {
    // Implementation
    return event;
  }

  async updateEvent(id, data) {
    // Implementation
    return event;
  }

  async getEventById(id) {
    // Implementation
    return event;
  }

  async deleteEvent(id) {
    // Implementation
  }
}

// Register with the service
const calendarService = agent.requireService(CalendarService);
calendarService.registerCalendarProvider("my-calendar", new MyCalendarProvider());
```

#### Programmatic Usage

```typescript
import CalendarService from "@tokenring-ai/calendar/CalendarService";

const calendarService = agent.requireService(CalendarService);

// Get upcoming events
const upcoming = await calendarService.getUpcomingEvents({ limit: 10 }, agent);

// Search events
const results = await calendarService.searchEvents(
  { query: "team meeting" },
  agent
);

// Create an event
const event = await calendarService.createEvent({
  title: "Team sync",
  startAt: new Date("2026-03-10T17:00:00.000Z"),
  endAt: new Date("2026-03-10T17:30:00.000Z"),
  description: "Weekly status sync",
}, agent);

// Select an event
await calendarService.selectEventById(event.id, agent);

// Update the selected event
await calendarService.updateEvent({
  description: "Weekly status sync with roadmap review",
}, agent);

// Get the current event
const currentEvent = calendarService.getCurrentEvent(agent);

// Clear the current event
calendarService.clearCurrentEvent(agent);

// Delete the current event
await calendarService.deleteCurrentEvent(agent);

// Start watching for new events
calendarService.watchCalendar(agent);

// Set active provider
calendarService.setActiveProvider("google-calendar", agent);
```

#### Watch Configuration Example

```typescript
{
  calendar: {
    agentDefaults: {
      watch: {
        checkInterval: 300,        // Check every 5 minutes
        lookbackMinutes: 15,       // Look for events in last 15 minutes
        actions: [
          {
            pattern: "meeting|sync|standup",
            command: "/calendar event info"
          },
          {
            pattern: "urgent|important|ASAP",
            command: "/message alert --priority high"
          }
        ]
      }
    }
  }
}
```

### Testing

#### Running Tests

```bash
bun test
# or
bun run test
```

#### Development Setup

```bash
# Install dependencies
bun install

# Run tests in watch mode
bun run test:watch

# Run type checking
bun run build

# Run test coverage
bun run test:coverage
```

### Dependencies

#### Runtime Dependencies

- `@tokenring-ai/agent` - Agent management and orchestration
- `@tokenring-ai/app` - Base application framework
- `@tokenring-ai/chat` - Chat tools and commands
- `@tokenring-ai/rpc` - RPC endpoint registration
- `@tokenring-ai/scripting` - Scripting function registration
- `@tokenring-ai/utility` - Utility functions
- `zod` - Schema validation

#### Dev Dependencies

- `typescript` - TypeScript compiler
- `bun test` - Testing framework

### Package Structure

```text
pkg/calendar/
├── index.ts                      # Package exports
├── plugin.ts                     # Plugin definition
├── schema.ts                     # Configuration schemas
├── CalendarProvider.ts           # Provider interface and types
├── CalendarService.ts            # Core service implementation
├── state/
│   └── CalendarState.ts          # State management
├── rpc/
│   ├── calendar.ts               # RPC endpoint definition
│   └── schema.ts                 # RPC schema definitions
├── tools.ts                      # Tool registry
├── tools/
│   ├── createEvent.ts            # Create event tool
│   ├── deleteCurrentEvent.ts     # Delete current event tool
│   ├── getCurrentEvent.ts        # Get current event tool
│   ├── getUpcomingEvents.ts      # Get upcoming events tool
│   ├── searchEvents.ts           # Search events tool
│   ├── selectEvent.ts            # Select event tool
│   └── updateEvent.ts            # Update event tool
├── commands.ts                   # Command registry
└── commands/
    └── calendar/
        ├── provider/
        │   ├── get.ts            # Get current provider command
        │   ├── set.ts            # Set provider command
        │   ├── select.ts         # Select provider command
        │   └── reset.ts          # Reset provider command
        └── event/
            ├── list.ts           # List events command
            ├── search.ts         # Search events command
            ├── create.ts         # Create event command
            ├── get.ts            # Get current event command
            ├── select.ts         # Select event command
            ├── info.ts           # Show event info command
            ├── clear.ts          # Clear event command
            └── delete.ts         # Delete event command
```

### Best Practices

#### Provider Implementation

When implementing a calendar provider:

1. **Do NOT manage state**: Let `CalendarService` handle all state mutations
2. **Return data only**: Provider methods should return event data without modifying state
3. **Read current event**: Use `getCurrentEvent(agent)` for update/delete operations
4. **Register properly**: Call `CalendarService.registerCalendarProvider()` to register

#### Watch Configuration

When configuring calendar watches:

1. **Use specific patterns**: Make regex patterns specific to avoid false positives
2. **Test patterns**: Verify patterns match expected event content
3. **Set appropriate intervals**: Balance responsiveness with resource usage
4. **Consider lookback**: Set lookback time based on your use case

### Schema Documentation

#### CalendarEvent Schema

```typescript
const CalendarEventSchema = z.object({
  id: z.string(),                              // Unique event identifier
  title: z.string(),                           // Event title
  description: z.string().exactOptional(),     // Event description
  location: z.string().exactOptional(),        // Event location
  startAt: z.coerce.date(),                    // Event start time (coerced to Date)
  endAt: z.coerce.date(),                      // Event end time (coerced to Date)
  allDay: z.boolean().exactOptional(),         // All-day flag
  attendees: z.array(                          // Event attendees
    z.object({
      email: z.string(),
      name: z.string().exactOptional(),
      responseStatus: z.enum([
        "accepted", "declined", "tentative", "needsAction"
      ]).exactOptional(),
    })
  ).exactOptional(),
  status: z.enum([                             // Event status
    "confirmed", "tentative", "cancelled"
  ]).exactOptional(),
  url: z.string().exactOptional(),             // Event URL
  meetingUrl: z.string().exactOptional(),      // Meeting join URL
  createdAt: z.coerce.date().exactOptional(),  // Creation timestamp (coerced to Date)
  updatedAt: z.coerce.date().exactOptional(),  // Update timestamp (coerced to Date)
});
```

**Note**: `CalendarEvent` is the input type (`z.input<typeof CalendarEventSchema>`) and
`ParsedCalendarEvent` is the output type (`z.output<typeof CalendarEventSchema>`). The
`z.coerce.date()` transforms string date inputs into `Date` objects.

#### CalendarAttendee Interface

```typescript
interface CalendarAttendee {
  email: string;                               // Required email address
  name?: string;                               // Optional display name
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
}
```

#### CalendarEventFilterOptions

```typescript
interface CalendarEventFilterOptions {
  limit?: number;                              // Optional limit on results
  from?: Date;                                 // Optional start time filter
  to?: Date;                                   // Optional end time filter
}
```

#### CalendarEventSearchOptions

```typescript
interface CalendarEventSearchOptions {
  query: string;                               // Required search query
  limit?: number;                              // Optional limit on results
  from?: Date;                                 // Optional start time filter
  to?: Date;                                   // Optional end time filter
}
```

#### CreateCalendarEventData

```typescript
type CreateCalendarEventData = Omit<ParsedCalendarEvent, "id" | "createdAt" | "updatedAt">;
```

#### UpdateCalendarEventData

```typescript
type UpdateCalendarEventData = Partial<Omit<ParsedCalendarEvent, "id" | "createdAt" | "updatedAt">>;
```

### Related Components

- `@tokenring-ai/agent` - Core agent system
- `@tokenring-ai/app` - Application framework
- `@tokenring-ai/chat` - Chat interface
- Provider packages (e.g., `@tokenring-ai/google-calendar`, `@tokenring-ai/outlook-calendar`)
