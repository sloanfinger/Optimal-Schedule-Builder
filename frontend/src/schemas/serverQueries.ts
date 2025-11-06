import * as z from "zod";

/**
 * At some point in the future, most/all of this could could be
 * programatically generated using the swagger.json or OpenAPI
 * docs, but the services code needs to be in a more complete
 * state for that to be possible.
 */

function join<V extends z.ZodType, R extends Record<string, z.ZodType>>(
  variables: V,
  relationships: R,
) {
  return z.object(relationships).and(variables);
}

const BuildingVariables = z.object({
  buildingNumber: z.number().int(),
  name: z.string(),
  grid: z.string(),
});

const ClassVariables = z.object({
  classId: z.number().int(),
  days: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  room: z.string(),
  campus: z.string(),
});

const CourseVariables = z
  .object({
    courseId: z.number().int(),
    title: z.string(),
    subject: z.string(),
    courseNumber: z.string(),
    department: z.string(),
    courseDescription: z.string(),
    semesters: z.string().array(),
  })
  .transform((course) => ({
    ...course,
    number: course.courseNumber,
    courseNumber: course.subject + String(course.courseNumber),
  }));

const CourseSectionVariables = z.object({
  id: z.number().int(),
  courseSectionId: z.number().int(),
  crn: z.number().int(),
  sec: z.string(),
  stat: z.string().length(1),
  creditHours: z.number().int(),
  classSize: z.number().int(),
  seatsAvailable: z.number().int(),
  year: z.number().int(),
  daysOfTheWeek: z.string(),
  startTime: z.string().time(),
  endTime: z.string().time(),
  instructor: z.string(),
  classes: z.unknown().array(),
});

/**
 * We define the variables and relationships
 * in the schemas separately to avoid circular
 * references.
 */

const Building = join(BuildingVariables, {
  classes: join(ClassVariables, {
    courseSection: join(CourseSectionVariables, {
      course: join(CourseVariables, {
        coRequisites: CourseVariables.array(),
        preRequisites: CourseVariables.array(),
      }),
    }),
  }).array(),
});

export type Building = z.infer<typeof Building>;

const Class = join(ClassVariables, {
  building: BuildingVariables,
  courseSection: join(CourseSectionVariables, {
    course: join(CourseVariables, {
      coRequisites: CourseVariables.array(),
      preRequisites: CourseVariables.array(),
    }),
  }),
});

export type Class = z.infer<typeof Class>;

const Course = join(CourseVariables, {
  courseSections: CourseSectionVariables.array(),
  coRequisites: CourseVariables.array(),
  preRequisites: CourseVariables.array(),
});

export type Course = z.infer<typeof Course>;

const CourseSection = join(CourseSectionVariables, {
  course: join(CourseVariables, {
    coRequisites: CourseVariables.array(),
    preRequisites: CourseVariables.array(),
  }),
});

export type CourseSection = z.infer<typeof CourseSection>;

/**
 * The default export of this file is a record of queries.
 * Every query contains the following information:
 * `.route` is the route attached to the base URL for where
 * the request is sent;
 * `.params` is a Zod schema for the parameters accepted
 * by the server for the query;
 * `.result` is a Zod schema for the response returned by
 * the server for the query.
 */

/**
 * @see https://docs.google.com/document/d/1UCqmfoyiv9WarZpkEv7axqQeUps-_FyH7HGqdeL9mx8/edit?tab=t.0#heading=h.rx2mk3uqskyb
 */
