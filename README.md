# @tokenring-ai/calendar

## Overview

`@tokenring-ai/calendar` provides an abstract calendar layer for Token Ring. It defines a provider interface and shared service/plugin wiring so agents can inspect and manage calendars through tools, slash commands, and scripting functions.

Key responsibilities:

- List upcoming events
- Search events by free-text query
- Select an event for follow-up work
- Create and update events
- Delete the current event
- Manage calendar provider selection per agent
- **Watch for new calendar events** with automated actions

This package is designed to be extended by provider packages such as Google Calendar, Outlook Calendar, CalDAV, or internal scheduling systems.

## Installation

```bash
bun install
```

Typical application usage:

```ts
import CalendarPlugin from "@tokenring-ai/calendar/plugin";
```

## Features

- Provider-based calendar architecture
- Shared `CalendarService` for provider registration and routing
- **Centralized state management** in `CalendarState` (active provider + current event + watch state)
- **Event watching** with configurable patterns and automated actions
- Chat tools for listing, search, selection, creation, updates, and deletion
- Slash commands for provider and event workflows
- Scripting functions for upcoming events, search, creation, and deletion

## Core Components

### `CalendarService`

Main service class for calendar operations.

```ts
class CalendarService implements TokenRingService {
  /** Register a calendar provider by name */
  registerCalendarProvider(name: string, provider: CalendarProvider): void;
  /** Get all registered provider names */
  getAvailableProviders(): string[];
  /** Set the active provider for an agent */
  setActiveProvider(name: string, agent: Agent): void;
  /** Get upcoming events from the active provider */
  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;
  /** Search events in the active provider */
  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;
  /** Create a new event and set it as current */
  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  /** Update the currently selected event */
  updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  /** Select an event by ID and set it as current */
  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;
  /** Get the currently selected event */
  getCurrentEvent(agent: Agent): CalendarEvent | null;
  /** Clear the current event selection */
  clearCurrentEvent(agent: Agent): Promise<void>;
  /** Delete the currently selected event */
  deleteCurrentEvent(agent: Agent): Promise<void>;
  
  // Watch functionality
  /** Start watching for new calendar events */
  watchCalendar(agent: Agent): void;
  /** Check for new events based on watch configuration */
  checkForNewEvents(watch: CalendarWatchSchema, agent: Agent): Promise<void>;
```

### `CalendarProvider`

Provider interface implemented by concrete packages.

**Important**: Providers should NOT manage their own state. All state is handled by `CalendarService` in `CalendarState`.

```ts
interface CalendarProvider {
  description: string;

  /**
   * Attach the provider to the agent.
   * Providers should NOT initialize state here - state is managed by CalendarService.
   */
  attach?(agent: Agent, creationContext: AgentCreationContext): void;

  /**
   * Get upcoming calendar events.
   * @param filter - Optional filter for limiting results
   * @param agent - The agent instance
   * @returns Array of events (state not modified)
   */
  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;

  /**
   * Search calendar events.
   * @param filter - Search options including query and limits
   * @param agent - The agent instance
   * @returns Array of matching events (state not modified)
   */
  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;

  /**
   * Create a new calendar event.
   * @param data - Event creation data
   * @param agent - The agent instance
   * @returns The created event (CalendarService will set it as current)
   */
  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  /**
   * Update an event by ID.
   * @param id - The event ID to update
   * @param data - The update data
   * @param agent - The agent instance
   * @returns The updated event (CalendarService will update current state)
   */
  updateEvent(id: string, data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;

  /**
   * Select an event by ID.
   * @param id - The event ID to select
   * @param agent - The agent instance
   * @returns The selected event (CalendarService will set it as current)
   */
  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;

  /**
   * Delete an event by ID.
   * @param id - The event ID to delete
   * @param agent - The agent instance
   * CalendarService will handle clearing the state after deletion.
   */
  deleteEvent(id: string, agent: Agent): Promise<void>;
```

### Key Types

- `CalendarEvent`: normalized event shape
- `CalendarAttendee`: normalized attendee shape
- `CalendarEventFilterOptions`: upcoming-event filters
- `CalendarEventSearchOptions`: search filters
- `CalendarWatchSchema`: watch configuration
- `CreateCalendarEventData` and `UpdateCalendarEventData`: event payloads

## Usage Examples

### Plugin Installation

```ts
import TokenRingApp from "@tokenring-ai/app";
import CalendarPlugin from "@tokenring-ai/calendar/plugin";

const app = new TokenRingApp();
app.usePlugin(CalendarPlugin, {
  calendar: {
    pollInterval: 300,  // Default poll interval in seconds
    agentDefaults: {
      provider: "google-calendar",
      watch: {
        checkInterval: 300, // 5 minutes
        lookbackMinutes: 15,
        actions: [
          {
            pattern: "meeting|sync|standup",
            command: "/calendar event info",
          },
          {
            pattern: "urgent|important",
            command: "/message alert --priority high",
          },
        ],
      },
    },
    providers: {
      "google-calendar": {
        type: "google-calendar",
        description: "Primary calendar",
        account: "primary",
        calendarId: "primary",
      },
    },
  },
});
```

