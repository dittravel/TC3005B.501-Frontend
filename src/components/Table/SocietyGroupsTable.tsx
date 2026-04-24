/**
* Society Groups Table Component
* 
* Displays a table of society groups with their details and actions.
*/

import DataTable from "./DataTable";
import Button from "@components/Buttons/Button";
import UltimateWrapper from '@components/Modals/UltimateWrapper';

interface SocietyGroup {
  id: number;
  description: string;
  is_default?: boolean;
}

interface Props {
  data: any;
  token: string;
  role: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function SocietyGroupsTable({ data, token, role, canCreate = false, canEdit = false, canDelete = false }: Props) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'description', label: 'Descripción' },
    { key: 'actions', label: 'Acciones' },
  ];
  
  const rows = data.map((group: SocietyGroup) => ({
    id: group.id,
    description: group.description,
    actions: (
      <div className="flex gap-2">
        {canEdit ? (
          <Button
            name="Editar"
            color="primary"
            href={`/grupos-sociedades/${group.id}`}
            className="w-full"
          >
            Editar
          </Button>
        ) : null}
        {!group.is_default && canDelete ? (
          <UltimateWrapper
            user_id={group.id}
            endpoint="/society-groups"
            title="¿Estás seguro de que deseas eliminar este grupo de sociedad?"
            message="Esta acción no se puede deshacer."
            modal_type="warning"
            color="warning"
            variant="filled"
            label="Eliminar"
            redirectTo="/sociedades"
            successMessage="Grupo de sociedad eliminado exitosamente."
            errorMessage="Error al eliminar el grupo de sociedad."
            token={token}
            method="DELETE"
          />
        ) : null}
      </div>
    )
  }));
  
  return (
    <div>
      <div className="grid grid-cols-[1fr_150px] items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">
          Grupos de sociedades {data.length > 0 && `(${data.length})`}
        </h2>
        {canCreate ? (
          <Button
            name="Crear Grupo"
            color="secondary"
            href="/grupos-sociedades/nuevo"
          >
            Crear Grupo
          </Button>
        ) : null}
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}