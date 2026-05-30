import stringify from 'fast-json-stable-stringify';

export const scheduleCacheKeys = {
  list: (userEmail: string | undefined, filters: unknown, options: unknown): string =>
    `schedules:list:${userEmail || 'anonymous'}:${stringify({ filters, options })}`,
  allLists: (): string => 'schedules:*',
};
