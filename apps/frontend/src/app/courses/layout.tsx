"use client";

import { Course } from "@repo/backend/course-information/models";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ActionDispatch,
  createContext,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PiCaretDownBold, PiPlusBold, PiSparkleBold } from "react-icons/pi";
import { Navbar } from "~/components/Navbar";
import { Error } from "~/components/Toasts";
import RegisteredClass from "~/components/courses/RegisteredClass";
import Combobox from "~/components/ui/Combobox";
import useLocalStorage from "~/hooks/useLocalStorage";
import useToast from "~/hooks/useToast";
import background from "../../../public/images/background.png";
import Link from "next/link";
import type localStorage from "~/schemas/localStorage";
import type * as z from "zod";

type LocalStorage = typeof localStorage;
export const context = createContext<
  | {
      [K in "coursesBySubject"]: [
        z.infer<LocalStorage[K]>,
        ActionDispatch<[SetStateAction<z.infer<LocalStorage[K]>>]>,
      ];
    }
  | null
>(null);

function options<T extends string>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item, item]));
}

const timeOptions = options([
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "8 PM",
  "9 PM",
  "10 PM",
]);

const termOptions = options([
  `Spring ${new Date().getFullYear()}`,
  `Summer ${new Date().getFullYear()}`,
  `Fall ${new Date().getFullYear()}`,
]);

const campusOptions = options([
  "Athens",
  "Buckhead",
  "Griffin",
  "Gwinnett",
  "Online",
  "Tifton",
]);

