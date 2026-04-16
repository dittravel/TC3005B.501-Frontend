/**
 * Role Configuration Form Component
 * 
 * Form component for configuring user roles in the system. 
 * It allows administrators to set a default role for new users 
 * and view descriptions of predefined roles. The form includes 
 * validation to ensure required fields are completed before submission.
 * 
 */

import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import type { UserRole } from '@/types/roles';
import DefaultAuthRule from "@/components/Forms/DefaultAuthRule";
import CancelRefundPolicyModal from '../Modals/CancelRefundPolicyModal';
// import CancelRefundPolicyModal from '@/components/Modals/CancelRefundPolicyModal';
import { apiRequest } from '@/utils/apiClient';


interface DefaultRoleConfigurationFormData {
    defaultRole: string;
}

type RoleConfigurationErrors = Partial<Record<keyof DefaultRoleConfigurationFormData, string>>;

interface Props {
    token: string;
    defaultRole?: any;
}


// Renders the default refund policy form and paginated list of existing policies.
export default function RoleConfigurationForm({ token, defaultRole }: Props) {

    // Default refund policy form state
    const [roleConfigurationData, setRoleConfigurationData] = useState<DefaultRoleConfigurationFormData>({
        defaultRole: ''
    });

    const [selectedDefinedRole, setSelectedDefinedRole] = useState<string>('');

    const [roleConfigurationErrors, setRoleConfigurationErrors] = useState<RoleConfigurationErrors>({});

    // Load default role configuration data on component 
    useEffect(() => {
        if (!defaultRole) return;
        setRoleConfigurationData({
            defaultRole: defaultRole.name || ''
        });
    }, [defaultRole]);

    const roleContent: Record<string, { user: string; userDescription: string, travelRequest: string, travelRequestDescription: string, receipt: string, receiptDescription: string, refund: string, refundDescription: string }> = {
        admin: {
            user: 'Usuarios',
            userDescription: '• Ver usuarios \n• Crear usuarios \n• Editar usuarios \n• Eliminar usuarios',
            travelRequest: '',
            travelRequestDescription: '',
            receipt: '',
            receiptDescription: '',
            refund: '',
            refundDescription: ''
        },
        authorizer: {
            user: 'Usuarios',
            userDescription: '• Ver usuarios',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes \n• Crear solicitudes \n• Editar solicitudes \n• Eliminar solicitudes \n• Aprobar/Rechazar solicitudes \n• Definir monto a autorizar \n• Finalizar viajes \n• Cancelar viajes \n• Rechazar viajes',
            receipt: 'Comprobantes',
            receiptDescription: '• Ver comprobantes \n• Aprobar comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos \n• Aprobar reembolsos'
        },
        applicant: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes \n• Ver viajes \n• Crear viajes \n• Editar viajes \n• Ver vuelos \n• Ver hoteles',
            receipt: 'Comprobantes',
            receiptDescription: '• Crear comprobantes \n• Editar comprobantes',
            refund: 'Reembolsos',
            refundDescription: 'Este rol no tiene permisos para visualizar o editar reembolsos en el sistema.'
        },
        accountsToPay: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes',
            receipt: 'Comprobantes',
            receiptDescription: '• Ver comprobantes \n• Crear comprobantes \n• Editar comprobantes \n• Eliminar comprobantes \n• Aprobar comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos \n• Aprobar reembolsos'
        },
        travelAgency: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver viajes \n• Editar viajes \n• Ver vuelos \n• Ver hoteles \n• Finalizar viajes \n• Cancelar viajes',
            receipt: 'Comprobantes',
            receiptDescription: 'Este rol no tiene permisos para visualizar o editar comprobantes en el sistema.',
            refund: 'Reembolsos',
            refundDescription: 'Este rol no tiene permisos para visualizar o editar reembolsos en el sistema.'
        },
    };

    // Updates numeric form fields and clears field-level error state.
    const handleRoleConfigurationChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoleConfigurationData(prev => ({ ...prev, [name]: value }));
        setRoleConfigurationErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Validates and submits the default refund policy form.
    const handleRoleConfigurationSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors: RoleConfigurationErrors = {};

        if (!roleConfigurationData.defaultRole) {
            errors.defaultRole = 'Selecciona un rol por defecto';
        }

        if (Object.keys(errors).length > 0) {
            setRoleConfigurationErrors(errors);
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        // Create data to send to backend
        const data = {
            default_role: roleConfigurationData.defaultRole
        };

        try {
            const response = await apiRequest(`/admin/update-role/${defaultRole.role_id}`, {
                method: 'PUT',
                data: data,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.success) {
                alert("Rol por defecto actualizada exitosamente");
                window.location.reload();
            } else {
                alert("Error al actualizar el rol por defecto");
            }
        } catch (error) {
            console.error("Error saving default role:", error);
            alert("Error al actualizar el rol por defecto");
        }


        setRoleConfigurationData({
            defaultRole: ''
        });
        setRoleConfigurationErrors({});
    };

    return (
        <div className="space-y-8">

            {/* Default Refund Policy Section */}
            <div className="card">
                <div className="card-title">
                    <h3 className="text-lg font-bold text-text-primary">Configuración por defecto</h3>
                    <p className="text-sm text-text-secondary">
                        Este será el rol aplicado por defecto para los usuarios del sistema.
                    </p>
                </div>

                <form onSubmit={handleRoleConfigurationSubmit} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <label htmlFor="defaultRole" className="text-sm font-medium text-text-primary">
                            Rol por defecto
                        </label>
                        <select
                            id="defaultRole"
                            name="defaultRole"
                            value={roleConfigurationData.defaultRole}
                            onChange={handleRoleConfigurationChange}
                            className="border border-border-primary rounded-md px-3 py-2 text-sm text-text-primary bg-background-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                            <option value="" disabled>Selecciona un rol</option>
                            <option value="admin">Administrador</option>
                            <option value="authorizer">Autorizador</option>
                            <option value="applicant">Solicitante</option>
                            <option value="accountsToPay">Cuentas por pagar</option>
                            <option value="travelAgency">Agencia de viajes</option>
                        </select>
                    </div>

                    {roleConfigurationErrors.defaultRole && (
                        <p className="text-sm text-red-500">{roleConfigurationErrors.defaultRole}</p>
                    )}

                    <div className="flex justify-end">
                        <Button variant="filled" color="secondary">
                            Guardar Rol por Defecto
                        </Button>
                    </div>
                </form>
            </div>

            {/* Roles definidos en el sistema */}
            <div className="card">
                <div className="card-title">
                    <h3 className="text-lg font-bold text-text-primary">Roles definidos en el sistema</h3>
                    <p className="text-sm text-text-secondary">
                        Selecciona un rol para ver su descripción y configuración.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="definedRole" className="text-sm font-medium text-text-primary">
                        Roles definidos en el sistema
                    </label>
                    <select
                        id="definedRole"
                        name="definedRole"
                        value={selectedDefinedRole}
                        onChange={(e) => setSelectedDefinedRole(e.target.value)}
                        className="border border-border-primary rounded-md px-3 py-2 text-sm text-text-primary bg-background-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="" >Selecciona un rol</option>
                        <option value="admin">Administrador</option>
                        <option value="authorizer">Autorizador</option>
                        <option value="applicant">Solicitante</option>
                        <option value="accountsToPay">Cuentas por pagar</option>
                        <option value="travelAgency">Agencia de viajes</option>
                    </select>
                </div>

                {selectedDefinedRole && roleContent[selectedDefinedRole] && (
                    selectedDefinedRole === 'admin' ? (
                        <div className="flex flex-col card-secondary">
                            <div className="flex flex-col gap-4">
                                <h2 className="font-semibold text-text-primary">
                                    {roleContent[selectedDefinedRole].user}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {roleContent[selectedDefinedRole].userDescription}
                                </p>
                                <h2 className="font-semibold text-text-primary">
                                    {"Datos"}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {"• Importar datos"}
                                </p>
                                <h2 className="font-semibold text-text-primary">
                                    {"Reglas autorización"}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {"• Ver reglas de autorización \n• Crear reglas de autorización \n• Editar reglas de autorización \n• Eliminar reglas de autorización"}
                                </p>
                                <h2 className="font-semibold text-text-primary">
                                    {"Roles del sistema"}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {"• Ver roles por defecto/del sistema/personalizados \n• Crear roles personalizados \n• Editar roles por defecto/personalizados \n• Eliminar roles personalizados "}
                                </p>
                                <h2 className="font-semibold text-text-primary">
                                    {"Políticas de reembolso"}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {"• Ver políticas de reembolso \n• Crear políticas de reembolso \n• Editar políticas de reembolso \n• Eliminar políticas de reembolso"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col card-secondary">
                            <div className="flex flex-col gap-4">
                                <h2 className="font-semibold text-text-primary">
                                    {roleContent[selectedDefinedRole].user}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {roleContent[selectedDefinedRole].userDescription}
                                </p>

                                <h2 className="font-semibold text-text-primary">
                                    {roleContent[selectedDefinedRole].travelRequest}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {roleContent[selectedDefinedRole].travelRequestDescription}
                                </p>

                                <h2 className="font-semibold text-text-primary">
                                    {roleContent[selectedDefinedRole].receipt}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {roleContent[selectedDefinedRole].receiptDescription}
                                </p>

                                <h2 className="font-semibold text-text-primary">
                                    {roleContent[selectedDefinedRole].refund}
                                </h2>
                                <p className="text-sm text-text-secondary whitespace-pre-line">
                                    {roleContent[selectedDefinedRole].refundDescription}
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>

        </div>
    );
}
