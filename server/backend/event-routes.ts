///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";
// Types
import { Filter } from "./database";

// db utils
import { getEventBy, getEventsBy, getAllEvents, getAllEventsByFilter } from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
// import { ensureAuthenticated, validateMiddleware } from "./helpers";

// import {
//   shortIdValidation,
//   searchValidation,
//   userFieldsValidator,
//   isUserValidator,
// } from "./validators";
import Fuse from "fuse.js";
const router = express.Router();

// Routes
router.get("/all", (req: Request, res: Response) => {
  const allEvents = getAllEvents();
  res.json(allEvents);
});

router.get("/all-filtered", (req: Request, res: Response) => {
  const filter: Filter = req.query;
  if (!filter.sorting) return res.status(400).json({ message: "must suplly sorting" });
  let events: any = getAllEvents();
  let more = false;
  // TODO: type
  if (filter.type) {
    events = events.filter((e: any) => e.name === filter.type);
  }
  // TODO: browser
  if (filter.browser) {
    events = events.filter((e: any) => e.browser === filter.browser);
  }
  // TODO: search
  if (filter.search) {
    const fuse = new Fuse(events, {
      keys: ["name", "browser", "os"],
    });
    events = fuse.search<Event>(filter.search).map((result) => result.item);
  }
  // TODO: sort
  events.sort((eventOne: Event, eventTwo: Event) => {
    const factor = filter.sorting[0] === "+" ? 1 : -1;
    return factor * (eventOne.date - eventTwo.date);
  });
  // TODO: offset
  if (filter.offset) {
    if (Number(filter.offset) < events.length) {
      more = true;
    }
    events = events.slice(0, filter.offset);
  }
  console.log(filter);
  res.json({
    events,
    more,
  });
});

router.get("/by-days/:offset", (req: Request, res: Response) => {
  res.send("/by-days/:offset");
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  res.send("/by-hours/:offset");
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.get("/retention", (req: Request, res: Response) => {
  const { dayZero } = req.query;
  res.send("/retention");
});
router.get("/:eventId", (req: Request, res: Response) => {
  const event = getEventBy("Os", "Android");
  console.log(event);
  res.json({ data: event });
});

router.post("/", (req: Request, res: Response) => {
  res.send("post route");
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
