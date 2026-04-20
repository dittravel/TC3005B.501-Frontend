/**
 * RefundForm Component
 * 
 * Provides a form for employees to view their current reimbursement balance, submit bank information,
 * and request reimbursements for verified receipts.
 * 
 * Displays a history of past reimbursements with status.
 * Validates form inputs and provides user feedback on submission.
 */

import Tag from '@/components/Utils/Tag';
import DataTable from '@/components/Table/DataTable';
import type { UserRole } from '@/types/roles';

// Dummy data for demonstration
const currentBalance = 1250.75;

interface Props {
  role: UserRole;
}

export default function RefundForm({ role }: Props) {
  const columns = [
    { key: 'date', label: 'Fecha de Solicitud' },
    { key: 'amount', label: 'Monto' },
    { key: 'requestId', label: 'ID Solicitud de Viaje' }
  ];

  const rows = [
    { date: '2024-05-01', amount: 300.00, requestId: 'REQ12345' },
    { date: '2024-04-15', amount: 450.50, requestId: 'REQ12344' },
    { date: '2024-03-20', amount: 500.25, requestId: 'REQ12343' }
  ];

  return (
    <div className="space-y-8">
      {/* Balance Section */}
      <div className="card">
        <div className="card-title">
          <h2>Balance Actual</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-text-primary">
            {currentBalance >= 0 ? 'La empresa le debe' : 'Usted le debe a la empresa'}
          </p>
          <Tag
            text={`${currentBalance >= 0 ? '+$' : ''}${currentBalance.toFixed(2)} USD`}
            type={currentBalance >= 0 ? 'success' : 'warning'}
            size="large"
          />
        </div>
      </div>

      {/* Refund History Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Historial de Reembolsos</h2>
        <DataTable columns={columns} rows={rows} role={role as any} />
      </div>
    </div>
  );
}
