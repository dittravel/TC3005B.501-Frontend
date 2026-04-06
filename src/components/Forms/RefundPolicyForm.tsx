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
import CancelRefundPolicyModal from '@/components/Modals/CancelRefundPolicyModal';


interface DefaultReturnPolicyFormData {
  minAmount: number;
  maxAmount: number;
  maxDays: number;
  validateAgainstInvoice: boolean;
  validateAgainstPredefinedInput: boolean;
}

interface RefundPolicyProps {
  role: UserRole;
  data: any[];
  itemsPerPage?: number;
  token: string;
}


// Renders the default refund policy form and paginated list of existing policies.
export default function RefundPolicyForm({ role, data, itemsPerPage = 5, token }: RefundPolicyProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageRequests = data.slice(start, end);

  // Default refund policy form state
  const [refundPolicyData, setRefundPolicyData] = useState<DefaultReturnPolicyFormData>({
    minAmount: 0,
    maxAmount: 1,
    maxDays: 0,
    validateAgainstInvoice: false,
    validateAgainstPredefinedInput: false
  });

  const [refundPolicyErrors, setRefundPolicyErrors] = useState<Record<string, boolean>>({});

  const [selectedValidations, setSelectedValidations] = useState<Set<string | number>>(new Set());

  // Updates numeric form fields and clears field-level error state.
  const handleRefundPolicyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    setRefundPolicyData(prev => ({ ...prev, [name]: numericValue }));
    setRefundPolicyErrors(prev => ({ ...prev, [name]: false }));
  };

  // Syncs checkbox selections with the corresponding validation flags in form state.
  const handleValidationChange = (values: Set<string | number>) => {
    setSelectedValidations(new Set(values));
    setRefundPolicyData(prev => ({
      ...prev,
      validateAgainstInvoice: values.has('bill'),
      validateAgainstPredefinedInput: values.has('predefinedInput')
    }));
  };

  // Validates and submits the default refund policy form.
  const handleRefundPolicySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    Object.entries(refundPolicyData).forEach(([key, value]) => {
      if (typeof value === 'number' && value === 0) {
        errors[key] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setRefundPolicyErrors(errors);
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (refundPolicyData.minAmount >= refundPolicyData.maxAmount) {
      setRefundPolicyErrors(prev => ({
        ...prev,
        minAmount: true,
        maxAmount: true
      }));
      alert('El monto mínimo debe ser menor al monto máximo');
      return;
    }

    alert('Información de política de reembolso guardada correctamente');
    setRefundPolicyData({
      minAmount: 0,
      maxAmount: 1,
      maxDays: 0,
      validateAgainstInvoice: false,
      validateAgainstPredefinedInput: false
    });
    setSelectedValidations(new Set());
  };

  return (
    <div className="space-y-8">

      {/* Default Refund Policy Section */}
      <div className="card">
        <div className="card-title">
          <h3 className="text-lg font-bold text-text-primary">1. Política por defecto</h3>
          <p className="text-sm text-text-secondary">
            Esta política se aplicará para cualquier solicitud de reembolso por defecto
          </p>
        </div>

        <form onSubmit={handleRefundPolicySubmit} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-text-primary">
              Monto entre
            </label>
            <Input
              name="minAmount"
              type="number"
              required={true}
              value={refundPolicyData.minAmount}
              onChange={handleRefundPolicyChange}
              min={0}
              //max={refundPolicyData.maxAmount > 0 ? refundPolicyData.maxAmount - 1 : undefined}
            />
            <label className="text-sm font-medium text-text-primary">
              y
            </label>
            <Input
              name="maxAmount"
              type="number"
              required={true}
              value={refundPolicyData.maxAmount}
              onChange={handleRefundPolicyChange}
              min={Math.max(1, refundPolicyData.minAmount + 1)}
            />
            <span className="text-sm font-medium text-text-primary">MXN</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-text-primary">
              Tiempo máximo
            </label>
            <Input
              name="maxDays"
              type="number"
              required={true}
              value={refundPolicyData.maxDays}
              onChange={handleRefundPolicyChange}
              min={0}
            />
            <span className="text-sm font-medium text-text-primary">días</span>
          </div>

          <SelectGroup
            name="validations"
            label="Validaciones para Reembolso"
            items={[
              { id: 'bill', label: 'Validar contra Factura' },
              { id: 'predefinedInput', label: 'Validar contra Insumo Predefinido' }
            ]}
            selectedValues={selectedValidations}
            onChange={handleValidationChange}
          />

          <div className="flex justify-end">
            <Button variant="filled" color="secondary">
              Guardar Política de Reembolso
            </Button>
          </div>
        </form>
      </div>

      {/* Refund Policies Section */}
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
                  <CancelRefundPolicyModal
                    id={request.request_id}
                    token={token}
                    color="warning"
                    variant="filled"
                    label="Eliminar"
                  />
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
