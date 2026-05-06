/**
 * MasterAdminsPanel
 *
 * Lists and creates superadmin users.
 */

import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import Toast from '@/components/Utils/Toast';
import DataTable from '@/components/Table/DataTable';
import { apiRequest } from '@/utils/apiClient';

type MasterAdminRow = {
  user_id: number;
  user_name: string;
  workstation?: string | null;
  society_id?: number | null;
};

type Props = {
  token: string;
  initialAdmins?: MasterAdminRow[];
};



export default function MasterAdminsPanel({ token, initialAdmins = [] }: Readonly<Props>) {
  const [admins, setAdmins] = useState<MasterAdminRow[]>(initialAdmins);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    email: '',
    workstation: '',
    phone_number: '',
  });

  const rows = admins.map((admin) => ({
    id: admin.user_id,
    user_name: admin.user_name,
    workstation: admin.workstation || 'N/A',
    society_id: admin.society_id || 'N/A',
  }));

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Usuario' },
    { key: 'workstation', label: 'Estación' },
    { key: 'society_id', label: 'Sociedad' },
  ];

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.user_name.trim() || !formData.password.trim() || !formData.email.trim()) {
      setToast({ message: 'Usuario, contraseña y correo son obligatorios', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      await apiRequest('/admin/master-admins', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        data: formData,
      });

      const refreshed = await apiRequest('/admin/master-admins', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins(Array.isArray(refreshed) ? refreshed : []);
      setFormData({ user_name: '', password: '', email: '', workstation: '', phone_number: '' });
      setToast({ message: 'Administrador maestro creado correctamente', type: 'success' });
    } catch (error: any) {
      const backendMessage = error?.response?.error || error?.message || 'No se pudo crear el administrador maestro';
      setToast({ message: String(backendMessage), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Administradores maestros ({admins.length})</h2>
        <DataTable columns={columns} rows={rows} />
      </section>

      <section className="card">
        <div className="card-header">
          <h3 className="card-title font-semibold text-text-primary">Crear administrador maestro</h3>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreate}>
          <Input name="user_name" label="Usuario" type="text" value={formData.user_name} onChange={onInputChange} required />
          <Input name="password" label="Contraseña" type="password" value={formData.password} onChange={onInputChange} required />
          <Input name="email" label="Correo" type="email" value={formData.email} onChange={onInputChange} required />
          <Input name="phone_number" label="Teléfono" type="text" value={formData.phone_number} onChange={onInputChange} />
          <Input name="workstation" label="Estación" type="text" value={formData.workstation} onChange={onInputChange} />
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" color="secondary" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear administrador maestro'}
            </Button>
          </div>
        </form>
      </section>

      {toast ? (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} />
        </div>
      ) : null}
    </div>
  );
}
