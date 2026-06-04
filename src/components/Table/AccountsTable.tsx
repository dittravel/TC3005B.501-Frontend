/**
* Accounting Accounts Table Component
* 
* Displays a table of accounting accounts with their details and actions.
*/

import DataTable from "./DataTable";
import Button from "@components/Buttons/Button";
import UltimateWrapper from '@components/Modals/UltimateWrapper';

interface Account {
  account_id: number;
  account_name: string;
  account_code: string;
  account_type: string;
  description?: string;
  CostCenter?: {
    cost_center_name: string;
  };
}

interface Props {
  data: any;
  token: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * Accounts Table Component
 * @param {data} data - Array of accounting accounts to display
 * @param {token} token - Authentication token for API requests
 * @param {canCreate} canCreate - Flag to show/hide create button
 * @param {canEdit} canEdit - Flag to show/hide edit buttons
 * @param {canDelete} canDelete - Flag to show/hide delete buttons
 * @returns {JSX.Element} The accounts table component
 */
export default function AccountsTable({
  data,
  token,
  canCreate = false,
  canEdit = false,
  canDelete = false
}: Props) {
  // Columns for the DataTable
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo de Cuenta' },
    { key: 'cost_center', label: 'Centro de Costos' },
    { key: 'actions', label: 'Acciones' },
  ];
  
  // Map data to rows for the DataTable
  const rows = data.map((account: Account) => ({
    id: account.account_id,
    code: account.account_code,
    name: account.account_name,
    type: account.account_type,
    cost_center: account.CostCenter?.cost_center_name || 'N/A',
    actions: (
      <div className="flex gap-2">
        {canEdit ? (
          <Button
            name="Editar"
            color="primary"
            href={`/cuentas-contables/${account.account_id}`}
            className="w-full"
          >
            Editar
          </Button>
        ) : null}
        {canDelete ? (
          <UltimateWrapper
            id={account.account_id}
            endpoint="/accounts"
            title="¿Estás seguro de que deseas eliminar esta cuenta contable?"
            message="Esta acción no se puede deshacer."
            modal_type="warning"
            color="warning"
            variant="filled"
            label="Eliminar"
            redirectTo="/cuentas-contables"
            successMessage="Cuenta contable eliminada exitosamente."
            errorMessage="Error al eliminar la cuenta contable."
            method="DELETE"
            token={token}
            className="w-full"
          />
        ) : null}
      </div>
    )
  }));
  
  return (
    <div>
      <div className="grid grid-cols-[1fr_200px] items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">
          Cuentas Contables {data.length > 0 && `(${data.length})`}
        </h2>
        {canCreate ? (
          <Button
            name="create-account"
            color="secondary"
            href="/cuentas-contables/nueva"
          >
            Crear Cuenta Contable
          </Button>
        ) : null}
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}