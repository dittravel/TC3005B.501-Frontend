/**
 * Role Configuration Form Component
 * 
 * Form component for configuring user roles in the system. 
 * It allows administrators to set a default role for new users 
 * and view descriptions of predefined roles. The form includes 
 * validation to ensure required fields are completed before submission.
 */

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Button from '@/components/Buttons/Button';
import Toast from '@/components/Utils/Toast';
import Select from '@/components/Utils/Select';
import { apiRequest } from '@/utils/apiClient';
import { permissionLabelToKey, permissionsByCategory } from '@/config/permissionCatalog';

interface DefaultRoleConfigurationFormData {
    defaultRole: string;
}

type RoleConfigurationErrors = Partial<Record<keyof DefaultRoleConfigurationFormData, string>>;

interface Props {
    token: string;
    defaultRole?: { role_id?: number; name?: string } | null;
    roles?: Array<{ role_id: number; name: string; permissions?: string[]; is_default?: boolean }>;
    canEditDefaultRole?: boolean;
}

type PermissionModule = {
    module: string;
    permissions: string[];
};

function getRolePermissionBreakdown(permissionValues: string[] = []): PermissionModule[] {
    if (!Array.isArray(permissionValues) || permissionValues.length === 0) {
        return [];
    }

    const normalizedKeys = new Set(
        permissionValues
            .map((value) => permissionLabelToKey[value] || value)
            .filter(Boolean)
    );

    return permissionsByCategory
        .map((catalogModule) => ({
            module: catalogModule.category,
            permissions: catalogModule.permissions
                .filter((item) => normalizedKeys.has(item.key))
                .map((item) => item.label),
        }))
        .filter((module) => module.permissions.length > 0);
}

export default function RoleConfigurationForm({ token, defaultRole, roles = [], canEditDefaultRole = false }: Readonly<Props>) {

    const [roleConfigurationData, setRoleConfigurationData] = useState<DefaultRoleConfigurationFormData>({
        defaultRole: ''
    });

    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [roleConfigurationErrors, setRoleConfigurationErrors] = useState<RoleConfigurationErrors>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error', duration = 2500) => {
        setToast({ message, type });
        globalThis.setTimeout(() => setToast(null), duration);
    };

    useEffect(() => {
        if (defaultRole?.role_id) {
            setRoleConfigurationData({ defaultRole: String(defaultRole.role_id) });
            return;
        }

        const dbDefaultRole = roles.find((role) => role.is_default);
        if (!dbDefaultRole) return;
        setRoleConfigurationData({
            defaultRole: String(dbDefaultRole.role_id)
        });
    }, [defaultRole, roles]);

    const selectedRole = roles.find(r => String(r.role_id) === selectedRoleId);
    const selectedRoleBreakdown = getRolePermissionBreakdown(selectedRole?.permissions || []);

    const handleRoleConfigurationChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoleConfigurationData(prev => ({ ...prev, [name]: value }));
        setRoleConfigurationErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRoleConfigurationSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        const errors: RoleConfigurationErrors = {};
        if (!roleConfigurationData.defaultRole) {
            errors.defaultRole = 'Selecciona un rol por defecto';
        }

        if (Object.keys(errors).length > 0) {
            setRoleConfigurationErrors(errors);
            showToast('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        try {
            const response = await apiRequest(`/admin/set-default-role/${roleConfigurationData.defaultRole}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.success) {
                showToast('Rol por defecto actualizado exitosamente', 'success');
                globalThis.location.reload();
            } else {
                showToast('Error al actualizar el rol por defecto', 'error');
            }
        } catch (error) {
            console.error("Error saving default role:", error);
            showToast('Error al actualizar el rol por defecto', 'error');
        }
    };

    return (
        <>
            <div className="space-y-8">

            {/* Default Role Section */}
            <div className="card">
                <div className="card-title">
                    <h3 className="text-lg font-bold text-text-primary">Rol por defecto</h3>
                    <p className="text-sm text-text-secondary">
                        Este será el rol aplicado por defecto para los usuarios del sistema.
                    </p>
                </div>

                <form onSubmit={handleRoleConfigurationSubmit} className="space-y-4">
                    <Select
                        label="Rol por defecto"
                        name="defaultRole"
                        value={roleConfigurationData.defaultRole}
                        onChange={handleRoleConfigurationChange}
                        disabled={!canEditDefaultRole}
                        className="border border-border-primary rounded-md px-3 py-2 text-sm text-text-primary bg-background-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="" disabled>Selecciona un rol</option>
                        {roles.map(role => (
                            <option key={role.role_id} value={String(role.role_id)}>
                                {role.name}
                            </option>
                        ))}
                    </Select>

                    {roleConfigurationErrors.defaultRole && (
                        <p className="text-sm text-red-500">{roleConfigurationErrors.defaultRole}</p>
                    )}

                    {canEditDefaultRole ? (
                        <div className="flex justify-end">
                            <Button variant="filled" color="secondary">
                                Guardar Rol por Defecto
                            </Button>
                        </div>
                    ) : null}
                </form>
            </div>

            {/* Defined Roles Section */}
            <div className="card">
                <div className="card-title">
                    <h3 className="text-lg font-bold text-text-primary">Roles definidos en el sistema</h3>
                    <p className="text-sm text-text-secondary">
                        Selecciona un rol para ver su descripción y configuración.
                    </p>
                </div>

                <Select
                    label="Roles definidos en el sistema"
                    name="definedRole"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="border border-border-primary rounded-md px-3 py-2 text-sm text-text-primary bg-background-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                    <option value="">Selecciona un rol</option>
                    {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                            {role.name}
                        </option>
                    ))}
                </Select>

                {selectedRole && (
                    <div className="flex flex-col card-secondary mt-4">
                        <div className="flex flex-col gap-4">
                            <h2 className="font-semibold text-text-primary">{selectedRole.name}</h2>
                            {selectedRoleBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedRoleBreakdown.map((module) => (
                                        <div key={module.module}>
                                            <h3 className="text-sm font-semibold text-text-primary">{module.module}</h3>
                                            <ul className="list-disc list-inside text-sm text-text-secondary mt-1 space-y-1">
                                                {module.permissions.map((permissionLabel) => (
                                                    <li key={`${module.module}-${permissionLabel}`}>{permissionLabel}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary">Sin permisos asignados</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                />
            )}
        </>
    );
}