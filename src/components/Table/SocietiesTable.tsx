/**
* Societies Table Component
* 
* Displays a table of societies with their details and actions.
*/

import DataTable from "./DataTable";
import Button from "@components/Buttons/Button";
import UltimateWrapper from '@components/Modals/UltimateWrapper';

interface Society {
  id: number;
  description: string;
  SocietyGroup: {
    description: string;
  };
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
    { key: 'society_group', label: 'Grupo de Sociedad' },
    { key: 'actions', label: 'Acciones' },
  ];
  
  const rows = data.map((group: Society) => ({
    id: group.id,
    description: group.description,
    society_group: group.SocietyGroup.description,
    actions: (
      <div className="flex gap-2">
        {canEdit ? (
          <Button
            name="Editar"
            color="primary"
            href={`/sociedades/${group.id}`}
            className="w-full"
          >
            Editar
          </Button>
        ) : null}
        {canDelete ? (
          <UltimateWrapper
            id={group.id}
            endpoint="/societies"
            title="¿Estás seguro de que deseas eliminar esta sociedad?"
            message="Esta acción no se puede deshacer."
            modal_type="warning"
            color="warning"
            variant="filled"
            label="Eliminar"
            redirectTo="/sociedades"
            successMessage="Sociedad eliminada exitosamente."
            errorMessage="Error al eliminar la sociedad."
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
      <div className="grid grid-cols-[1fr_150px] items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">
          Sociedades {data.length > 0 && `(${data.length})`}
        </h2>
        {canCreate ? (
          <Button
            name="Crear Sociedad"
            color="secondary"
            href="/sociedades/nueva"
          >
            Crear Sociedad
          </Button>
        ) : null}
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}