const queries = {
  /**
   * Gets the details of a specified CRN
   */
  getSectionDetailsByCRN: {
    route: "/section-by-crn",
    params: z.object({
      /**
       * @param crn The CRN of the section
       */
      crn: z.string(),
    }),
    result: CourseSection,
  },
  /**
   * Searches for all course sections whose instructor matches the provided name.
   */
  getCoursesByProfessor: {
    route: "/professor",
    params: z.object({
      /**
       * @param professor Name of the instructor to search for.
       */
      professor: z.string(),
    }),
    result: Course.array(),
  },
  /**
   * Retrieves an array of courses for a given major.
   */
  getCoursesByMajor: {
    route: "/coursesByMajor",
    params: z.object({
      /**
       * @param major The major identifier for which to select courses (e.g. CSCI)
       */
      major: z.string(),
    }),
    result: Course.array(),
  },
  /**
   * Searches for all courses matching the provided term.
   */
  getCoursesByTerm: {
    route: "/term",
    params: z.object({
      /**
       * @param term The name of the term to search for courses in.
       */
      term: z.string(),
    }),
    result: Course.array(),
  },
  getCourseInfo: {
    route: "/getCourseById",
    params: z.object({
      /**
       * @param courseId The ID of the course to search for.
       */
      courseId: z.string(),
    }),
    result: Course.nullable(),
  },
  /**
   * Retrieves an array of courses based on the specified parameters.
   */
  getCourses: {
    route: "/courses",
    params: z.object({
      /**
       * @param creditHours The required number of credit hours for the courses.
       */
      creditHours: z.number().transform(String),
      /**
       * @param majorCode The major code, e.g. "CSCI" (Optional)
       */
      majorCode: z.string().optional(),
      /**
       * @param majorCode The class level, e.g. 4000 (Optional)
       */
      classLevel: z.number().optional().transform(String),
    }),
    result: Course.array(),
  },
  /**
   * Retrieves pre-requisite courses for a given course ID or CRN.
   */
  getPreReqs: {
    route: "/course/prereqs",
    params: z.union([
      z.object({
        /**
         * @param courseId The id of the course to retrieve
         */
        courseId: z.string(),
      }),
      z.object({
        /**
         * @param crn The CRN of the course to retrieve
         */
        crn: z.string(),
      }),
    ]),
    result: Course.array(),
  },
  /**
   * Retrieves co-requisite courses for a given course ID or CRN.
   */
  getCoReqs: {
    route: "/course/coreqs",
    params: z.union([
      z.object({
        /**
         * @param courseId The id of the course to retrieve
         */
        courseId: z.string(),
      }),
      z.object({
        /**
         * @param crn The CRN of the course to retrieve
         */
        crn: z.string(),
      }),
    ]),
    result: Course.array(),
  },
  /**
   * Gets the special types of a course (honors/lab/online) from a CRN.
   */
  getSpecialCourseTypesFromCRN: {
    route: "/course/specialCourseTypes",
    params: z.object({
      /**
       * @param crn The CRN of the course to find the special types.
       */
      crn: z.string(),
    }),
    result: z.string().array(),
  },
  /**
   * Queries course sections from class time and optionally class name.
   */
  getCourseSections: {
    route: "/course/sections",
    params: z.object({
      /**
       * @param timeSlot The timeslot range to use for this (10:00 AM - 11:15 AM).
       */
      timeSlot: z
        .string()
        .regex(
          /(0|1)?\d:\d{2}\s+[ap]\.?(m\.?)?\s-\s(0|1)?\d:\d{2}\s+[ap]\.?(m\.?)?/gi,
        ),
      /**
       * @param crn The crn course to retrieve course sections (optional).
       */
      crn: z.string().optional(),
    }),
    result: CourseSection.array(),
  },
  /**
   * Retrieves a list of sections that matches the requirements given.
   */
  getRequirementCourses: {
    route: "/requirement",
    params: z.object({
      /**
       * @param requirement The string name for a requirement
       */
      requirement: z.string(),
    }),
    result: Course.array(),
  },
  /**
   * Retrieves a list of all academic subjects.
   */
  getAllSubjects: {
    route: "/subjects",
    params: z.object({}),
    result: z.string().array(),
  },
  /**
   * Retrieves course information based on Athena name.
   */
  getCourseByAthenaName: {
    route: "/course-by-athena-name",
    params: z.object({
      /**
       * @param athenaName The Athena name of the course
       */
      athenaName: z.string(),
    }),
    result: Course.array(),
  },
  /**
   * Gets all buildings
   */
  getAllBuildings: {
    route: "/buildings",
    params: z.object({}),
    result: Building.array(),
  },
  /**
   * Gets all instructors
   */
  getAllInstructors: {
    route: "/getAllInstructors",
    params: z.object({}),
    result: z.string().array(),
  },
  /**
   * Gets all CRNs
   */
  getAllCRNs: {
    route: "/getAllCRNs",
    params: z.object({}),
    result: z.number().int().array(),
  },

  getAvgProfessorRating: {
    route: "/avgRating",
    params: z.object({
      /**
       * Retrieves a Professor's Average Rating on RateMyProfessor.
       *
       * @param lname A String of the professor's last name
       * @param fname A String of the professor's first name
       */
      lname: z.string(),
      fname: z.string(),
    }),
    result: z.number(),
  },
  getNumProfessorRatings: {
    route: "/numRatings",
    params: z.object({
      /**
       * Retrieves the number of RateMyProfessor reviews of a professor
       *
       * @param lname A String of the professor's last name
       * @param fname A String of the professor's first name
       */
      lname: z.string(),
      fname: z.string(),
    }),
    result: z.number().int(),
  },
};

export default queries;
