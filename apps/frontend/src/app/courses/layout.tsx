"use client";

import { Course } from "@repo/backend/course-information/models";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionDispatch,
  ContextType,
  createContext,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import {
  PiCircleNotchBold,
  PiCursorClick,
  PiPlusCircleBold,
  PiSparkleBold,
  PiXCircleBold,
} from "react-icons/pi";
import * as z from "zod";
import { Navbar } from "~/components/Navbar";
import { Error } from "~/components/Toasts";
import Combobox from "~/components/ui/Combobox";
import useKeyState from "~/hooks/useKeyState";
import useLocalStorage from "~/hooks/useLocalStorage";
import useToast from "~/hooks/useToast";
import type localStorage from "~/schemas/localStorage";
import {
  campusOptions,
  gapDayOptions,
  timeOptions,
} from "~/schemas/localStorage";
import background from "../../../public/images/background.png";
import { getRecommendedSchedules } from "@repo/backend/course-information";

type LocalStorage = typeof localStorage;
export const context = createContext<
  | {
      [K in "coursesBySubject"]: {
        stage: ActionDispatch<[SetStateAction<z.infer<LocalStorage[K]>>]>;
        commit: (course: Course) => void;
      };
    }
  | null
>(null);

export default function Layout({ children }: PropsWithChildren) {
  const [savedPlans, setSavedPlans] = useLocalStorage("schedules");
  const draftSchedule = useLocalStorage("draftSchedule");
  const [isPending, startTransition] = useTransition();
  const dispatchError = useToast(Error);
  const pathname = usePathname();
  const router = useRouter();

  //#region Course Adding Controls
  const [courses, setCourses] = useKeyState(draftSchedule, "courses");

  const addCourse = useCallback(
    (course: Course, crns: number[]) => {
      setCourses((courses) => ({
        ...courses,
        [course.subject! + course.courseNumber!]: {
          subject: course.subject!,
          courseNumber: course.courseNumber!,
          title: course.title!,
          excludedSections: Object.fromEntries(
            course.courseSections
              ?.filter((section) => crns.includes(section.crn!))
              .map((section) => [
                section.crn!,
                {
                  instructor: section.instructor!,
                  subtitle:
                    section.classes && section.classes.length > 0
                      ? section.classes
                          ?.map(
                            (c) =>
                              `${c.days} ${c.startTime?.substring(0, 5)}-${c.endTime?.substring(0, 5)}`,
                          )
                          .join(" / ")
                      : `${section.daysOfTheWeek} ${section.startTime?.substring(0, 5)}-${section.endTime?.substring(0, 5)}`,
                },
              ]) ?? [],
          ),
        },
      }));
    },
    [setCourses],
  );

  const createRemoveCourse = useCallback(
    (qualifiedCourseNumber: string) => {
      return () => {
        setCourses((courses) =>
          Object.fromEntries(
            Object.entries(courses).filter(
              ([qcn]) => qcn !== qualifiedCourseNumber,
            ),
          ),
        );
      };
    },
    [setCourses],
  );

  const [coursesBySubject, setCoursesBySubject] =
    useLocalStorage("coursesBySubject");

  const coursesBySubjectPathname = useMemo(() => {
    console.log(coursesBySubject);

    if (!coursesBySubject.subject) {
      return "/courses/subject";
    }

    if (!coursesBySubject.courseNumber) {
      return `/courses/subject/${coursesBySubject.subject}`;
    }

    return `/courses/subject/${coursesBySubject.subject}/${coursesBySubject.courseNumber}`;
  }, [coursesBySubject]);

  useEffect(() => {
    if (pathname.startsWith("/courses/subject")) {
      router.push(coursesBySubjectPathname);
    }
  }, [coursesBySubjectPathname, pathname]);

  const contextValue = useMemo<NonNullable<ContextType<typeof context>>>(
    () => ({
      coursesBySubject: {
        stage: setCoursesBySubject,
        commit: (course) => {
          startTransition(() => {
            addCourse(course, coursesBySubject.excludedCrns!);

            setCoursesBySubject((current) => ({
              subject: current.subject,
            }));
          });
        },
      },
    }),
    [coursesBySubject, setCoursesBySubject],
  );
  //#endregion

  //#region Filter Controls
  const [startTime, setStartTime] = useKeyState(draftSchedule, "prefStartTime");
  const [endTime, setEndTime] = useKeyState(draftSchedule, "prefEndTime");
  const [gapDay, setGapDay] = useKeyState(draftSchedule, "gapDay");
  const [campus, setCampus] = useKeyState(draftSchedule, "inputCampus");
  const [minCreditHours, setMinCreditHours] = useKeyState(
    draftSchedule,
    "minCreditHours",
  );
  const [maxCreditHours, setMaxCreditHours] = useKeyState(
    draftSchedule,
    "maxCreditHours",
  );
  const [walking, setWalking] = useKeyState(draftSchedule, "walking");
  const [showFilledClasses, setShowFilledClasses] = useKeyState(
    draftSchedule,
    "showFilledClasses",
  );

  const startTimeOptions = useMemo<Partial<typeof timeOptions>>(
    () =>
      Object.fromEntries(
        Object.entries(timeOptions).filter(
          ([time]) => !endTime || parseInt(time) < parseInt(endTime),
        ),
      ),
    [endTime],
  );

  const endTimeOptions = useMemo<Partial<typeof timeOptions>>(
    () =>
      Object.fromEntries(
        Object.entries(timeOptions).filter(
          ([time]) => !startTime || parseInt(time) > parseInt(startTime),
        ),
      ),
    [startTime],
  );
  //#endregion

  const generateSchedule = useCallback(() => {
    startTransition(async () => {
      console.log({
        inputCourseNumbers: Object.keys(courses),
        excludedSectionCrns: Object.values(courses)
          .flatMap((course) => Object.keys(course.excludedSections))
          .map((crn) => Number(crn)),
        excludedCourseIDs: [],
        prefStartTime: startTime ? parseInt(startTime) : 8,
        prefEndTime: endTime ? parseInt(endTime) : 22,
        gapDay: gapDay ?? "",
        inputCampus: campus ?? "Athens",
        minCreditHours,
        maxCreditHours,
        showFilledClasses,
        walking,
      });
      const result = await getRecommendedSchedules({
        inputCourseNumbers: Object.keys(courses),
        excludedSectionCrns: Object.values(courses)
          .flatMap((course) => Object.keys(course.excludedSections))
          .map((crn) => Number(crn)),
        excludedCourseIDs: [],
        prefStartTime: startTime ? parseInt(startTime) : 8,
        prefEndTime: endTime ? parseInt(endTime) : 22,
        gapDay: gapDay ?? "",
        inputCampus: campus ?? "Athens",
        minCreditHours,
        maxCreditHours,
        showFilledClasses,
        walking,
      });
      console.log({ result });
    });
  }, [courses, startTime, endTime, gapDay, campus]);

  return (
    <context.Provider value={contextValue}>
      <main
        className="min-h-screen bg-cover bg-fixed bg-bottom bg-no-repeat"
        style={{
          backgroundImage: `url(${background.src})`,
        }}
      >
        <Navbar />
        <fieldset
          className="flex flex-col gap-8 px-4 pt-8 pb-4 xl:px-24"
          disabled={isPending}
        >
          {/* Course Display */}
          <section className="flex grid-cols-3 grid-rows-[1fr] flex-col gap-8 md:grid">
            <div className="col-span-2 w-full">
              <h1 className="p-2 pl-1 text-center text-3xl font-black md:text-left">
                Add Courses
              </h1>
              <div className="h-full min-w-full">
                <nav className="flex gap-2">
                  <Link
                    href={coursesBySubjectPathname}
                    data-active={pathname.startsWith("/courses/subject")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-tl-lg rounded-tr-lg rounded-br-none rounded-bl-none px-4 py-2 text-left font-bold text-[#CFBEBE] capitalize duration-150 data-[active=true]:text-white"
                  >
                    By Subject
                  </Link>
                  <Link
                    href="/courses/instructor"
                    data-active={pathname.startsWith("/courses/instructor")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-tl-lg rounded-tr-lg rounded-br-none rounded-bl-none px-4 py-2 text-left font-bold text-[#CFBEBE] capitalize duration-150 data-[active=true]:text-white"
                  >
                    By Instructor
                  </Link>
                  <Link
                    href="/courses/crn"
                    data-active={pathname.startsWith("/courses/crn")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-tl-lg rounded-tr-lg rounded-br-none rounded-bl-none px-4 py-2 text-left font-bold text-[#CFBEBE] capitalize duration-150 data-[active=true]:text-white"
                  >
                    By CRN
                  </Link>
                </nav>

                <div className="border-dusty-pink bg-barely-pink flex flex-col gap-16 border-4 px-8 py-10">
                  {children}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 w-full flex-col">
              <h1 className="p-2 pl-1 text-center text-3xl font-black md:text-left">
                Courses
              </h1>
              {/* Container for course list */}
              <div className="border-dusty-pink relative flex-1 border-4 bg-white">
                <div className="shadow-inner-scroll-y absolute inset-0 flex flex-col gap-2 overflow-x-hidden overflow-y-scroll px-2 py-3">
                  {/* Course item */}
                  {Object.entries(courses).map(
                    ([qualifiedCourseNumber, course]) => (
                      <button
                        className="group hover:border-grout-gray hover:bg-grout-gray/15 relative block cursor-default rounded-sm border border-transparent px-2 pt-1 pb-3.5 text-left transition-[border-color,box-shadow,background-color] perspective-distant hover:shadow-sm"
                        key={qualifiedCourseNumber}
                        onClick={createRemoveCourse(qualifiedCourseNumber)}
                      >
                        <span className="flex items-center gap-1.5 overflow-hidden font-bold text-ellipsis">
                          <PiPlusCircleBold className="text-lg text-green-700" />
                          {course.subject} {course.courseNumber}
                        </span>
                        <span className="block overflow-hidden pl-6 text-sm text-nowrap text-ellipsis">
                          {course.title}
                        </span>
                        <span className="flex flex-col gap-0.5 pt-1 pl-7.5 not-[:has(>span+span)]:hidden">
                          <span className="-ml-1.5 block pb-0.5 text-[0.66rem] font-semibold text-neutral-500 uppercase">
                            Excluding Sections
                          </span>
                          {Object.entries(course.excludedSections).map(
                            ([crn, section]) => (
                              <span className="block text-sm" key={crn}>
                                <span className="flex items-center gap-1.5 font-bold">
                                  <PiXCircleBold className="text-base text-red-700" />
                                  {section.instructor}
                                </span>
                                <span className="block pl-5.5 text-xs">
                                  {section.subtitle}
                                </span>
                              </span>
                            ),
                          )}
                        </span>
                        <span className="absolute top-full right-2 flex origin-top scale-90 rotate-x-270 items-center gap-1 rounded-sm border border-red-700 bg-white px-2 py-px text-xs text-red-700 opacity-0 shadow-xs transition-[transform,scale,opacity,translate] group-hover:-translate-y-1/2 group-hover:scale-100 group-hover:rotate-x-360 group-hover:opacity-100">
                          <PiCursorClick />
                          Click to Remove
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="border-dusty-pink bg-barely-pink flex flex-col gap-6 border-4 px-4 py-6 sm:gap-9 sm:px-8 sm:py-9">
            <h1 className="w-full text-center text-xl font-bold sm:text-2xl lg:text-left">
              Filters
            </h1>

            <fieldset className="grid grid-cols-[1fr_2fr] gap-x-3 gap-y-4 text-right text-sm sm:grid-cols-[repeat(2,1fr_2fr)] sm:gap-y-6 md:text-base lg:grid-flow-col lg:grid-cols-[repeat(3,1fr_2fr)] lg:grid-rows-3">
              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">Start Time</span>
                <Combobox
                  value={startTime}
                  onChange={setStartTime}
                  options={startTimeOptions}
                  preserveOrdering
                  required
                  searchPlaceholder="Search Start Times"
                  displayText={(selection) =>
                    selection
                      ? startTimeOptions[selection]
                      : "Select a Start Time"
                  }
                />
              </label>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">End Time</span>
                <Combobox
                  value={endTime}
                  onChange={setEndTime}
                  options={endTimeOptions}
                  preserveOrdering
                  required
                  searchPlaceholder="Search End Times"
                  displayText={(selection) =>
                    selection ? endTimeOptions[selection] : "Select an End Time"
                  }
                />
              </label>

              <div className="contents grid-cols-subgrid items-center lg:col-span-2 lg:grid">
                <label className="border-pebble-gray/40 col-span-full flex items-center justify-center gap-4 border-b-2 pb-4 text-neutral-700 not-disabled:hover:text-black has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:pb-6 lg:col-start-2 lg:justify-start lg:border-none lg:pb-0">
                  <input
                    className="form-checkbox border-limestone text-bulldog-red not-disabled:hover:border-pebble-gray focus:ring-bulldog-red size-6 rounded-md border-2"
                    type="checkbox"
                    checked={walking}
                    onChange={(e) => setWalking(e.currentTarget.checked)}
                  />
                  <span className="text-left leading-tight text-balance">
                    Walking Distance Between Classes
                  </span>
                </label>
              </div>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">Campus</span>
                <Combobox
                  value={campus}
                  options={campusOptions}
                  required
                  searchPlaceholder="Search Campuses"
                  displayText={(selection) =>
                    selection ? campusOptions[selection] : "Select a Campus"
                  }
                  onChange={setCampus}
                />
              </label>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">Gap Day</span>
                <Combobox
                  value={gapDay}
                  options={gapDayOptions}
                  preserveOrdering
                  searchPlaceholder="Search Gap Days"
                  displayText={(selection) =>
                    selection ? gapDayOptions[selection] : "Select a Gap Day"
                  }
                  onChange={setGapDay}
                />
              </label>

              <div className="contents grid-cols-subgrid items-center lg:col-span-2 lg:grid">
                <label className="border-pebble-gray/40 col-span-full flex items-center justify-center gap-4 border-b-2 pb-4 text-neutral-700 not-disabled:hover:text-black has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:pb-6 lg:col-start-2 lg:justify-start lg:border-none lg:pb-0">
                  <input
                    className="form-checkbox border-limestone text-bulldog-red not-disabled:hover:border-pebble-gray focus:ring-bulldog-red size-6 rounded-md border-2"
                    type="checkbox"
                    checked={showFilledClasses}
                    onChange={(e) =>
                      setShowFilledClasses(e.currentTarget.checked)
                    }
                  />
                  <span className="text-left leading-tight text-balance">
                    Include Waitlisted Course Sections
                  </span>
                </label>
              </div>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">
                  Min Credit Hours
                </span>
                <input
                  className="border-limestone not-disabled:hover:border-pebble-gray flex w-full items-center gap-6 rounded-md border-2 bg-white px-3 py-1.5 transition-[box-shadow,border-color] not-disabled:hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  min={0}
                  max={maxCreditHours}
                  name="minCreditHours"
                  onChange={(e) =>
                    setMinCreditHours(parseInt(e.currentTarget.value))
                  }
                  required
                  type="number"
                  value={minCreditHours}
                />
              </label>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">
                  Max Credit Hours
                </span>
                <input
                  className="border-limestone not-disabled:hover:border-pebble-gray flex w-full items-center gap-6 rounded-md border-2 bg-white px-3 py-1.5 transition-[box-shadow,border-color] not-disabled:hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  min={minCreditHours}
                  max={18}
                  name="maxCreditHours"
                  onChange={(e) =>
                    setMaxCreditHours(parseInt(e.currentTarget.value))
                  }
                  required
                  type="number"
                  value={maxCreditHours}
                />
              </label>
            </fieldset>
          </section>

          {/* Submit Button */}
          <section className="flex justify-center">
            <button
              className="bg-bulldog-red group relative self-end rounded-md border-2 border-red-800 px-6 py-2 font-medium text-white transition-[background-color,border-color,box-shadow] not-disabled:hover:border-red-950 not-disabled:hover:bg-red-800 not-disabled:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:gap-3 sm:px-8 sm:py-2.5 sm:text-lg"
              onClick={generateSchedule}
              type="button"
            >
              <span className="flex items-center gap-2 transition-opacity group-disabled:opacity-0">
                <PiSparkleBold />
                Generate Schedule
              </span>
              <PiCircleNotchBold className="absolute top-1/2 left-1/2 -translate-1/2 animate-spin opacity-0 transition-opacity [animation-duration:500ms] group-disabled:opacity-100" />
            </button>
          </section>
        </fieldset>
      </main>
    </context.Provider>
  );
}
