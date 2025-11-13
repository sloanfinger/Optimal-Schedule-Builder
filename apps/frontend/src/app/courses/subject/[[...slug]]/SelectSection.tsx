"use client";

import { useCallback, useContext, type ReactNode } from "react";
import Combobox from "~/components/ui/Combobox";
import { context } from "../../layout";

interface Props {
  options: Record<string, ReactNode> | undefined;
}

export default function SelectSection({ options }: Props) {
  const { stage } = useContext(context)!.coursesBySubject;
  const defaultValue = options ? Object.keys(options) : [];

  const calculateDisplayText = useCallback(
    (values: string[]) => {
      if (!options) {
        return "Awaiting course selection...";
      }

      switch (values.length) {
        case defaultValue.length:
          return "All Sections";
        // case 0:
        //   return "Select a Course Section";
        default:
          return `Excluding ${defaultValue.length - values.length} Section${defaultValue.length - values.length === 1 ? "" : "s"}`;
      }
    },
    [options],
  );

  const handleChange = useCallback(
    (values: string[]) => {
      if (options) {
        stage((current) => ({
          subject: current.subject,
          courseNumber: current.courseNumber,
          excludedCrns: Object.keys(options)
            .filter((crn) => !values.includes(crn))
            .map((crn) => Number(crn)),
        }));
      }
    },
    [stage, options],
  );

  return (
    <Combobox
      defaultValue={defaultValue}
      displayText={calculateDisplayText}
      options={options}
      searchPlaceholder="Search sections..."
      onChange={handleChange}
      multiple
    />
  );
}
