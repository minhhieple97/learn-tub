import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server";

export const tabValues = {
  add: "add",
  library: "library",
} as const;

export type TabValue = keyof typeof tabValues;

export const learnPageParsers = {
  tab: parseAsStringLiteral(Object.values(tabValues)).withDefault(
    tabValues.add,
  ),
};

export const learnPageCache = createSearchParamsCache(learnPageParsers);
