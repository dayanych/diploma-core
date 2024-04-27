import { addDays, format } from 'date-fns';

export const getFutureDate = (days: number) => {
  const today = new Date();
  const futureDate = addDays(today, days);

  const formattedDate = format(futureDate, 'M/d/yyyy');

  return formattedDate;
};
