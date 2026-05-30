import stringify from 'fast-json-stable-stringify';

export const patientSearchableFields: string[] = ['name', 'email', 'contactNo'];

export const patientFilterableFields: string[] = ['searchTerm', 'email', 'contactNumber'];

export const patientCacheKeys = {
  allList: (filters: unknown, options: unknown, includeHealthData: boolean): string =>
    `patients:all:${stringify({ filters, options, includeHealthData })}`,
  details: (id: string): string => `patients:details:${id}`,
  allLists: (): string => 'patients:*',
};
