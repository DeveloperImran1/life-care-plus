import stringify from 'fast-json-stable-stringify';
export const doctorSearchableFields: string[] = [
  'name',
  'email',
  'contactNumber',
  'address',
  'qualification',
  'designation',
];

export const doctorFilterableFields: string[] = [
  'searchTerm',
  'email',
  'contactNumber',
  'gender',
  'specialties',
];

export const doctorCacheKeys = {
  adminList: (filters: unknown, options: unknown): string =>
    `doctors:admin:${stringify({ filters, options })}`,

  publicList: (filters: unknown, options: unknown): string =>
    `doctors:public:${stringify({ filters, options })}`,

  details: (id: string): string => `doctor:details:${id}`,

  allDoctorLists: (): string => 'doctors:*',
};
