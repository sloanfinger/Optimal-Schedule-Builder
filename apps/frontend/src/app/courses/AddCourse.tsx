"use client";

import { ContextType, useCallback, useContext } from "react";
import { PiPlusBold } from "react-icons/pi";
import { context } from "./layout";
import { Course } from "@repo/backend/course-information/models";

interface Props {
  course?: Course;
  contextKey: keyof NonNullable<ContextType<typeof context>>;
}

export default function AddCourse({ course, contextKey }: Props) {
  const { commit } = useContext(context)![contextKey];

  const handleClick = useCallback(() => {
    if (course) {
      commit(course);
    }
  }, [commit, course]);

  return (
    <button
      className="bg-bulldog-red flex items-center gap-2 self-end rounded-md border-2 border-red-800 px-6 py-2 font-medium text-white transition-[background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-60 [&:not(:disabled)]:hover:border-red-950 [&:not(:disabled)]:hover:bg-red-800 [&:not(:disabled)]:hover:shadow-md"
      disabled={!course}
      onClick={handleClick}
      type="button"
    >
      <PiPlusBold />
      Add Course
    </button>
  );
}
