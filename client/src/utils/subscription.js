const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfLocalDay = (date) => {
  const normalized = new Date(date);
  return new Date(normalized.getFullYear(), normalized.getMonth(), normalized.getDate());
};

export const getDaysRemaining = (endDateValue, referenceDate = new Date()) => {
  if (!endDateValue) return 0;

  const endDate = startOfLocalDay(endDateValue);
  const currentDate = startOfLocalDay(referenceDate);

  return Math.max(0, Math.round((endDate - currentDate) / MS_PER_DAY));
};

export const getSubscriptionCycleDays = (daysRemaining) => {
  return daysRemaining > 100 ? 365 : 90;
};

export const getSubscriptionProgress = (daysRemaining) => {
  const cycleDays = getSubscriptionCycleDays(daysRemaining);
  if (!cycleDays) return 0;

  return Math.min(100, Math.max(0, (daysRemaining / cycleDays) * 100));
};