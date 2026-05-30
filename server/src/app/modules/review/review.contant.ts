import stringify from 'fast-json-stable-stringify';

export const reviewFilterableFields: string[] = ['patientEmail', 'doctorEmail'];

export const reviewCacheKeys = {
  list: (filters: unknown, options: unknown): string =>
    `reviews:list:${stringify({ filters, options })}`,
  allLists: (): string => 'reviews:*',
};
