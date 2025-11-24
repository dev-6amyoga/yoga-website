/**
 * Timezone Converter Utility
 * Converts times from IST (Asia/Kolkata) to user's local timezone
 */

/**
 * Convert IST time string (HH:mm format) to user's local timezone
 * Used for recurring classes where backend stores times as IST
 * @param {string} istTimeString - Time in "HH:mm" format (stored as IST)
 * @param {Date} referenceDate - Date to use for conversion (default: today)
 * @returns {Object} Object with {localHour, localMinute, localDate, istDate}
 */
export const convertISTToLocalTime = (istTimeString, referenceDate = new Date()) => {
  // Create a date object assuming the time string is in IST
  const [hour, minute] = istTimeString.split(":").map(Number);

  // Create IST date: treat the input time as IST
  const istDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    hour,
    minute,
    0
  );

  // Get the offset between IST and local timezone
  // IST is UTC+5:30 (19800 seconds)
  const ISTOffset = 5.5 * 60 * 60 * 1000; // in milliseconds
  const localOffset = istDate.getTimezoneOffset() * 60 * 1000; // in milliseconds

  // Adjust: convert IST time to UTC, then to local time
  const utcTime = istDate.getTime() - ISTOffset;
  const localDate = new Date(utcTime + localOffset);

  return {
    localHour: localDate.getHours(),
    localMinute: localDate.getMinutes(),
    localDate: localDate,
    istDate: istDate,
  };
};

/**
 * Get a Date object for a recurring class in the user's local timezone
 * Backend stores recurring class times as IST, we need to convert them
 * @param {string} istTimeString - Time in "HH:mm" format (IST)
 * @param {Date} referenceDate - Reference date (usually today)
 * @returns {Date} Date object adjusted to user's local timezone
 */
export const getLocalDateForRecurringClass = (istTimeString, referenceDate = new Date()) => {
  const converted = convertISTToLocalTime(istTimeString, referenceDate);
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    converted.localHour,
    converted.localMinute,
    0
  );
};

/**
 * Format time with timezone info for display
 * @param {string} istTimeString - Time in "HH:mm" format (IST)
 * @param {boolean} showTimezone - Whether to append timezone abbreviation
 * @returns {string} Formatted time string
 */
export const formatTimeWithTimezone = (istTimeString, showTimezone = false) => {
  const converted = convertISTToLocalTime(istTimeString);
  const hours = String(converted.localHour).padStart(2, "0");
  const minutes = String(converted.localMinute).padStart(2, "0");

  if (showTimezone) {
    const timezone = Intl.DateTimeFormat("en", { timeZoneName: "short" })
      .formatToParts(converted.localDate)
      .find((part) => part.type === "timeZoneName")?.value || "";
    return `${hours}:${minutes} ${timezone}`;
  }

  return `${hours}:${minutes}`;
};

/**
 * Get the user's current timezone abbreviation
 * @returns {string} Timezone abbreviation (e.g., "IST", "EST", "AEST")
 */
export const getUserTimezoneAbbr = () => {
  return Intl.DateTimeFormat("en", { timeZoneName: "short" })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value || "Local";
};
