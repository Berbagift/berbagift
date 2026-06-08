import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

/**
 * Sets the authentication token in cookies.
 * 
 * @param token The JWT access token
 * @param expiresDays The number of days until the cookie expires
 */
export function setAuthToken(token: string, expiresDays: number = 7): void {
  if (!token) {
    throw new Error('Token is required to set authentication cookie');
  }
  
  Cookies.set(TOKEN_KEY, token, {
    expires: expiresDays,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Removes the authentication token from cookies.
 */
export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY, { path: '/' });
}

/**
 * Retrieves the authentication token from cookies.
 * 
 * @returns The JWT access token if it exists, otherwise undefined
 */
export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}
