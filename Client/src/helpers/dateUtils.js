/**
 * Formats an ISO date string into a "time ago" relative format.
 * Supports localization through the 't' translation object.
 * 
 * @param {string} isoString - The ISO date string to format.
 * @param {object} t - The translation object from useLanguage.
 * @returns {string} Formatted relative time string.
 */
export const formatTimeAgo = (isoString, t) => {
  if (!isoString) return t?.pumps?.justNow || "Just now";
  
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // If difference is less than 1 minute
  if (diffInSeconds < 60) return t?.pumps?.justNow || "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // If more than 30 days, stick to single largest unit (months/years)
  if (diffInDays >= 30) {
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      const label = diffInMonths === 1 ? (t?.pumps?.month || "month ago") : (t?.pumps?.months || "months ago");
      return `${diffInMonths} ${label}`;
    }
    const diffInYears = Math.floor(diffInDays / 365);
    const label = diffInYears === 1 ? (t?.pumps?.year || "year ago") : (t?.pumps?.years || "years ago");
    return `${diffInYears} ${label}`;
  }

  const parts = [];
  const agoLabel = t?.pumps?.agoLabel || 'ago';

  // Days component
  if (diffInDays > 0) {
    const label = diffInDays === 1 ? (t?.pumps?.unitDay || 'd') : (t?.pumps?.unitDays || 'd');
    parts.push(`${diffInDays} ${label}`);
  }

  // Hours component
  const remainingHours = diffInHours % 24;
  if (remainingHours > 0) {
    const label = remainingHours === 1 ? (t?.pumps?.unitHour || 'h') : (t?.pumps?.unitHours || 'h');
    parts.push(`${remainingHours} ${label}`);
  }

  // Minutes component
  const remainingMinutes = diffInMinutes % 60;
  if (remainingMinutes > 0) {
    const label = remainingMinutes === 1 ? (t?.pumps?.unitMin || 'm') : (t?.pumps?.unitMins || 'm');
    parts.push(`${remainingMinutes} ${label}`);
  }

  // Handle case where it might be exactly on the hour/day boundary
  if (parts.length === 0) return t?.pumps?.justNow || "Just now";

  return `${parts.join(' ')} ${agoLabel}`;
};
