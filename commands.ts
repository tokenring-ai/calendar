import eventClear from "./commands/calendar/event/clear.ts";
import eventCreate from "./commands/calendar/event/create.ts";
import eventDelete from "./commands/calendar/event/delete.ts";
import eventGet from "./commands/calendar/event/get.ts";
import eventInfo from "./commands/calendar/event/info.ts";
import eventList from "./commands/calendar/event/list.ts";
import eventSearch from "./commands/calendar/event/search.ts";
import eventSelect from "./commands/calendar/event/select.ts";
import providerGet from "./commands/calendar/provider/get.ts";
import providerReset from "./commands/calendar/provider/reset.ts";
import providerSelect from "./commands/calendar/provider/select.ts";
import providerSet from "./commands/calendar/provider/set.ts";

export default [
  providerGet,
  providerSet,
  providerSelect,
  providerReset,
  eventList,
  eventSearch,
  eventCreate,
  eventGet,
  eventSelect,
  eventInfo,
  eventClear,
  eventDelete,
];
