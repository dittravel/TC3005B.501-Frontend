/**
 * RolesList Component
 *
 * Displays a list of system roles with edit and delete actions.
 * It is accessible only to administrator users.
 */

import { useState } from "react";
import Pagination from "@/components/Table/Pagination";
import Card from "@/components/Utils/Card";
import Button from "@/components/Buttons/Button";
import CancelRoleModal from "@/components/Modals/CancelRoleModel";
import { abbreviatePermissions } from "@/utils/permissionFormatter";


interface Props {
  data: any[];
  token: string;
  itemsPerPage?: number;
  canCreateRole?: boolean;
  canEditRole?: boolean;
  canDeleteRole?: boolean;
}

export default function RolesList(props: Readonly<Props>) {
  const {
    data,
    token,
    itemsPerPage = 5,
    canCreateRole = false,
    canEditRole = false,
    canDeleteRole = false,
  } = props;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageRoles = data.slice(start, end);

  return (
    <div className="space-y-6">

      {/* Header with count and Create button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Roles del sistema ({data.length})
        </h2>
        {canCreateRole ? (
          <Button
            variant="filled"
            color="secondary"
            href="/crear-rol"
          >
            + Crear Rol
          </Button>
        ) : null}
      </div>

      {data.length > 0 ? (
        <div className="space-y-6">
          {pageRoles.map((rol: any, index: number) => (
            <Card
              key={rol.id}
              tag={{ text: `#${index + 1 + start}`, type: 'secondary' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr_auto] gap-8">

                {/* Role name */}
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                  {rol.name}
                </h2>

                {/* Permissions summary by module */}
                <div className="flex flex-col justify-center text-sm text-text-primary space-y-1">
                  <p className="font-mono">
                    {abbreviatePermissions(rol.permissions || [])}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row items-center justify-end gap-2">
                  {canEditRole ? (
                    <Button
                      variant="filled"
                      color="primary"
                      href={`/editar-rol/${rol.role_id}`}
                    >
                      Editar
                    </Button>
                  ) : null}
                  {canDeleteRole ? (
                    <CancelRoleModal
                      title="Eliminar Rol"
                      message="¿Estás seguro de que deseas eliminar este rol?"
                      token={token}
                      role_id={rol.role_id}
                    />
                  ) : null}
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
            No existen roles configurados en el sistema
          </p>
        </Card>
      )}
    </div>
  );
}