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
        authorizer: {
            user: 'Usuarios',
            userDescription: '• Ver usuarios \n• Crear usuarios \n• Editar usuarios \n• Eliminar usuarios',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes',
            receipt: 'Comprobantes',
            receiptDescription: '• Crear comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos'
        },
        applicant: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes',
            receipt: 'Comprobantes',
            receiptDescription: '• Crear comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos'
        },
        accountsToPay: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes',
            receipt: 'Comprobantes',
            receiptDescription: '• Crear comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos'
        },
        travelAgency: {
            user: 'Usuarios',
            userDescription: 'Este rol no tiene permisos para visualizar o editar información de usuarios en el sistema.',
            travelRequest: 'Solicitudes de viaje',
            travelRequestDescription: '• Ver solicitudes',
            receipt: 'Comprobantes',
            receiptDescription: '• Crear comprobantes',
            refund: 'Reembolsos',
            refundDescription: '• Solicitar reembolsos'
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
                        <option value="authorizer">Autorizador</option>
                        <option value="applicant">Solicitante</option>
                        <option value="accountsToPay">Cuentas por pagar</option>
                        <option value="travelAgency">Agencia de viajes</option>
                    </select>
                </div>

                {selectedDefinedRole && roleContent[selectedDefinedRole] && (
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
                )}
            </div>

            {/* Created Roles Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">
                    Políticas de Reembolso ({data.length})
                </h2>
                <Button variant="filled" color="secondary">
                    + Crear Política
                </Button>
            </div>
            {data.length > 0 ? (
                <div className="space-y-6">
                    {pageRequests.map((request: any) => (
                        <Card
                            key={request.request_id}
                            //href={`/detalles-politica-reembolso/${request.request_id}`}
                            tag={{ text: `Política #${request.request_id}`, type: 'secondary' }}
                            status={{
                                text: request.status || 'Desconocido',
                                type: getStatusTagType(request.status),
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr_auto] gap-8">
                                <div className="flex flex-row items-center gap-2">
                                    <p className="text-lm text-text-primary">
                                        <span className="font-semibold">{request.name}</span>
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-text-primary">
                                            Monto entre <span className="font-semibold"> {request.minAmount} </span>
                                            y <span className="font-semibold"> {request.maxAmount}  </span>
                                            MXN
                                        </p>
                                        <p className="text-sm text-text-primary">
                                            Tiempo máximo <span className="font-semibold"> {request.maxDays} </span> días
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-text-primary">
                                            Validado contra factura:
                                            <span className='font-semibold'>{!request.validateAgainstInvoice ? ' No' : ' Si'}</span>
                                        </p>
                                        <p className="text-sm text-text-primary">
                                            Validado contra insumo preferido:
                                            <span className='font-semibold'>{!request.validateAgainstInvoice ? ' No' : ' Si'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-end gap-2">
                                    <Button
                                        color="primary"
                                        variant="filled"
                                        size="medium"
                                        className="w-full"
                                    >
                                        Editar
                                    </Button>
                                    {/* <CancelRefundPolicyModal
                    id={request.request_id}
                    token={token}
                    color="warning"
                    variant="filled"
                    label="Eliminar"
                  /> */}
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Pagination
                        totalPages={totalPages}
                        page={page}
                        setPage={setPage}
                        maxVisible={5}
                    />
                </div>
            ) : (
                <Card className="text-center py-8">
                    <p className="text-text-secondary font-semibold">
                        No cuentas con políticas de reembolso creadas
                    </p>
                </Card>
            )}
        </div>
    );
}
