"use client";

import { useRouter } from "next/navigation";
import { useContext, type ReactNode } from "react";
import Combobox from "~/components/ui/Combobox";
import useLocalStorage from "~/hooks/useLocalStorage";
import { context } from "../../layout";

interface Props {
  defaultValue: string | undefined;
  options: Record<string, ReactNode> | undefined;
}

export default function SelectCourse({ defaultValue, options }: Props) {
  const [_query, setQuery] = useContext(context)!.coursesBySubject;

  return (
    <Combobox
      defaultValue={defaultValue}
      displayText={(value) =>
        options && value !== undefined ? options[value] : "Select a Course"
      }
      options={options}
      searchPlaceholder="Search subjects..."
      onChange={(value) =>
        setQuery((q) => ({
          courseId: value,
          crns: undefined,
          subject: q.subject,
        }))
      }
    />
  );
}
