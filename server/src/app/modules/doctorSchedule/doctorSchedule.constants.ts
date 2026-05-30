import stringify from 'fast-json-stable-stringify';

export const scheduleFilterableFields: string[] = ['searchTerm', 'isBooked', 'doctorId'];

export const doctorScheduleCacheKeys = {
  list: (filters: unknown, options: unknown): string =>
    `doctor-schedules:list:${stringify({ filters, options })}`,
  allLists: (): string => 'doctor-schedules:*',
};
