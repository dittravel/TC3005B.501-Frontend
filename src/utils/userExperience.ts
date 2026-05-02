export type DashboardProfile = 'applicant' | 'authorizer' | 'admin' | 'accounts-payable' | 'travel-agency';

import { hasRoutePermission } from '@/config/routeAccess';

function canAccess(pathname: string, permissionKeys: string[]): boolean {
  return hasRoutePermission(pathname, permissionKeys);
}

export function resolveDashboardProfile(_role: string, permissionKeys: string[] = []): DashboardProfile {
  if (canAccess('/roles', permissionKeys) || canAccess('/crear-usuario', permissionKeys) || canAccess('/sociedades', permissionKeys)) {
    return 'admin';
  }

  if (canAccess('/cotizaciones', permissionKeys)) {
    return 'accounts-payable';
  }

  if (canAccess('/atenciones', permissionKeys)) {
    return 'travel-agency';
  }

  if (canAccess('/autorizaciones', permissionKeys)) {
    return 'authorizer';
  }

  return 'applicant';
}

export function shouldShowDashboardMessages(profile: DashboardProfile): boolean {
  return profile !== 'applicant' && profile !== 'admin';
}


