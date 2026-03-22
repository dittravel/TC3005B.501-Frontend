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

interface BankFormData {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  swiftCode: string;
  iban: string;
}

interface ReimbursementFormData {
  amount: string;
  notes: string;
}

interface RefundFormProps {
  role: UserRole;
}

export default function RefundForm({ role }: RefundFormProps) {
  // Bank form state
  const [bankData, setBankData] = useState<BankFormData>({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    accountType: '',
    swiftCode: '',
    iban: ''
  });

  const [bankErrors, setBankErrors] = useState<Record<string, boolean>>({});

  // Reimbursement form state
  const [reimbursementData, setReimbursementData] = useState<ReimbursementFormData>({
    amount: '',
    notes: ''
  });

  const [selectedReceipts, setSelectedReceipts] = useState<Set<string | number>>(new Set());
  const [reimbursementErrors, setReimbursementErrors] = useState<Record<string, boolean>>({});

  // Bank form handlers
  const handleBankInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
    setBankErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleBankSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    const errors: Record<string, boolean> = {};
    Object.entries(bankData).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[key] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setBankErrors(errors);
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Success message
    alert('Información bancaria guardada correctamente');
    setBankData({
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      accountType: '',
      swiftCode: '',
      iban: ''
    });
  };

  // Reimbursement form handlers
  const handleReimbursementInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReimbursementData(prev => ({ ...prev, [name]: value }));
    setReimbursementErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleReceiptChange = (values: Set<string | number>) => {
    setSelectedReceipts(values);
  };

  const handleReimbursementSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    const amount = parseFloat(reimbursementData.amount);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      errors.amount = true;
      alert('Por favor ingrese un monto válido');
    } else if (amount > currentBalance) {
      errors.amount = true;
      alert('El monto solicitado no puede exceder su saldo disponible');
    }

    // Validate receipts
    if (selectedReceipts.size === 0) {
      alert('Por favor seleccione al menos un comprobante verificado');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setReimbursementErrors(errors);
      return;
    }

    // Success message
    alert('Solicitud de reembolso enviada correctamente');
    setReimbursementData({ amount: '', notes: '' });
    setSelectedReceipts(new Set());
  };

  return (
    <div className="space-y-8">
      {/* Balance Section */}
      <div className="card">
        <div className="card-title">
          <h3 className="text-lg font-bold text-text-primary">1. Balance Actual</h3>
        </div>

        <div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-text-primary">Saldo Actual</h4>
              <p className="text-sm text-text-secondary">
                {currentBalance >= 0 ? 'La empresa le debe' : 'Usted le debe a la empresa'}
              </p>
            </div>
            <Tag
              text={`${currentBalance >= 0 ? '+$' : ''}${currentBalance.toFixed(2)} USD`}
              type={currentBalance >= 0 ? 'success' : 'warning'}
              size="large"
            />
          </div>
        </div>
      </div>

      {/* Bank Information Section */}
      <div className="card">
        <div className="card-title">
          <h3 className="text-lg font-bold text-text-primary">2. Información Bancaria</h3>
          <p className="text-sm text-text-secondary">
            Por favor proporcione sus datos bancarios para recibir los reembolsos
          </p>
        </div>

        <form onSubmit={handleBankSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="bankName"
            label="Nombre del Banco"
            type="text"
            required={true}
            value={bankData.bankName}
            onChange={handleBankInputChange}
          />

          <Input
            name="accountHolder"
            label="Nombre del Titular"
            type="text"
            required={true}
            value={bankData.accountHolder}
            onChange={handleBankInputChange}
          />

          <Input
            name="accountNumber"
            label="Número de Cuenta"
            type="text"
            required={true}
            value={bankData.accountNumber}
            onChange={handleBankInputChange}
          />

          <Input
            name="accountType"
            label="Tipo de Cuenta"
            type="text"
            required={true}
            value={bankData.accountType}
            onChange={handleBankInputChange}
          />

          <Input
            name="swiftCode"
            label="Código SWIFT/BIC"
            type="text"
            required={true}
            value={bankData.swiftCode}
            onChange={handleBankInputChange}
          />

          <Input
            name="iban"
            label="Código IBAN"
            type="text"
            required={true}
            value={bankData.iban}
            onChange={handleBankInputChange}
          />

          <div className="md:col-span-2 flex justify-end">
            <Button variant="filled" color="secondary">
              Guardar Información Bancaria
            </Button>
          </div>
        </form>
      </div>

      {/* Reimbursement Request Section */}
      {currentBalance > 0 && (
        <div className="card">
          <div className="card-title">
            <h3 className="text-lg font-bold text-text-primary">3. Solicitud de Reembolso</h3>
            <p className="text-sm text-text-secondary">
              Puede solicitar un reembolso hasta por el monto de su saldo disponible
            </p>
          </div>

          <form onSubmit={handleReimbursementSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="md:w-1/2">
                <Input
                  name="amount"
                  label="Monto a Solicitar (USD)"
                  type="number"
                  required={true}
                  value={reimbursementData.amount}
                  onChange={handleReimbursementInputChange}
                  max={currentBalance}
                  altText={`Máximo disponible: ${currentBalance.toFixed(2)}`}
                />
              </div>

              <div className="md:w-1/2">
                <SelectGroup
                  name="receipts"
                  label="Comprobantes Verificados"
                  items={verifiedReceipts.map(receipt => ({
                    id: receipt.id,
                    label: `${receipt.date} - ${receipt.description} - $${receipt.amount.toFixed(2)}`
                  }))}
                  selectedValues={selectedReceipts}
                  onChange={handleReceiptChange}
                  helpText="Seleccione uno o más comprobantes para asociar a su solicitud"
                />
              </div>

              <Textarea
                name="notes"
                label="Notas Adicionales"
                rows={3}
                value={reimbursementData.notes}
                onChange={handleReimbursementInputChange}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="filled" color="secondary">
                Solicitar Reembolso
              </Button>
            </div>
          </form>
        </div>
      )}

      {currentBalance <= 0 && (
        <div className="card">
          <div className="card-title">
            <h3 className="text-lg font-bold text-text-primary">3. Solicitud de Reembolso</h3>
            <p className="text-sm text-text-secondary">
              Actualmente no tiene saldo disponible para reembolso
            </p>
          </div>
        </div>
      )}

      {/* Reimbursement History Section */}
      <div className="card">
        <div className="card-title">
          <h3 className="text-lg font-bold text-text-primary">4. Historial de Reembolsos</h3>
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
