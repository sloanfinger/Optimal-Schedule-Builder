"use client";

import { useContext, type ReactNode } from "react";
import Combobox from "~/components/ui/Combobox";
import { context } from "../../layout";

interface Props {
  options: Record<string, ReactNode> | undefined;
}

export default function SelectSection({ options }: Props) {
  const [_query, setQuery] = useContext(context)!.coursesBySubject;
  const defaultValue = options ? Object.keys(options) : [];
  //console.log();

  return (
    <Combobox
      defaultValue={defaultValue}
      displayText={(values) => {
        switch (values.length) {
          case defaultValue.length:
            return "All Sections";
          case 0:
            return "Select a Course Section";
          default:
            return Number(values.length) + " Sections";
        }
      }}
      options={options}
      searchPlaceholder="Search sections..."
      onChange={(values) =>
        setQuery((q) => ({
          courseId: q.courseId,
          crns: values,
          subject: q.subject,
        }))
      }
      multiple
    />
  );
}
