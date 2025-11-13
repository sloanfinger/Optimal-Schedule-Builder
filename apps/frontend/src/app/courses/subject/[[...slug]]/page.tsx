import {
  getAllSubjects,
  getCoursesByMajor,
} from "@repo/backend/course-information";
import { notFound } from "next/navigation";
import SelectCourse from "./SelectCourse";
import SelectSection from "./SelectSection";
import SelectSubject from "./SelectSubject";
import AddCourse from "../../AddCourse";

interface Props {
  params: Promise<{ slug?: [subject?: string, courseId?: string] }>;
}

export default async function SearchBySubject({ params }: Props) {
  const [subject, courseNumber] = (await params).slug ?? [];
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
    courseNumber !== undefined && courses
      ? courses.data.find(
          (course) => course.courseNumber?.toString() === courseNumber,
        )
      : undefined;
      console.log({ course });

  if (courseNumber && !course) {
    notFound();
  }

  return (
    <>
      <div className="grid w-full max-w-96 grid-cols-[max-content_1fr] grid-rows-2 items-center gap-x-3 gap-y-8">
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
            defaultValue={courseNumber}
            options={
              courses &&
              Object.fromEntries(
                courses.data.map((course) => [
                  Number(course.courseNumber!),
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
                  section.crn,
                  <span className="flex flex-col gap-px pt-0.5 leading-none">
                    <span>{section.instructor || "TBA"}</span>
                    <span className="text-xs">
                      {section.classes && section.classes.length > 0
                        ? section.classes
                            ?.map(
                              (c) =>
                                `${c.days} ${c.startTime?.substring(0, 5)}-${c.endTime?.substring(0, 5)}`,
                            )
                            .join(" / ")
                        : `${section.daysOfTheWeek} ${section.startTime?.substring(0, 5)}-${section.endTime?.substring(0, 5)}`}
                    </span>
                  </span>,
                ]) ?? [],
              )
            }
          />
        </label>
      </div>

      <AddCourse course={course} contextKey="coursesBySubject" />
    </>
  );
}
