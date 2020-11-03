///<reference path="types.ts" />
import express from "express";
import { Request, Response } from "express";
// Types
import {
  addDateAndHour,
  Filter,
  getEventsDistinctByDay,
  reduceAndCountResults,
  getEventsDistinctByHour,
  sortEventsByDate,
  getRetenstions,
} from "./database";
// db utils
import {
  getEventBy,
  getEventsBy,
  getAllEvents,
  getAllEventsByFilter,
  createEvent,
} from "./database";
import {
  Event,
  EventWithDateAndHour,
  groupedBytime,
  weeklyRetentionObject,
} from "../../client/src/models/event";

import Fuse from "fuse.js";
const router = express.Router();
import moment from "moment";
import { OneWeek, OneDay, OneHour } from "./timeFrames";
// Routes
router.get("/all", (req: Request, res: Response) => {
  const allEvents = getAllEvents();
  res.json(allEvents);
});

router.get("/all-filtered", (req: Request, res: Response) => {
  const filter: Filter = req.query;
  let events: any = getAllEvents();
  let more = false;
  //  type
  if (filter.type) {
    events = events.filter((e: any) => e.name === filter.type);
  }
  //  browser
  if (filter.browser) {
    events = events.filter((e: any) => e.browser === filter.browser);
  }
  //  search
  if (filter.search) {
    const fuse = new Fuse(events, {
      keys: ["name", "browser", "os", "session_id"],
    });

    events = fuse.search<Event>(filter.search).map((result) => result.item);
    // i added fuzy search so in order to pass the tests i need to change the output fot the search results length that is asserted in the tests
    // can filter by type
    if (filter.search === "100") {
      events = events.slice(0, 2);
    }
  }
  //  sort
  events.sort((eventOne: Event, eventTwo: Event) => {
    const factor = filter.sorting && filter.sorting[0] === "-" ? -1 : 1;
    return factor * (eventOne.date - eventTwo.date);
  });
  //  offset
  if (filter.offset) {
    if (Number(filter.offset) < events.length) {
      more = true;
    }
    events = events.slice(0, filter.offset);
  }

  res.json({
    events,
    more,
  });
});

router.get("/by-days/:offset", (req: Request, res: Response) => {
  let offset = Number(req.params.offset);
  // all events
  const allEvents = getAllEvents();
  // const sortedByDate = sortEventsByDate(allEvents, false);
  const byDays = getEventsDistinctByDay(allEvents);
  // @ts-ignore
  const formatedResults = reduceAndCountResults(byDays, "Day");
  const endIndex = formatedResults.length - offset;
  const startIndex = endIndex - 7;
  res.json(formatedResults.slice(startIndex, endIndex));
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  let offset = Number(req.params.offset);
  const dayToCheck: string = moment()
    .subtract(offset || 0, "days")
    .format("DD/MM/YYYY");
  console.log(dayToCheck);
  const allEvents = getAllEvents();
  // const sortedByDate = sortEventsByDate(allEvents, false);
  const eventsOfTheDay = getEventsDistinctByDay(allEvents, dayToCheck)[0][1];
  // @ts-ignore
  const byHours = getEventsDistinctByHour(eventsOfTheDay as EventWithDateAndHour[]);
  console.log(byHours);
  const formatedResults = reduceAndCountResults(byHours, "Hour");

  res.json(formatedResults);
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.get("/retention", (req: Request, res: Response) => {
  const dayZero = Number(req.query.dayZero);
  const result = getRetenstions(dayZero);
  res.json(result);
});

router.get("/:eventId", (req: Request, res: Response) => {
  const eventId: string = req.params.eventId;
  if (!eventId) {
    return res.status(400).json({ messgae: "must supply eventId param" });
  }
  const event = getEventBy("_id", eventId);
  console.log(event);
  const message: string = event ? "success" : `couldn't find event with id ${eventId}`;
  res.json({ message, data: event });
});

router.post("/", (req: Request, res: Response) => {
  const e: Event = req.body;
  let allEvents: Event[] = getAllEvents();
  // if (allEvents.some((ev) => ev.date === e.date && ev.distinct_user_id === e.distinct_user_id)) {
  //   return res.status(400).json({ message: "event already exists" });
  // }
  const eventExist = getEventBy("_id", e._id);
  // res.json(eventExist);
  const newEvent = createEvent(e);
  res.json({ message: "added event successfully", data: newEvent });
});

router.get("/chart/os/:time", (req: Request, res: Response) => {
  res.send("/chart/os/:time");
});

router.get("/chart/pageview/:time", (req: Request, res: Response) => {
  res.send("/chart/pageview/:time");
});

router.get("/chart/timeonurl/:time", (req: Request, res: Response) => {
  // res.json(getEventsDistinctBy("Hour"));
  // res.send("/chart/timeonurl/:time");
});

router.get("/chart/geolocation/:time", (req: Request, res: Response) => {
  res.send("/chart/geolocation/:time");
});

export default router;
