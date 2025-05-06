const MAX_LENGTH = 27;
export function truncateString(str, maxLength = MAX_LENGTH) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + '...';
  } else {
    return str;
  }
}

export const formatDateWithOrdinalSuffix = (day) => {
  if (day < 1 || day > 31) {
    return 'Invalid day';
  }

  // Handle special cases for 11th, 12th, and 13th
  if (day >= 11 && day <= 13) {
    return day + 'th';
  }

  // Determine the ordinal suffix based on the last digit
  const lastDigit = day % 10;
  let suffix = '';
  switch (lastDigit) {
    case 1:
      suffix = 'st';
      break;
    case 2:
      suffix = 'nd';
      break;
    case 3:
      suffix = 'rd';
      break;
    default:
      suffix = 'th';
  }

  return day + suffix;
};
