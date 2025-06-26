export const createEnumConstants = <T extends string>(
  enumValues: readonly T[],
): Record<string, NonNullable<T>> => {
  return enumValues
    .filter((value): value is NonNullable<T> => value !== undefined)
    .reduce(
      (acc, value) => {
        const key = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, NonNullable<T>>,
    );
};
