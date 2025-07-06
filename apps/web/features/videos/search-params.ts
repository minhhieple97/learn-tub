import {
  createSearchParamsCache,
  parseAsStringLiteral,
  parseAsString,
} from "nuqs/server";

export const tabValues = {
  add: "add",
  library: "library",
} as const;

export type TabValue = (typeof tabValues)[keyof typeof tabValues];

export const learnPageParsers = {
  tab: parseAsStringLiteral(Object.values(tabValues)).withDefault(
    tabValues.add,
  ),
  q: parseAsString,
};

export const learnPageCache = createSearchParamsCache(learnPageParsers);
