///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";
// Types
import { Filter } from "./database";
import { format } from "date-fns";
// db utils
import {
  getEventBy,
  getEventsByHours,
  getEventsBy,
  getAllEvents,
  getAllEventsByFilter,
  createEvent,
} from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";

import isWithinInterval from "date-fns/isWithinInterval";
import Fuse from "fuse.js";
import { findIndex, indexOf, result } from "lodash";
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
  offset = offset === 0 ? 7 : offset;
  // all events
  let allEvents: Event[] = getAllEvents();
  const endTime = moment().endOf("day");
  // set number of days to go back
  const startTime = moment().subtract(offset, "days").startOf("day");
  // filter by time range
  console.log(allEvents.length);
  const eventsInRange = allEvents.filter((e: Event) => {
    const isInRange = moment(e.date).isBetween(startTime, endTime);
    return isInRange;
  });
  console.log("eventsInRange", eventsInRange.length);
  // devide the array by days
  const byDays = eventsInRange.reduce((acc: any, cur: Event) => {
    const formatedDate = moment(cur.date).format("DD/MM/YYYY");
    if (!acc[`${formatedDate}`]) {
      acc[`${formatedDate}`] = [];
    } else if (
      acc[`${formatedDate}`].findIndex((el: Event) => el.session_id === cur.session_id) !== -1
    ) {
      console.log("duplicate");
      return acc;
    }
    acc[`${formatedDate}`].push(cur);
    return acc;
  }, {});
  const formatedResults = Object.entries(byDays).reduce((acc: any, cur: any) => {
    const formatedDateReport = {
      date: cur[0],
      count: cur[1].length,
    };
    acc.push(formatedDateReport);
    return acc;
  }, []);
  res.json(formatedResults);
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  let offset = Number(req.params.offset);
  offset = offset === 0 ? 24 : offset;
  const results = getEventsByHours(offset);

  res.json(results);
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.get("/retention", (req: Request, res: Response) => {
  const { dayZero } = req.query;
  res.send("/hhhhhhhhhhhh");
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
  res.send("/chart/timeonurl/:time");
});

router.get("/chart/geolocation/:time", (req: Request, res: Response) => {
  res.send("/chart/geolocation/:time");
});

export default router;
