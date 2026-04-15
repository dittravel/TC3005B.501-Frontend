/**
 * Society Helper
 *
 * This module provides utility functions to retrieve the society name
 * based on the society_id stored in cookies.
 */

import { getCookie } from '@data/cookies';
import { apiRequest } from '@/utils/apiClient';
import type { AstroGlobal } from 'astro';

export async function getSocietyName(astro: AstroGlobal): Promise<string> {
  const defaultName = "Ditta Consulting";
  const societyId = getCookie("society_id", astro.cookies);

  if (!societyId) {
    return defaultName;
  }

  try {
    const societyResponse = await apiRequest(`/societies/name/${societyId}`, {
      cookies: astro.cookies
    });

    if (societyResponse?.description) {
      return societyResponse.description;
    }
  } catch (error) {
    console.error("Error fetching society name:", error);
  }

  return defaultName;
}
