import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

export default function useKeyState<T, K extends keyof T>(
  [state, setState]: [T, Dispatch<SetStateAction<T>>],
  key: K,
): [T[K], Dispatch<SetStateAction<T[K]>>] {
  const keyState = useMemo(() => state[key], [state, key]);

  const setKeyState = useCallback(
    (action: SetStateAction<T[K]>) => {
      setState((s) => ({
        ...s,
        [key]: action instanceof Function ? action(s[key]) : action,
      }));
    },
    [key, setState],
  );

  return [keyState, setKeyState];
}
