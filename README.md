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
- Agent state for active provider selection
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
}
```

### `CalendarProvider`

Provider interface implemented by concrete packages.

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
      provider: "google-calendar"
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

- `CalendarAgentConfigSchema`
  - `provider?: string`
- `CalendarConfigSchema`
  - `providers: Record<string, unknown>`
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
- `/calendar event update [title] | [start ISO] | [end ISO] | [description]`
- `/calendar event get`
- `/calendar event select`
- `/calendar event info`
- `/calendar event clear`
- `/calendar event delete`

## State Management

This package maintains agent-scoped provider selection in `CalendarState`.

State responsibilities:

- active provider selection
- inheritance of provider choice from parent agents
- provider-agnostic coordination across concrete calendar implementations

Concrete providers are expected to manage current-event selection in their own state slices.

## Dependencies

Key runtime dependencies:

- `@tokenring-ai/agent`
- `@tokenring-ai/app`
- `@tokenring-ai/chat`
- `@tokenring-ai/scripting`
- `@tokenring-ai/utility`
- `zod`

## License

MIT License - see `LICENSE` if present in the package or repository root.
