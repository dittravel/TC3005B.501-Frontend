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

// Dummy data for demonstration
const currentBalance = 1250.75;
const reimbursementHistory = [
  { id: 1, date: '2023-10-15', amount: 850.50, status: 'paid' as const, requestId: 'TRV-2023-045' },
  { id: 2, date: '2023-09-02', amount: 400.25, status: 'paid' as const, requestId: 'TRV-2023-032' },
  { id: 3, date: '2023-11-20', amount: 1200.00, status: 'approved' as const, requestId: 'TRV-2023-058' },
  { id: 4, date: '2023-12-05', amount: 750.00, status: 'pending' as const, requestId: 'TRV-2023-067' }
];

const verifiedReceipts = [
  { id: 1, date: '2023-11-15', amount: 350.00, description: 'Hotel accommodation' },
  { id: 2, date: '2023-11-16', amount: 125.75, description: 'Meal expenses' },
  { id: 3, date: '2023-11-17', amount: 85.00, description: 'Transportation' }
];

const reimbursementPolicies = [
  { id: 1, name: 'Viajes económicos', minAmount: 1000, maxAmount: 2999, maxDays: 20, validateAgainstInvoice: false, validateAgainstPredefinedInput: false },
  { id: 2, name: 'Viajes costosos', minAmount: 3000, maxAmount: 5999, maxDays: 30, validateAgainstInvoice: true, validateAgainstPredefinedInput: true }
];

interface DefaultReturnPolicyFormData {
  minAmount: number;
  maxAmount: number;
  maxDays: number;
  validateAgainstInvoice: boolean;
  validateAgainstPredefinedInput: boolean;
}

interface RefundPolicyProps {
  role: UserRole;
}

export default function RefundPolicyForm({ role }: RefundPolicyProps) {
  // Bank form state
  const [refundPolicyData, setRefundPolicyData] = useState<DefaultReturnPolicyFormData>({
    minAmount: 0,
    maxAmount: 0,
    maxDays: 0,
    validateAgainstInvoice: false,
    validateAgainstPredefinedInput: false
  });

  // Verificar
  const [refundPolicyErrors, setRefundPolicyErrors] = useState<Record<string, boolean>>({});

  const [selectedValidations, setSelectedValidations] = useState<Set<string | number>>(new Set());

  // Default refund policy handlers
  const handleRefundPolicyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRefundPolicyData(prev => ({ ...prev, [name]: value }));
    setRefundPolicyErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleValidationChange = (values: Set<string | number>) => {
    setRefundPolicyData(prev => ({
      ...prev,
      validateAgainstInvoice: values.has('bill'),
      validateAgainstPredefinedInput: values.has('predefinedInput')
    }));
  };

  const handleRefundPolicySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    const errors: Record<string, boolean> = {};
    Object.entries(refundPolicyData).forEach(([key, value]) => {
      if (typeof value === 'number' && value === 0) {
        errors[key] = true;
      }
    });

    // Verificar
    // if (selectedValidations.size === 0) {
    //   alert('Por favor seleccione al menos una validación');
    //   return;
    // }

    if (Object.keys(errors).length > 0) {
      setRefundPolicyErrors(errors);
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Success message
    alert('Información de política de reembolso guardada correctamente');
    setRefundPolicyData({
      minAmount: 0,
      maxAmount: 0,
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

      {/* Refund History Section */}
      <div className="card">
        <div className="card-title">
          <h3 className="text-lg font-bold text-text-primary">2. Políticas personalizadas</h3>
        </div>

        <div className="overflow-x-auto border border-border rounded-md">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Solicitud Relacionada
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {reimbursementHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <Tag
                      text={item.status === 'paid' ? 'Pagado' : item.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      type={item.status === 'paid' ? 'secondary' : item.status === 'approved' ? 'success' : 'alert'}
                      size="small"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-500 underline">
                    <a href={`/requests/${item.requestId}`}>{item.requestId}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
