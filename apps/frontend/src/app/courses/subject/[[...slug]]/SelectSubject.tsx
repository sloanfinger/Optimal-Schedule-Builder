"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import Combobox from "~/components/ui/Combobox";
import useLocalStorage from "~/hooks/useLocalStorage";
import { context } from "../../layout";

interface Props {
  defaultValue: string | undefined;
  options: Record<string, string>;
}

export default function SelectSubject({ defaultValue, options }: Props) {
  const [_query, setQuery] = useContext(context)!.coursesBySubject;

  return (
    <Combobox
      defaultValue={defaultValue}
      displayText={(value) =>
        options && value !== undefined ? options[value] : "Select a Subject"
      }
      options={options}
      searchPlaceholder="Search subjects..."
      onChange={(value) =>
        setQuery(() => ({
          courseId: undefined,
          crns: undefined,
          subject: value,
        }))
      }
    />
  );
}
