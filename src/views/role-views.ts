/**
* Role views mapping
* 
* Mapping of user roles to their respective views in the dashboard.
*/

import ApplicantView from "@views/ApplicantView.astro";
import AuthorizerView from "@views/AuthorizerView.astro";
import AdminView from "@views/AdminView.astro";
import AccountsPayableView from "@views/AccountsPayableView.astro";
import TravelAgencyView from "@views/TravelAgencyView.astro";

import type { UserRole } from "@type/roles";
import { resolveDashboardProfile } from "@/utils/userExperience";

export const roleViews: Record<UserRole, any> = {
  'Solicitante': ApplicantView,
  'Autorizador': AuthorizerView,
  'Administrador': AdminView,
  'Cuentas por pagar': AccountsPayableView,
  'Agencia de viajes': TravelAgencyView,
};

export function resolveRoleView(role: string, permissionKeys: string[] = []) {
  if (roleViews[role]) {
    return roleViews[role];
  }

  const profile = resolveDashboardProfile(role, permissionKeys);

  switch (profile) {
    case 'admin':
      return AdminView;
    case 'accounts-payable':
      return AccountsPayableView;
    case 'travel-agency':
      return TravelAgencyView;
    case 'authorizer':
      return AuthorizerView;
    case 'applicant':
    default:
      return ApplicantView;
  }
}