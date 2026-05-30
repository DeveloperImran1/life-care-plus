export type TLogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export type ILogFilterRequest = {
  searchTerm?: string;
  level?: string;
  method?: string;
  statusCode?: string;
};
