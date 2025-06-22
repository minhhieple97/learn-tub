export const createEnumConstants = <T extends string>(
  enumValues: readonly T[],
): Record<string, T> => {
  return enumValues.reduce(
    (acc, value) => {
      const key = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, T>,
  );
};
