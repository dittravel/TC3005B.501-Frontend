/**
 * SocietyGroupEditPanel
 *
 * Combines group editing with society transfer controls.
 */

import { useMemo, useState } from 'react';
import SocietyGroupForm from '@components/Forms/SocietyGroupForm';
import DataTable from '@components/Table/DataTable';
import Button from '@components/Buttons/Button';
import Select from '@components/Utils/Select';
import Toast from '@components/Utils/Toast';
import { apiRequest } from '@/utils/apiClient';

type Society = {
  id: number;
  description: string;
  local_currency?: string | null;
  society_group_id?: number;
};

type SocietyGroup = {
  id: number;
  description: string;
};

type Props = {
  token: string;
  groupId: number;
  groupData: {
    id: number;
    description: string;
    Society?: Society[];
  };
  groups: SocietyGroup[];
  redirectTo: string;
};

export default function SocietyGroupEditPanel({ token, groupId, groupData, groups, redirectTo }: Readonly<Props>) {
  const [societies, setSocieties] = useState<Society[]>(Array.isArray(groupData?.Society) ? groupData.Society : []);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('');
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const availableGroups = useMemo(
    () => (Array.isArray(groups) ? groups.filter((group) => Number(group.id) !== Number(groupId)) : []),
    [groups, groupId]
  );

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'description', label: 'Sociedad' },
    { key: 'local_currency', label: 'Moneda local' },
  ];

  const rows = societies.map((society) => ({
    id: society.id,
    description: society.description,
    local_currency: society.local_currency || 'N/A',
  }));

  async function handleTransfer() {
    if (!selectedSocietyId) {
      setToast({ message: 'Selecciona una sociedad para transferir', type: 'error' });
      return;
    }

    if (!targetGroupId) {
      setToast({ message: 'Selecciona un grupo destino', type: 'error' });
      return;
    }

    setIsTransferring(true);
    setToast(null);

    try {
      const societyId = Number(selectedSocietyId);
      const destinationGroupId = Number(targetGroupId);

      await apiRequest(`/society-groups/${groupId}/societies/${societyId}/transfer`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          target_group_id: destinationGroupId,
        },
      });

      const movedSociety = societies.find((society) => society.id === societyId);
      setSocieties((previous) => previous.filter((society) => society.id !== societyId));
      setSelectedSocietyId('');
      setTargetGroupId('');

      const destinationLabel = availableGroups.find((group) => Number(group.id) === destinationGroupId)?.description || 'grupo destino';
      const societyLabel = movedSociety?.description || 'La sociedad';
      setToast({ message: `${societyLabel} se transfirio a ${destinationLabel}`, type: 'success' });
    } catch (error: any) {
      const backendMessage = error?.response?.error || error?.message || 'No se pudo transferir la sociedad';
      setToast({ message: String(backendMessage), type: 'error' });
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <div className="space-y-8">
      <SocietyGroupForm
        mode="edit"
        data={groupData}
        token={token}
        redirectTo={redirectTo}
      />

      <section className="card">
        <div className="card-header">
          <h2 className="card-title font-semibold text-text-primary">Sociedades del grupo</h2>
          <p className="text-sm text-text-secondary">Listado de sociedades asignadas actualmente a este grupo.</p>
        </div>
        <DataTable columns={columns} rows={rows} />
      </section>

      <section className="card">
        <div className="card-header">
          <h3 className="card-title font-semibold text-text-primary">Transferir sociedad a otro grupo</h3>
          <p className="text-sm text-text-secondary">Selecciona una sociedad del grupo actual y su nuevo grupo destino.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Sociedad"
            name="selected_society"
            value={selectedSocietyId}
            onChange={(event) => setSelectedSocietyId(event.target.value)}
            required
          >
            <option value="">Selecciona una sociedad</option>
            {societies.map((society) => (
              <option key={society.id} value={String(society.id)}>
                {society.description}
              </option>
            ))}
          </Select>
          <Select
            label="Grupo destino"
            name="target_group"
            value={targetGroupId}
            onChange={(event) => setTargetGroupId(event.target.value)}
            required
          >
            <option value="">Selecciona un grupo</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={String(group.id)}>
                {group.description}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            color="secondary"
            onClick={handleTransfer}
            disabled={isTransferring || societies.length === 0 || availableGroups.length === 0}
          >
            {isTransferring ? 'Transfiriendo...' : 'Transferir sociedad'}
          </Button>
        </div>
      </section>

      {toast ? (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} />
        </div>
      ) : null}
    </div>
  );
}
