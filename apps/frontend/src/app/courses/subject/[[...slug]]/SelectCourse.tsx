"use client";

import { useCallback, useContext, type ReactNode } from "react";
import Combobox from "~/components/ui/Combobox";
import { context } from "../../layout";

interface Props {
  defaultValue: string | undefined;
  options: Record<string, ReactNode> | undefined;
}

export default function SelectCourse({ defaultValue, options }: Props) {
  const { stage } = useContext(context)!.coursesBySubject;

  const calculateDisplayText = useCallback(
    (value?: string) =>
      options
        ? value
          ? options[value]
          : "Select a Course"
        : "Awaiting subject selection...",
    [options],
  );

  const handleChange = useCallback((value?: string) => {
    if (!value) {
      return stage((current) => ({
        subject: current.subject,
      }));
    }

    stage((current) => ({
      subject: current.subject,
      courseNumber: Number(value),
      excludedCrns: [],
    }));
  }, []);

  return (
    <Combobox
      defaultValue={defaultValue}
      displayText={calculateDisplayText}
      options={options}
      searchPlaceholder="Search subjects..."
      onChange={handleChange}
    />
  );
}
