import { dummyData1, dummyData2 } from "~/components/schedules/dummySchedules";
import * as z from "zod";

/**
 * The default export must be a record of Zod object schemas whose
 * keys/values are JSON-serializable (i.e., records/arrays of strings,
 * numbers, booleans, and nulls). Further, each must have either a
 * default or be nullable.
 */

/**
 * Using `.catch(...)` on the schema gives a default value if there
 * is an error parsing the value in localStorage (or if the key is
 * not present in localStorage). The default value passed to
 * `.catch(...)` must match the original schema.
 */

/**
 * Using `.nullable()` is identical in behavior to `.catch(null)`,
 * except the schema does not necessarily have to match null.
 */

const ClassData = z.object({
  classTitle: z.string(),
  className: z.string(),
  description: z.string(),
  locationLong: z.string(),
  locationShort: z.string(),
  prereq: z.string(),
  coreq: z.string(),
  professor: z.string(),
  semester: z.string(),

  credits: z.number(),
  crn: z.number(),
  openSeats: z.number(),
  maxSeats: z.number(),
  waitlist: z.number(),

  bgColor: z.string(),
  borderColor: z.string(),

  timeStart: z.string(),
  timeEnd: z.string(),
  timeDifference: z.number().nullable(),

  currentDay: z.string(),
  otherTimes: z.tuple([z.string(), z.string(), z.string()]),
});

const WeekSchedule = z.record(z.string(), ClassData.array());
const DaySchedule = z.record(z.string(), ClassData.array());

export const timeOptions = {
  "08:00": "8 AM",
  "09:00": "9 AM",
  "10:00": "10 AM",
  "11:00": "11 AM",
  "12:00": "12 PM",
  "13:00": "1 PM",
  "14:00": "2 PM",
  "15:00": "3 PM",
  "16:00": "4 PM",
  "17:00": "5 PM",
  "18:00": "6 PM",
  "19:00": "7 PM",
  "20:00": "8 PM",
  "21:00": "9 PM",
  "22:00": "10 PM",
};

export const gapDayOptions = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
};

export const campusOptions = {
  Athens: "Athens",
  Buckhead: "Buckhead",
  Griffin: "Griffin",
  Gwinnett: "Gwinnett",
  Online: "Online",
  Tifton: "Tifton",
};

const localStorage = {
  schedules: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      data: WeekSchedule,
      pinned: z.boolean(),
    })
    .array()
    .catch([
      // Remove these objects when we have generated schedules getting auto-saved to local storage
      {
        id: crypto.randomUUID(),
        title: "Schedule 1",
        data: dummyData1,
        pinned: false,
      },
      {
        id: crypto.randomUUID(),
        title: "Schedule 2",
        data: dummyData2,
        pinned: false,
      },
    ]),
  coursesBySubject: z
    .object({
      subject: z.string().optional(),
      courseNumber: z.int().optional(),
      excludedCrns: z.int().array().optional(),
    })
    .catch({}),
  draftSchedule: z
    .object({
      courses: z.record(
        z.string(),
        z.object({
          subject: z.string(),
          courseNumber: z
            .string()
            .refine((arg) => z.coerce.number().int().safeParse(arg).success),
          title: z.string(),
          excludedSections: z.record(
            z
              .string()
              .refine((arg) => z.coerce.number().int().safeParse(arg).success),
            z.object({
              instructor: z.string(),
              subtitle: z.string(),
            }),
          ),
        }),
      ),
      prefStartTime: z
        .literal(Object.keys(timeOptions) as (keyof typeof timeOptions)[])
        .optional(),
      prefEndTime: z
        .literal(Object.keys(timeOptions) as (keyof typeof timeOptions)[])
        .optional(),
      inputCampus: z
        .literal(Object.keys(campusOptions) as (keyof typeof campusOptions)[])
        .optional(),
      gapDay: z
        .literal(Object.keys(gapDayOptions) as (keyof typeof gapDayOptions)[])
        .optional(),
      minCreditHours: z.int().min(0),
      maxCreditHours: z.int().max(18),
      walking: z.boolean(),
      showFilledClasses: z.boolean(),
    })
    .refine(
      (draft) =>
        !draft.prefStartTime ||
        !draft.prefEndTime ||
        parseInt(draft.prefStartTime) < parseInt(draft.prefEndTime),
    )
    .refine((draft) => draft.minCreditHours <= draft.maxCreditHours)
    .catch({
      courses: {},
      prefStartTime: "08:00",
      prefEndTime: "22:00",
      inputCampus: "Athens",
      minCreditHours: 12,
      maxCreditHours: 18,
      walking: false,
      showFilledClasses: false,
    }),
};

export type SavedPlan = z.infer<(typeof localStorage)["schedules"]>[number];
export type ClassData = z.infer<typeof ClassData>;
export type DaySchedule = z.infer<typeof DaySchedule>;
export type WeekSchedule = z.infer<typeof WeekSchedule>;
export default localStorage;
