import stringify from 'fast-json-stable-stringify';

export const appointmentFilterableFields: string[] = [
  'status',
  'paymentStatus',
  'patientEmail',
  'doctorEmail',
];

export const appointmentCacheKeys = {
  allList: (filters: unknown, options: unknown): string =>
    `appointments:all:${stringify({ filters, options })}`,
  myList: (
    userEmail: string | undefined,
    userRole: string | undefined,
    filters: unknown,
    options: unknown,
  ): string =>
    `appointments:my:${userEmail || 'anonymous'}:${userRole || 'anonymous'}:${stringify({ filters, options })}`,
  allLists: (): string => 'appointments:*',
};
