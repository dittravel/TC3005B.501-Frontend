/**
 * Role labels configuration
 * 
 * This maps each role to a name that can be displayed in the UI
 */

const baseRoleLabels: Record<string, string> = {
    'Solicitante': "Solicitante",
    'Autorizador': "Autorizador",
    'Administrador': "Administrador",
    'Superadministrador': "Superadministrador",
    'Cuentas por pagar': "Cuentas por Pagar",
    'Agencia de viajes': "Agencia de Viajes",
};

export const roleLabels: Record<string, string> = new Proxy(baseRoleLabels, {
    get(target, property: string | symbol) {
        if (typeof property !== 'string') {
            return '';
        }

        return target[property] || property || 'Usuario';
    },
});