### Programmatic Service Usage

```ts
import {CalendarService} from "@tokenring-ai/calendar";

const calendarService = agent.requireServiceByType(CalendarService);

// Get upcoming events
const upcoming = await calendarService.getUpcomingEvents({limit: 10}, agent);

// Create a new event
const event = await calendarService.createEvent({
  title: "Team sync",
  startAt: new Date("2026-03-10T17:00:00.000Z"),
  endAt: new Date("2026-03-10T17:30:00.000Z"),
  description: "Weekly status sync",
}, agent);

// Select an event for follow-up
await calendarService.selectEventById(event.id, agent);

// Update the currently selected event
const currentEvent = calendarService.getCurrentEvent(agent);
if (currentEvent) {
  await calendarService.updateEvent({
    description: "Weekly status sync with roadmap review",
  }, agent);
}

// Start watching for new events
calendarService.watchCalendar(agent);
```

### Example Commands

```text
/calendar provider select
/calendar event list 10
/calendar event search standup
/calendar event select
/calendar event create --title "Team sync" --start 2026-03-10T17:00:00.000Z --end 2026-03-10T17:30:00.000Z Weekly sync
/calendar event get
/calendar event info
/calendar event clear
/calendar event delete
```

## Configuration

The package is configured under the `calendar` key.

```ts
{
  calendar: {
    pollInterval: 300,  // Default poll interval in seconds
    agentDefaults: {
      provider: "google-calendar",
      watch: {
        checkInterval: 300,  // Seconds between checks
        lookbackMinutes: 15,  // How far back to check for new events
        actions: [
          {
            pattern: "meeting|sync",
            command: "/calendar event info"
          }
        ]
      }
    },
    providers: {
      "google-calendar": {
        type: "google-calendar",
        description: "Primary calendar",
        account: "primary",
        calendarId: "primary"
      }
    }
  }
}
```

### Schemas

- `CalendarWatchSchema`
  - `checkInterval: number` - Seconds between checks (default: 300)
  - `lookbackMinutes: number` - How far back to check for new events (default: 15)
  - `actions: Array<{pattern: string, command: string}>` - Pattern/command pairs
- `CalendarAgentConfigSchema`
  - `provider?: string` - Initial provider name
  - `watch?: CalendarWatchSchema` - Watch configuration
- `CalendarConfigSchema`
  - `providers: Record<string, unknown>` - Provider configurations
  - `pollInterval: number` - Default poll interval in seconds (default: 300)
  - `agentDefaults: CalendarAgentConfig` - Default agent configuration

## Integration

The plugin registers:

- `CalendarService` - Core service for calendar operations
- **Chat Tools** (from `pkg/calendar/tools.ts`):
  - `calendar_getUpcomingEvents` - Retrieve upcoming events
  - `calendar_searchEvents` - Search calendar events
  - `calendar_selectEvent` - Select an event by ID
  - `calendar_getCurrentEvent` - Get currently selected event
  - `calendar_createEvent` - Create a new event
  - `calendar_updateEvent` - Update the current event
  - `calendar_deleteCurrentEvent` - Delete the current event
- **Slash Commands** (from `pkg/calendar/commands.ts`):
  - Provider commands: `get`, `set`, `select`, `reset`
  - Event commands: `list`, `search`, `create`, `get`, `select`, `info`, `clear`, `delete`
- **Scripting Functions**:
  - `getUpcomingCalendarEvents(limit?)` - Get upcoming events
  - `searchCalendarEvents(query, limit?)` - Search events
  - `createCalendarEvent(title, startIso, endIso, description?)` - Create event
  - `deleteCurrentCalendarEvent()` - Delete current event

Concrete provider packages register implementations by calling `CalendarService.registerCalendarProvider(...)`.

## Provider Registration

Concrete provider packages (e.g., Google Calendar, Outlook Calendar) register their implementations with the `CalendarService` using the `KeyedRegistry` pattern:

```ts
import CalendarService from "@tokenring-ai/calendar";

// In provider package
const calendarService = agent.requireServiceByType(CalendarService);
calendarService.registerCalendarProvider("google-calendar", new GoogleCalendarProvider());
```

The `KeyedRegistry` pattern allows:

- Multiple provider implementations to coexist
- Dynamic provider selection per agent
- Clean separation between abstract service and concrete implementations

## Chat Commands

Provider commands:

- `/calendar provider get` - Show current provider
- `/calendar provider set <name>` - Set the active provider
- `/calendar provider select` - Interactively select a provider
- `/calendar provider reset` - Reset to initial configured provider

Event commands:

- `/calendar event list [limit]` - List upcoming events
- `/calendar event search <query>` - Search events by query
- `/calendar event create --title <title> --start <ISO> --end <ISO> <description>` - Create a new event
- `/calendar event get` - Show current event title
- `/calendar event select` - Interactively select an event
- `/calendar event info` - Show detailed event information
- `/calendar event clear` - Clear current event selection
- `/calendar event delete` - Delete current event

