/**
 * RefundForm Component
 * 
 * Provides a form for employees to view their current reimbursement balance, submit bank information,
 * and request reimbursements for verified receipts.
 * 
 * Displays a history of past reimbursements with status.
 * Validates form inputs and provides user feedback on submission.
 */

import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import Textarea from '@/components/Utils/Textarea';
import SelectGroup from '@/components/Utils/SelectGroup';
import Tag from '@/components/Utils/Tag';
import type { UserRole } from '@/types/roles';
import Pagination from "@/components/Table/Pagination";
import Card from "@/components/Utils/Card";
import { getStatusTagType } from "@/utils/statusMapper";
import DefaultAuthRule from "@/components/Forms/DefaultAuthRule";
import CancelRefundPolicyModal from '../Modals/CancelRefundPolicyModal';
// import CancelRefundPolicyModal from '@/components/Modals/CancelRefundPolicyModal';


interface DefaultRoleConfigurationFormData {
    defaultRole: string;
}

interface RoleConfigurationProps {
    role: UserRole;
    data: any[];
    itemsPerPage?: number;
    token: string;
}


// Renders the default refund policy form and paginated list of existing policies.
export default function RoleConfigurationForm({ role, data, itemsPerPage = 5, token }: RoleConfigurationProps) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageRequests = data.slice(start, end);

    // Default refund policy form state
    const [roleConfigurationData, setRoleConfigurationData] = useState<DefaultRoleConfigurationFormData>({
        defaultRole: ''
    });

    const [selectedDefinedRole, setSelectedDefinedRole] = useState<string>('');


    const [roleConfigurationErrors, setRoleConfigurationErrors] = useState<Record<string, boolean>>({});

    //const [selectedValidations, setSelectedValidations] = useState<Set<string | number>>(new Set());

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
    const handleRoleConfigurationChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = Number(value);
        setRoleConfigurationData(prev => ({ ...prev, [name]: numericValue }));
        setRoleConfigurationErrors(prev => ({ ...prev, [name]: false }));
    };

    // Syncs checkbox selections with the corresponding validation flags in form state.
    //   const handleValidationChange = (values: Set<string | number>) => {
    //     setSelectedValidations(new Set(values));
    //     setRoleConfigurationData(prev => ({
    //       ...prev,
    //     }));
    //   };

    // Dropdown change handler for default role selection, updates form state and clears errors.
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoleConfigurationData(prev => ({ ...prev, [name]: value }));
        setRoleConfigurationErrors(prev => ({ ...prev, [name]: false }));
    };

    // Validates and submits the default refund policy form.
    const handleRoleConfigurationSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors: Record<string, boolean> = {};
        Object.entries(roleConfigurationData).forEach(([key, value]) => {
            if (typeof value === 'number' && value === 0) {
                errors[key] = true;
            }
        });

        if (Object.keys(errors).length > 0) {
            setRoleConfigurationErrors(errors);
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        alert('Información de configuración de roles guardada correctamente');
        setRoleConfigurationData({
            defaultRole: ''
        });
        // setSelectedValidations(new Set());
    };

    return (
        <div className="space-y-8">

            {/* Default Refund Policy Section */}
            <div className="card">
                <div className="card-title">
                    <h3 className="text-lg font-bold text-text-primary">Configuración por defecto</h3>
                    <p className="text-sm text-text-secondary">
                        Este sera el rol apliado por defecto para los usuarios del sistema.
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
                            onChange={handleSelectChange}
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
