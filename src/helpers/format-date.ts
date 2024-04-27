import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date) => {
  const formattedDate = format(date, "dd MMMM yyyy 'года'", { locale: ru });

  return formattedDate;
};
