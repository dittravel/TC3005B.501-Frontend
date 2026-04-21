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
import { formatDate } from '@/utils/dateFormatter';

interface Refund {
  refund_id: number;
  request_id: number;
  refund_amount: number;
  refund_type: "Reembolso" | "Deducción";
  created_at: string;
}

interface Props {
  role: UserRole;
  refunds: Refund[];
  wallet: number;
  currency?: string;
}

/**
 * Refund Form Component
 * Displays the user's current balance and past reimbursements.
 * @param {UserRole} role - The role of the user
 * @param {Refund[]} refunds - Array of refund objects to display in the history
 * @param {number} wallet - The current balance of the user (positive if company owes user, negative if user owes company)
 * @param {string} currency - The currency symbol to display with the balance
 * @returns {JSX.Element} A component that shows the user's reimbursement balance and history
 */
export default function RefundForm({ role, refunds, wallet, currency }: Props) {

  const columns = [
    { key: 'date', label: 'Fecha de Solicitud' },
    { key: 'amount', label: 'Monto' },
    { key: 'type', label: 'Tipo' },
    { key: 'requestId', label: 'ID Solicitud' }
  ];

  const rows = refunds.map((refund) => ({
    date: formatDate(refund.created_at),
    amount: `$${refund.refund_amount.toFixed(2)}`,
    type: refund.refund_type,
    requestId: `#${refund.request_id}`
  }));

  return (
    <div className="space-y-8">
      {/* Balance Section */}
      <div className="card">
        <div className="card-title">
          <h2>Balance Actual</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-text-primary">
            {wallet >= 0 ? 'La empresa le debe' : 'Usted le debe a la empresa'}
          </p>
          <Tag
            text={`$ ${wallet.toFixed(2)}${currency ? ` ${currency}` : ''}`}
            type={wallet >= 0 ? 'success' : 'warning'}
            size="large"
          />
        </div>
      </div>

      {/* Refund History Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Historial de Reembolsos</h2>
        {refunds.length > 0 ? (
          <DataTable columns={columns} rows={rows} role={role as any} />
        ) : (
          <p className="text-text-secondary">No hay reembolsos registrados</p>
        )}
      </div>
    </div>
  );
}
