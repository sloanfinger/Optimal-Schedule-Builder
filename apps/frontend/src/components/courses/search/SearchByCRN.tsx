import { Error } from "~/components/Toasts";
import Combobox from "~/components/ui/Combobox";
import useToast from "~/hooks/useToast";
import {
  useGetAllCRNs,
  useGetCourseDetailsByCrn,
} from "@repo/backend/course-information";
import type { Course } from "@repo/backend/course-information/models";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PiNetworkSlashDuotone } from "react-icons/pi";

type InputState =
  | Record<string, never>
  | {
      crn: string;
    };

interface Props {
  /**
   * The input state for the initial search query.
   */
  defaultValue?: InputState;
  /**
   * An event listener which fires when a course is selected.
   * @param course The selected course.
   */
  onChange?: (course: Course | null) => void;
  /**
   * An event listener which fires when the search query is
   * updates.
   * @param value The input state associated for the search query.
   */
  onInput?: (value: InputState) => void;
}

/**
 * Search for courses by CRN. When a valid CRN is selected,
 * a small preview is displayed.
 */
export default function SearchByCRN({
  defaultValue,
  onChange,
  onInput,
}: Props) {
  const [crn, setCRN] = useState(defaultValue?.crn);
  const dispatchError = useToast(Error);

  const crnsQuery = useGetAllCRNs();
  const courseSectionsQuery = useGetCourseDetailsByCrn(
    { crn: crn ?? "" },
    { swr: { enabled: crn !== undefined } },
  );

  const crns = useMemo(
    () =>
      crnsQuery.data?.data.map((value) => ({
        value: String(value),
        content: String(value),
      })),
    [crnsQuery.data],
  );

  const course = useMemo(
    () => courseSectionsQuery.data?.data,
    [courseSectionsQuery.data],
  );

  const handleCrnChange = useCallback(
    (value: string | undefined) => {
      setCRN(value);
      onInput?.(value ? { crn: value } : {});
    },
    [setCRN, onInput],
  );

  /**
   * If the provided `defaultValue` is invalid,
   * reset the input state and selected course.
   */
  useEffect(() => {
    if (
      !(
        defaultValue &&
        "crn" in defaultValue &&
        crnsQuery.data?.data.includes(Number(defaultValue.crn))
      )
    ) {
      return;
    }

    onInput?.({});
    onChange?.(null);
    return;
  }, [
    defaultValue,
    crnsQuery.data,
    courseSectionsQuery.data,
    onChange,
    onInput,
  ]);

  /**
   * When a course is selected, trigger the `onChange`
   * event handler, if it exists.
   */
  useEffect(() => {
    onChange?.(course ?? null);
  }, [onChange, course]);

  useEffect(() => {
    if (crnsQuery.error) {
      dispatchError({
        icon: PiNetworkSlashDuotone,
        message: "Could not connect to course information service.",
      });
    }
  }, [crnsQuery.error, dispatchError]);

  useEffect(() => {
    if (courseSectionsQuery.error) {
      dispatchError({
        icon: PiNetworkSlashDuotone,
        message: "Could not connect to course information service.",
      });
    }
  }, [courseSectionsQuery.error, dispatchError]);

  return (
    <fieldset className="grid w-full max-w-96 grid-cols-[max-content_1fr] grid-rows-[max-content_1fr] items-center gap-x-3 gap-y-3">
      <label className="contents">
        <span className="text-lg font-bold">CRN:</span>
        <Combobox
          defaultValue={defaultValue?.crn}
          options={crns}
          searchPlaceholder="Search CRNs..."
          selectPlaceholder="Select a CRN"
          onChange={handleCrnChange}
        />
      </label>

      {course && (
        <article className="border-bulldog-red col-start-2 flex flex-col rounded-md border border-dashed bg-white px-3 py-2 text-sm text-red-900 shadow-inner">
          <h3 className="font-semibold">
            {course.subject} {course.courseNumber}
          </h3>
          <p className="italic">{course.athenaTitle}</p>
        </article>
      )}
    </fieldset>
  );
}
