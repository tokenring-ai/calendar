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
  registerCalendarProvider(name: string, provider: CalendarProvider): void;
  getAvailableProviders(): string[];
  setActiveProvider(name: string, agent: Agent): void;
  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;
  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;
  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;
  getCurrentEvent(agent: Agent): CalendarEvent | null;
  clearCurrentEvent(agent: Agent): Promise<void>;
  deleteCurrentEvent(agent: Agent): Promise<void>;
  
  // Watch functionality
  watchCalendar(agent: Agent): void;
  checkForNewEvents(watch: CalendarWatchSchema, agent: Agent): Promise<void>;
}
```

### `CalendarProvider`

Provider interface implemented by concrete packages.

**Important**: Providers should NOT manage their own state. All state is handled by `CalendarService` in `CalendarState`.

```ts
interface CalendarProvider {
  description: string;
  attach(agent: Agent, creationContext: AgentCreationContext): void;
  getUpcomingEvents(filter: CalendarEventFilterOptions, agent: Agent): Promise<CalendarEvent[]>;
  searchEvents(filter: CalendarEventSearchOptions, agent: Agent): Promise<CalendarEvent[]>;
  createEvent(data: CreateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  updateEvent(data: UpdateCalendarEventData, agent: Agent): Promise<CalendarEvent>;
  selectEventById(id: string, agent: Agent): Promise<CalendarEvent>;
  getCurrentEvent(agent: Agent): CalendarEvent | null;
  clearCurrentEvent(agent: Agent): Promise<void>;
  deleteCurrentEvent(agent: Agent): Promise<void>;
}
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
    agentDefaults: {
      provider: "google-calendar",
      watch: {
        enabled: true,
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

const upcoming = await calendarService.getUpcomingEvents({limit: 10}, agent);
const event = await calendarService.createEvent({
  title: "Team sync",
  startAt: new Date("2026-03-10T17:00:00.000Z"),
  endAt: new Date("2026-03-10T17:30:00.000Z"),
  description: "Weekly status sync",
}, agent);

await calendarService.updateEvent({
  description: "Weekly status sync with roadmap review",
}, agent);

// Start watching for new events
calendarService.watchCalendar(agent);
```

### Example Commands

```text
/calendar provider select
/calendar event list 10
/calendar event search standup
/calendar event select
/calendar event create Team sync | 2026-03-10T17:00:00.000Z | 2026-03-10T17:30:00.000Z | Weekly sync
/calendar event update Team sync | 2026-03-10T17:00:00.000Z | 2026-03-10T17:45:00.000Z | Extended sync
/calendar event delete
```

## Configuration

The package is configured under the `calendar` key.

```ts
{
  calendar: {
    agentDefaults: {
      provider: "google-calendar",
      watch: {
        enabled: true,
        checkInterval: 300,
        lookbackMinutes: 15,
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
  - `enabled: boolean` - Whether watching is enabled
  - `checkInterval: number` - Seconds between checks (default: 300)
  - `lookbackMinutes: number` - How far back to check for new events (default: 15)
  - `actions: Array<{pattern: string, command: string}>` - Pattern/command pairs
- `CalendarAgentConfigSchema`
  - `provider?: string`
  - `watch?: CalendarWatchSchema`
- `CalendarConfigSchema`
  - `providers: Record<string, unknown>`
  - `pollInterval: number` - Default poll interval in milliseconds
  - `agentDefaults: CalendarAgentConfig`

## Integration

The plugin registers:

- `CalendarService`
- calendar chat tools from `pkg/calendar/tools.ts`
- calendar slash commands from `pkg/calendar/commands.ts`
- scripting functions:
  - `getUpcomingCalendarEvents(limit?)`
  - `searchCalendarEvents(query, limit?)`
  - `createCalendarEvent(title, startIso, endIso, description?)`
  - `deleteCurrentCalendarEvent()`

Concrete provider packages register implementations by calling `CalendarService.registerCalendarProvider(...)`.

## Chat Commands

Provider commands:

- `/calendar provider get`
- `/calendar provider set <name>`
- `/calendar provider select`
- `/calendar provider reset`

Event commands:

- `/calendar event list [limit]`
- `/calendar event search <query>`
- `/calendar event create <title> | <start ISO> | <end ISO> | [description]`
- `/calendar event update [title] | [start ISO> | [end ISO> | [description]`
- `/calendar event get`
- `/calendar event select`
- `/calendar event info`
- `/calendar event clear`
- `/calendar event delete`

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
    enabled: true,
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

## Dependencies

Key runtime dependencies:

- `@tokenring-ai/agent`
- `@tokenring-ai/app`
- `@tokenring-ai/chat`
- `@tokenring-ai/scripting`
- `@tokenring-ai/utility`
- `zod`
- `node:timers/promises`

## License

MIT License - see `LICENSE` if present in the package or repository root.