export default function Layout({ children }: PropsWithChildren) {
  const [savedPlans, setSavedPlans] = useLocalStorage("schedules");
  const [courses, setCourses] = useState<Course[]>([]);
  const pathname = usePathname();

  const handleAddCourse = useCallback((course: Course) => {
    setCourses((courses) => [
      // Forbid more than one of the same course
      ...courses.filter((c) => c.courseId !== course.courseId),
      course,
    ]);
  }, []);

  const handleRemoveCourse = useCallback((course: Course) => {
    setCourses((courses) =>
      courses.filter((c) => c.courseId !== course.courseId),
    );
  }, []);

  const [startTime, setStartTime] = useState<string | undefined>("8 AM");

  const [endTime, setEndTime] = useState<string | undefined>("10 PM");

  const startTimeOptions = useMemo(
    () => timeOptions,
    // timeOptions.slice(
    //   0,
    //   timeOptions.findIndex((time) => time?.value === endTime),
    // ),
    [endTime],
  );

  const endTimeOptions = useMemo(
    () => timeOptions,
    // timeOptions.slice(
    //   timeOptions.findIndex((time) => time?.value === startTime) + 1,
    // ),
    [startTime],
  );

  const [minCreditHours, setMinCreditHours] = useState<number>(12);
  const [maxCreditHours, setMaxCreditHours] = useState<number>(18);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchError = useToast(Error);

  const handleGenerateSchedule = useCallback(() => {}, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.currentTarget.reset();
      //handleAddCourse(course);
    },
    [handleAddCourse],
  );

  const router = useRouter();
  const [coursesBySubject, setCoursesBySubject] =
    useLocalStorage("coursesBySubject");

  const coursesBySubjectPathname = useMemo(() => {
    if (!coursesBySubject.subject) {
      return "/courses/subject";
    }

    if (!coursesBySubject.courseId) {
      return `/courses/subject/${coursesBySubject.subject}`;
    }

    return `/courses/subject/${coursesBySubject.subject}/${coursesBySubject.courseId}`;
  }, [coursesBySubject]);

  useEffect(() => {
    if (pathname.startsWith("/courses/subject")) {
      router.push(coursesBySubjectPathname);
    }
  }, [coursesBySubjectPathname, pathname]);

  return (
    <context.Provider
      value={{ coursesBySubject: [coursesBySubject, setCoursesBySubject] }}
    >
      <div
        className="min-h-screen bg-cover bg-fixed bg-bottom bg-no-repeat"
        style={{
          backgroundImage: `url(${background.src})`,
        }}
      >
        <Navbar />
        <main className="flex flex-col gap-8 px-4 pb-4 pt-8 xl:px-24">
          {/* Course Display */}
          <section className="flex flex-col gap-8 md:flex-row">
            <div className="w-full md:w-2/3">
              <h1 className="p-2 pl-1 text-center text-3xl font-black md:text-left">
                Add Courses
              </h1>
              <div className="h-full min-w-full">
                <nav className="flex gap-2">
                  <Link
                    href={coursesBySubjectPathname}
                    data-active={pathname.startsWith("/courses/subject")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-bl-none rounded-br-none rounded-tl-lg rounded-tr-lg px-4 py-2 text-left font-bold capitalize text-[#CFBEBE] duration-150 data-[active=true]:text-white"
                  >
                    By Subject
                  </Link>
                  <Link
                    href="/courses/instructor"
                    data-active={pathname.startsWith("/courses/instructor")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-bl-none rounded-br-none rounded-tl-lg rounded-tr-lg px-4 py-2 text-left font-bold capitalize text-[#CFBEBE] duration-150 data-[active=true]:text-white"
                  >
                    By Instructor
                  </Link>
                  <Link
                    href="/courses/crn"
                    data-active={pathname.startsWith("/courses/crn")}
                    className="bg-dusty-pink data-[active=true]:bg-bulldog-red w-1/3 rounded-bl-none rounded-br-none rounded-tl-lg rounded-tr-lg px-4 py-2 text-left font-bold capitalize text-[#CFBEBE] duration-150 data-[active=true]:text-white"
                  >
                    By CRN
                  </Link>
                </nav>

                <form
                  className="border-dusty-pink bg-barely-pink flex flex-col gap-16 border-4 px-8 py-10"
                  onSubmit={handleSubmit}
                >
                  {children}

                  <button
                    className="bg-bulldog-red flex items-center gap-2 self-end rounded-md border-2 border-red-800 px-6 py-2 font-medium text-white transition-[background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-60 [&:not(:disabled)]:hover:border-red-950 [&:not(:disabled)]:hover:bg-red-800 [&:not(:disabled)]:hover:shadow-md"
                    //disabled={course === null}
                    type="submit"
                  >
                    <PiPlusBold />
                    Add Course
                  </button>
                </form>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <h1 className="p-2 pl-1 text-center text-3xl font-black md:text-left">
                Courses
              </h1>
              <div className="relative">
                {/* Container for course list */}
                <div className="no-scrollbar border-dusty-pink relative flex flex-1 flex-col overflow-x-hidden overflow-y-scroll scroll-smooth border-4 bg-white py-4">
                  {/* Course item */}
                  {courses.map((course) => (
                    <RegisteredClass
                      key={course.courseId}
                      subject={course.subject!}
                      courseNumber={course.courseNumber!}
                      courseName={course.athenaTitle!}
                      onClick={() => handleRemoveCourse(course)}
                    />
                  ))}
                </div>
                {/* Styling div to add spacing and hold down arrow notification in case there is more items */}
                <div className="border-dusty-pink absolute bottom-0 left-0 flex h-6 w-full justify-center border-4 border-t-0 bg-white">
                  {courses.length > 5 && (
                    <PiCaretDownBold className="size-30 h-auto w-auto animate-bounce" />
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
                  defaultValue={startTime}
                  name="prefStartTime"
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
                  defaultValue={endTime}
                  name="prefEndTime"
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
                <label className="border-pebble-gray/40 col-span-full flex items-center justify-center gap-4 border-b-2 pb-4 text-neutral-700 hover:text-black sm:pb-6 lg:col-start-2 lg:justify-start lg:border-none lg:pb-0">
                  <input
                    className="form-checkbox border-limestone text-bulldog-red hover:border-pebble-gray focus:ring-bulldog-red size-6 rounded-md border-2"
                    name="walking"
                    type="checkbox"
                  />
                  <span className="text-balance text-left leading-tight">
                    Walking Distance Between Classes
                  </span>
                </label>
              </div>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">Term</span>
                <Combobox
                  name="term"
                  options={termOptions}
                  preserveOrdering
                  required
                  searchPlaceholder="Search Open Terms"
                  displayText={(selection) =>
                    selection ? termOptions[selection] : "Select a Term"
                  }
                />
              </label>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">Campus</span>
                <Combobox
                  name="inputCampus"
                  options={campusOptions}
                  required
                  searchPlaceholder="Search Campuses"
                  displayText={(selection) =>
                    selection ? campusOptions[selection] : "Select a Campus"
                  }
                />
              </label>

              <div className="contents grid-cols-subgrid items-center lg:col-span-2 lg:grid">
                <label className="border-pebble-gray/40 col-span-full flex items-center justify-center gap-4 border-b-2 pb-4 text-neutral-700 hover:text-black sm:pb-6 lg:col-start-2 lg:justify-start lg:border-none lg:pb-0">
                  <input
                    className="form-checkbox border-limestone text-bulldog-red hover:border-pebble-gray focus:ring-bulldog-red size-6 rounded-md border-2"
                    name="showFilledClasses"
                    type="checkbox"
                  />
                  <span className="text-balance text-left leading-tight">
                    Include Waitlisted Course Sections
                  </span>
                </label>
              </div>

              <label className="col-span-2 grid grid-cols-subgrid items-center">
                <span className="pl-3 text-right font-bold">
                  Min Credit Hours
                </span>
                <input
                  className="border-limestone [&:not(:disabled):hover]:border-pebble-gray flex w-full items-center gap-6 rounded-md border-2 bg-white px-3 py-1.5 transition-[box-shadow,border-color] disabled:cursor-not-allowed disabled:opacity-60 [&:not(:disabled):hover]:shadow-sm"
                  min={1}
                  max={maxCreditHours - 1}
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
                  className="border-limestone [&:not(:disabled):hover]:border-pebble-gray flex w-full items-center gap-6 rounded-md border-2 bg-white px-3 py-1.5 transition-[box-shadow,border-color] disabled:cursor-not-allowed disabled:opacity-60 [&:not(:disabled):hover]:shadow-sm"
                  min={minCreditHours + 1}
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
              className="bg-bulldog-red flex items-center gap-2 self-end rounded-md border-2 border-red-800 px-6 py-2 font-medium text-white transition-[background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-3 sm:px-8 sm:py-2.5 sm:text-lg [&:not(:disabled)]:hover:border-red-950 [&:not(:disabled)]:hover:bg-red-800 [&:not(:disabled)]:hover:shadow-md"
              disabled={isLoading}
            >
              <PiSparkleBold />
              Generate Schedule
            </button>
          </section>
        </main>
      </div>
    </context.Provider>
  );
}
