import {
  getAllSubjects,
  getCoursesByMajor,
} from "@repo/backend/course-information";
import { notFound } from "next/navigation";
import Combobox from "~/components/ui/Combobox";
import SelectSubject from "./SelectSubject";
import SelectCourse from "./SelectCourse";
import SelectSection from "./SelectSection";

interface Props {
  params: Promise<{ slug?: [subject?: string, courseId?: string] }>;
}

export default async function SearchBySubject({ params }: Props) {
  const [subject, courseId] = (await params).slug ?? [];
  const subjects = await getAllSubjects();

  if (
    subject &&
    !subjects.data.some(
      (value) => value.toLowerCase() === subject.toLowerCase(),
    )
  ) {
    notFound();
  }

  const courses =
    subject !== undefined
      ? await getCoursesByMajor({ major: subject })
      : undefined;

  const course =
    courseId !== undefined && courses
      ? courses.data.find((course) => course.courseId?.toString() === courseId)
      : undefined;

  if (courseId && !course) {
    notFound();
  }

  console.log(course);

  return (
    <fieldset className="grid w-full max-w-96 grid-cols-[max-content_1fr] grid-rows-2 items-center gap-x-3 gap-y-8">
      <label className="contents">
        <span className="text-lg font-bold">Subject:</span>
        <SelectSubject
          defaultValue={subject}
          options={Object.fromEntries(
            subjects.data.map((subject) => [subject, subject]),
          )}
        />
      </label>

      <label className="contents">
        <span className="text-lg font-bold">Course:</span>
        <SelectCourse
          defaultValue={courseId}
          options={
            courses &&
            Object.fromEntries(
              courses.data.map((course) => [
                course.courseId,
                `(${course.courseNumber}) ${course.title}`,
              ]),
            )
          }
        />
      </label>

      <label className="contents">
        <span className="text-lg font-bold">Sections:</span>
        <SelectSection
          options={
            course &&
            Object.fromEntries(
              course.courseSections?.map((section) => [
                section.id,
                <span className="flex flex-col">
                  <span>{section.instructor || "TBA"}</span>
                  <span className="text-xs">
                    {section.classes
                      ?.map(
                        (c) =>
                          c.days +
                          " " +
                          c.startTime?.substring(0, 5) +
                          "-" +
                          c.endTime?.substring(0, 5),
                      )
                      .join(" / ")}
                  </span>
                </span>,
              ]) ?? [],
            )
          }
        />
      </label>
    </fieldset>
  );
}
