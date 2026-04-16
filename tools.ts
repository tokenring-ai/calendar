import createEvent from "./tools/createEvent.ts";
import deleteCurrentEvent from "./tools/deleteCurrentEvent.ts";
import getCurrentEvent from "./tools/getCurrentEvent.ts";
import getUpcomingEvents from "./tools/getUpcomingEvents.ts";
import searchEvents from "./tools/searchEvents.ts";
import selectEvent from "./tools/selectEvent.ts";
import updateEvent from "./tools/updateEvent.ts";

export default [
  getUpcomingEvents,
  searchEvents,
  selectEvent,
  getCurrentEvent,
  createEvent,
  updateEvent,
  deleteCurrentEvent,
];