## State Management

This package uses **centralized state management** in `CalendarState` following the email package pattern.

### State Responsibilities

`CalendarState` manages:

- **Active provider selection**: Which calendar provider is currently active
- **Current event tracking**: The currently selected/modified event
- **Watch configuration**: Pattern matching and automated actions
- **Processed event IDs**: Tracking which events have been seen to avoid duplicates
- **Parent agent inheritance**: Provider, event, and watch context from parent agents
- **Serialization**: State persistence for checkpoints and agent restarts

### State Structure

```typescript
export class CalendarState extends AgentStateSlice {
  activeProvider: string | null;           // Active provider name
  currentEvent: CalendarEvent | null;      // Currently selected event
  watch: CalendarWatchSchema | undefined;  // Watch configuration
  processedEventIds: Set<string>;          // IDs of processed events
  isWatching: boolean;                     // Whether watch is active
}
```

### Watch Functionality

The calendar watch feature monitors for new calendar events and triggers automated actions based on pattern matching:

#### How It Works

1. **Background Task**: Runs periodically based on `checkInterval`
2. **Event Retrieval**: Fetches upcoming events from the last `lookbackMinutes`
3. **Duplicate Prevention**: Tracks processed event IDs to avoid re-processing
4. **Pattern Matching**: Tests event content against configured regex patterns
5. **Action Execution**: Triggers commands when patterns match

#### Configuration Example

```typescript
{
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
      },
      {
        pattern: "review|retrospective",
        command: "/tasks create --priority medium"
      }
    ]
  }
}
```

#### Pattern Matching

Events are formatted as text for pattern matching:

```
Title: Team Standup
Description: Daily sync meeting
Location: Conference Room A
Start: 2026-03-10T17:00:00.000Z
End: 2026-03-10T17:30:00.000Z
All Day: false
Attendees: John Doe <john@example.com>, Jane Smith <jane@example.com>
Status: confirmed
URL: https://calendar.google.com/...
```

Patterns are tested as case-insensitive regular expressions against this text.

### Provider Implementation Guidelines

**Providers should NOT manage their own state:**

- ❌ Do NOT call `agent.initializeState()` in provider `attach()`
- ❌ Do NOT call `agent.mutateState()` in provider methods
- ❌ Do NOT create provider-specific state slices
- ✅ Return event data from methods without modifying state
- ✅ Read current event via `getCurrentEvent(agent)` for update/delete operations
- ✅ Let `CalendarService` handle all state mutations

**CalendarService manages all state transitions:**

- `createEvent()` → sets `currentEvent` to created event
- `updateEvent()` → updates `currentEvent` with modified data
- `selectEventById()` → sets `currentEvent` to selected event
- `clearCurrentEvent()` → sets `currentEvent` to null
- `deleteCurrentEvent()` → sets `currentEvent` to null after deletion
- `watchCalendar()` → manages `isWatching` flag and background task

This centralized approach ensures:

- Consistent state management across all providers
- Easier checkpoint serialization and restoration
- Cleaner provider implementations
- Better separation of concerns between service and provider layers
- Reliable duplicate prevention for watched events

## Best Practices

### Provider Implementation

When implementing a calendar provider:

1. **Do NOT manage state**: Let `CalendarService` handle all state mutations
2. **Return data only**: Provider methods should return event data without modifying state
3. **Use existing state**: Read current event via `getCurrentEvent(agent)` for update/delete operations
4. **Register properly**: Call `CalendarService.registerCalendarProvider()` to register your implementation

### Watch Configuration

When configuring calendar watches:

1. **Use specific patterns**: Make regex patterns specific to avoid false positives
2. **Test patterns**: Verify patterns match expected event content
3. **Set appropriate intervals**: Balance responsiveness with resource usage
4. **Consider lookback**: Set lookback time based on your use case

## Dependencies

Key runtime dependencies:

- `@tokenring-ai/agent`
- `@tokenring-ai/app`
- `@tokenring-ai/chat`
- `@tokenring-ai/scripting`
- `@tokenring-ai/utility`
- `zod`
- `node:timers/promises`

## Testing and Development

### Running Tests

```bash
bun test
# or
bun run test
```

### Development Setup

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

### Package Structure

```
pkg/calendar/
├── index.ts              # Package exports
├── plugin.ts             # Plugin definition
├── schema.ts             # Configuration schemas
├── CalendarProvider.ts   # Provider interface
├── CalendarService.ts    # Core service
├── state/
│   └── CalendarState.ts  # State management
├── tools.ts              # Tool definitions
├── commands.ts           # Command definitions
├── tools/                # Individual tools
│   ├── createEvent.ts
│   ├── deleteCurrentEvent.ts
│   ├── getCurrentEvent.ts
│   ├── getUpcomingEvents.ts
│   ├── searchEvents.ts
│   ├── selectEvent.ts
│   └── updateEvent.ts
└── commands/             # Individual commands
    └── calendar/
        ├── provider/     # Provider commands
        └── event/        # Event commands
```

## License

MIT License - see `LICENSE` if present in the package or repository root.
