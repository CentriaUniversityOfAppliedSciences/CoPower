import { AppSettings } from "./Settings";
import { StorageGet } from "./Storage";

/**
 * Check if the user has access to a certain role
 * @param requiredRole Access role to check against (appadmin, admin, user)
 * @returns If the user has access to the required role
 */
const CheckAccess = (requiredRole: string): boolean => {
  const role = StorageGet('role');
  switch (requiredRole) {
    case 'appadmin': { return role === 'appadmin'; } // Check if user is appadmin
    case 'admin': { return role === 'admin' || role === 'appadmin'; } // Check if user is admin
    case 'user': { return role === 'user' || role === 'admin' || role === 'appadmin'; } // Check if user is user or admin
    default: { return false; } // Invalid role
  }
}

/**
 * Convert a HEX color string to an RGB color string
 * @param hex The HEX color string
 * @returns The RGB color string
 */
const ConvertHEXtoRGB = (hex: string): string => {
  const hexRegex = /^([A-Fa-f0-9]{6})$/;
  if (hexRegex.test(hex) === false) { return ''; }

  const bigint = parseInt(hex, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

/**
 * Format a date into a string
 * @param date The date to format
 * @param datestr Whether to include the date part
 * @param timestr Whether to include the time part
 * @returns The formatted date string
 */
const FormatDate = (date: number | string, datestr: boolean, timestr: boolean, secondstr: boolean = false): string => {
  if ((typeof(date) !== 'string') && (typeof(date) !== 'number')) { return '-'; }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '-';
  } else {
    let rstr = '';
    if (datestr === true) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      rstr = (`${day}.${month}.${year}` + (timestr === true ? ' ' : ''));
    }
    if (timestr === true) {
      const hour = d.getHours();
      const minute = d.getMinutes().toString().padStart(2, '0');
      rstr += `${hour}:${minute}`;
    }
    if (secondstr === true) {
      const second = d.getSeconds().toString().padStart(2, '0');
      rstr += `:${second}`;
    }
    if (rstr.length > 0) {
      return rstr;
    } else { return '-' }
  }
}

/**
 * Get the headers for API requests
 * @param auth Whether to include the Authorization header
 * @returns The headers object
 */
const GetURLHeader = (auth = true): any => {
  if (auth === false) {
    return {
      'Content-Type': 'application/json',
      'X-CoPower-API': AppSettings.env.API_KEY
    };
  } else {
    const token = StorageGet('jwtToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-CoPower-API': AppSettings.env.API_KEY
    };
  }
}

/**
 * Decode a JWT token
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
const jwtDecode = (token: string | null | undefined): Record<string, any> | null => {
  try {
    if (!token) { return null; } // Return null if token is empty or undefined
    return JSON.parse(atob(token.split('.')[1])); //
  } catch (e) { return null; }
};

export { CheckAccess, ConvertHEXtoRGB, FormatDate, GetURLHeader, jwtDecode };