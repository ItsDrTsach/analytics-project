export interface Event {
  _id: string; // the db id
  session_id: string; //
  name: eventName; //event name
  url: string; // url the event came from
  distinct_user_id: string; // the user (at the browser level)
  date: number; // mmiliseconds , can make the time from the timezone
  os: os; // which operation system was it on
  browser: browser; // what browser the event came from
  geolocation: GeoLocation; // the geoLocation (lat,lng) of the event
}

export interface weeklyRetentionObject {
  registrationWeek: number;
  newUsers: number;
  weeklyRetention: number[];
  start: string;
  end: string;
}

export type eventName = "login" | "signup" | "admin" | "/";
export type os = "windows" | "mac" | "linux" | "ios" | "android" | "other";
export type browser = "chrome" | "safari" | "edge" | "firefox" | "ie" | "other";
export type GeoLocation = {
  location: Location;
  accuracy: number; // accuracy radius
};
export type Location = {
  lat: number;
  lng: number;
};
export interface RetentionCohort {
  sorting: string;
  type: string;
  browser: string;
  search: string;
  offset: number;
}
