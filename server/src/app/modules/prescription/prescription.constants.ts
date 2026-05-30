import stringify from 'fast-json-stable-stringify';

export const prescriptionFilterableFields: string[] = ['patientEmail', 'doctorEmail'];

export const prescriptionCacheKeys = {
  allList: (filters: unknown, options: unknown): string =>
    `prescriptions:all:${stringify({ filters, options })}`,
  patientList: (userEmail: string | undefined, options: unknown): string =>
    `prescriptions:patient:${userEmail || 'anonymous'}:${stringify({ options })}`,
  allLists: (): string => 'prescriptions:*',
};
