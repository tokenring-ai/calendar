# @tokenring-ai/calendar

## Overview

`@tokenring-ai/calendar` provides an abstract calendar interface for Token Ring. It defines a provider-based architecture
that enables agents to interact with calendar systems through tools, slash commands, RPC endpoints, and scripting functions.

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

### Provider Commands

| Command | Description |
|---------|-------------|
| `/calendar provider get` | Display the currently active calendar provider |
| `/calendar provider set <name>` | Set the active provider by name |
| `/calendar provider select` | Interactively select a calendar provider |
| `/calendar provider reset` | Reset to the initially configured provider |

### Event Commands

| Command | Description |
|---------|-------------|
| `/calendar event list [limit]` | List upcoming events (default: 10) |
| `/calendar event search <query>` | Search events by query |
| `/calendar event create --title <title> --start <ISO> --end <ISO> <description>` | Create a new event |
| `/calendar event get` | Display the currently selected event title |
| `/calendar event select` | Interactively select an upcoming event |
| `/calendar event info` | Show detailed information about the selected event |
| `/calendar event clear` | Clear the current event selection |
| `/calendar event delete` | Delete the currently selected event |

### Command Examples

```text
/calendar provider get
/calendar provider set google-calendar
/calendar provider select
/calendar provider reset

/calendar event list
/calendar event list 20
/calendar event search standup
/calendar event create --title "Team sync" --start 2026-03-10T17:00:00.000Z --end 2026-03-10T17:30:00.000Z Weekly status sync
/calendar event get
/calendar event select
/calendar event info
/calendar event clear
/calendar event delete
```

## Tools

| Tool | Description |
|------|-------------|
| `calendar_getUpcomingEvents` | Retrieve upcoming calendar events |
| `calendar_searchEvents` | Search calendar events by query |
| `calendar_selectEvent` | Select an event by ID for follow-up actions |
| `calendar_getCurrentEvent` | Get the currently selected event |
| `calendar_createEvent` | Create a new calendar event |
| `calendar_updateEvent` | Update the currently selected event |
| `calendar_deleteCurrentEvent` | Delete the currently selected event |

### Tool Schema Examples

```typescript
// calendar_getUpcomingEvents
{
  limit?: number;      // Optional limit (default: 10)
  from?: string;       // Optional ISO date-time start bound
  to?: string;         // Optional ISO date-time end bound
}

// calendar_createEvent
{
  title: string;                       // Event title
  startAt: string;                     // ISO format start time
  endAt: string;                       // ISO format end time
  description?: string;                // Optional description
  location?: string;                   // Optional location
  allDay?: boolean;                    // Optional all-day flag
  attendees?: Array<{                  // Optional attendees
    email: string;
    name?: string;
  }>;
}

// calendar_updateEvent
{
  title?: string;
  startAt?: string;
  endAt?: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  attendees?: Array<{email: string; name?: string}>;
  status?: "confirmed" | "tentative" | "cancelled";
}
```

## Configuration

The package is configured under the `calendar` key in your plugin configuration.

```yaml
calendar:
  pollInterval: 300  # Default poll interval in seconds
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
  pollInterval: number;        // Default poll interval in seconds (default: 300)
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
  readonly description = "Abstract interface for calendar operations";

  // Provider management
  registerCalendarProvider: (name: string, provider: CalendarProvider) => void;
  getAvailableProviders: () => string[];
  requireCalendarProvider: (name: string) => CalendarProvider;

  // Event operations
  getUpcomingEvents: (filter: CalendarEventFilterOptions, agent: Agent) => Promise<CalendarEvent[]>;
  searchEvents: (filter: CalendarEventSearchOptions, agent: Agent) => Promise<CalendarEvent[]>;
  createEvent: (data: CreateCalendarEventData, agent: Agent) => Promise<CalendarEvent>;
  updateEvent: (data: UpdateCalendarEventData, agent: Agent) => Promise<CalendarEvent>;
  selectEventById: (id: string, agent: Agent) => Promise<CalendarEvent>;
  getCurrentEvent: (agent: Agent) => CalendarEvent | null;
  clearCurrentEvent: (agent: Agent) => void;
  deleteCurrentEvent: (agent: Agent) => Promise<void>;

  // Provider management per agent
  setActiveProvider: (name: string, agent: Agent) => void;

  // Watch functionality
  watchCalendar: (agent: Agent) => void;
  checkForNewEvents: (watch: CalendarWatchSchema, agent: Agent) => Promise<void>;
}
```

#### CalendarProvider

Interface for calendar provider implementations.

**Important**: Providers should NOT manage their own state. All state is handled by `CalendarService` in `CalendarState`.

```typescript
interface CalendarProvider {
  description: string;

  getUpcomingEvents: (filter: CalendarEventFilterOptions) => Promise<CalendarEvent[]>;
  searchEvents: (filter: CalendarEventSearchOptions) => Promise<CalendarEvent[]>;
  createEvent: (data: CreateCalendarEventData) => Promise<CalendarEvent>;
  updateEvent: (id: string, data: UpdateCalendarEventData) => Promise<CalendarEvent>;
  getEventById: (id: string) => Promise<CalendarEvent>;
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
  currentEvent: CalendarEvent | null;   // Currently selected event
  watch: CalendarWatchSchema | undefined; // Watch configuration
  processedEventIds: Set<string>;       // IDs of already processed events
  isWatching: boolean;                  // Whether watch is active
}
```

**State Transitions**:

- `createEvent()` → sets `currentEvent` to created event
- `updateEvent()` → updates `currentEvent` with modified data
- `selectEventById()` → sets `currentEvent` to selected event
- `clearCurrentEvent()` → sets `currentEvent` to null
- `deleteCurrentEvent()` → sets `currentEvent` to null after deletion
- `watchCalendar()` → manages `isWatching` flag

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
    events: CalendarEvent[];
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
    events: CalendarEvent[];
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
    event: CalendarEvent;
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
    updatedData: Partial<CalendarEvent>;
  };
  result: {
    event: CalendarEvent;
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
const calendarService = agent.requireServiceByType(CalendarService);
calendarService.registerCalendarProvider("my-calendar", new MyCalendarProvider());
```

#### Programmatic Usage

```typescript
import { CalendarService } from "@tokenring-ai/calendar";

const calendarService = agent.requireServiceByType(CalendarService);

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

// Start watching for new events
calendarService.watchCalendar(agent);
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
- `vitest` - Testing framework

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
  startAt: z.date(),                           // Event start time
  endAt: z.date(),                             // Event end time
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
  createdAt: z.number().exactOptional(),       // Creation timestamp
  updatedAt: z.number().exactOptional(),       // Update timestamp
});
```

### Related Components

- `@tokenring-ai/agent` - Core agent system
- `@tokenring-ai/app` - Application framework
- `@tokenring-ai/chat` - Chat interface
- Provider packages (e.g., `@tokenring-ai/google-calendar`, `@tokenring-ai/outlook-calendar`)
