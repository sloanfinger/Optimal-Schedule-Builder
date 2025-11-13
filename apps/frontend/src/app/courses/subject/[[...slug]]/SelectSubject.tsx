"use client";

import { useCallback, useContext } from "react";
import Combobox from "~/components/ui/Combobox";
import { context } from "../../layout";

interface Props {
  defaultValue: string | undefined;
  options: Record<string, string>;
}

export default function SelectSubject({ defaultValue, options }: Props) {
  const { stage } = useContext(context)!.coursesBySubject;

  const calculateDisplayText = useCallback(
    (value?: string) => (value ? options[value] : "Select a Subject"),
    [options],
  );

  const handleChange = useCallback(
    (value?: string) => {
      stage(() => ({
        subject: value,
      }));
    },
    [stage],
  );

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
