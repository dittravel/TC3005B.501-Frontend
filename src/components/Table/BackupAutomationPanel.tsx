import { useEffect, useState } from 'react';
import { apiRequest } from '@/utils/apiClient';
import Input from '@/components/Utils/Input';
import Select from '@/components/Utils/Select';

interface BackupConfig {
  enabled: boolean;
  schedule: string;
  mariadbRetentionDays: number;
  mongodbRetentionDays: number;
  updatedAt?: string;
  configFile?: string;
}

interface Props {
  token: string;
  role: string;
}

type SchedulePreset = 'every_x_hours' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface ScheduleUiState {
  preset: SchedulePreset;
  intervalHours: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
  dayOfMonth: number;
  customCron: string;
}

const WEEK_DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const INTERVAL_OPTIONS = [2, 3, 4, 6, 8, 12, 24];

const DEFAULT_SCHEDULE_UI: ScheduleUiState = {
  preset: 'every_x_hours',
  intervalHours: 6,
  hour: 3,
  minute: 0,
  dayOfWeek: 1,
  dayOfMonth: 1,
  customCron: '0 */6 * * *',
};

function normalizeHour(value: number) {
  return Math.min(23, Math.max(0, Number.isFinite(value) ? value : 0));
}

function normalizeMinute(value: number) {
  return Math.min(59, Math.max(0, Number.isFinite(value) ? value : 0));
}

function normalizeDayOfMonth(value: number) {
  return Math.min(28, Math.max(1, Number.isFinite(value) ? value : 1));
}

function buildCronFromUi(ui: ScheduleUiState) {
  const minute = normalizeMinute(ui.minute);
  const hour = normalizeHour(ui.hour);

  switch (ui.preset) {
    case 'every_x_hours':
      return `${minute} */${ui.intervalHours} * * *`;
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${ui.dayOfWeek}`;
    case 'monthly':
      return `${minute} ${hour} ${normalizeDayOfMonth(ui.dayOfMonth)} * *`;
    case 'custom':
      return ui.customCron.trim();
    default:
      return `${minute} */6 * * *`;
  }
}

function parseCronToUi(cronExpression: string): ScheduleUiState {
  const cron = String(cronExpression || '').trim();
  const parts = cron.split(/\s+/);
  if (parts.length !== 5) {
    return { ...DEFAULT_SCHEDULE_UI, preset: 'custom', customCron: cron || DEFAULT_SCHEDULE_UI.customCron };
  }

  const [m, h, dom, mon, dow] = parts;
  const minute = Number.parseInt(m, 10);

  const everyXHoursMatch = /^\*\/(\d{1,2})$/.exec(h);
  if (mon === '*' && dom === '*' && dow === '*' && everyXHoursMatch && !Number.isNaN(minute)) {
    const interval = Number.parseInt(everyXHoursMatch[1], 10);
    if (INTERVAL_OPTIONS.includes(interval)) {
      return {
        ...DEFAULT_SCHEDULE_UI,
        preset: 'every_x_hours',
        minute: normalizeMinute(minute),
        intervalHours: interval,
        customCron: cron,
      };
    }
  }

  const hour = Number.parseInt(h, 10);
  const dayOfWeek = Number.parseInt(dow, 10);
  const dayOfMonth = Number.parseInt(dom, 10);

  if (dom === '*' && mon === '*' && dow === '*' && !Number.isNaN(hour) && !Number.isNaN(minute)) {
    return {
      ...DEFAULT_SCHEDULE_UI,
      preset: 'daily',
      hour: normalizeHour(hour),
      minute: normalizeMinute(minute),
      customCron: cron,
    };
  }

  if (dom === '*' && mon === '*' && !Number.isNaN(dayOfWeek) && !Number.isNaN(hour) && !Number.isNaN(minute)) {
    return {
      ...DEFAULT_SCHEDULE_UI,
      preset: 'weekly',
      dayOfWeek: Math.min(6, Math.max(0, dayOfWeek)),
      hour: normalizeHour(hour),
      minute: normalizeMinute(minute),
      customCron: cron,
    };
  }

  if (mon === '*' && dow === '*' && !Number.isNaN(dayOfMonth) && !Number.isNaN(hour) && !Number.isNaN(minute)) {
    return {
      ...DEFAULT_SCHEDULE_UI,
      preset: 'monthly',
      dayOfMonth: normalizeDayOfMonth(dayOfMonth),
      hour: normalizeHour(hour),
      minute: normalizeMinute(minute),
      customCron: cron,
    };
  }

  return {
    ...DEFAULT_SCHEDULE_UI,
    preset: 'custom',
    customCron: cron || DEFAULT_SCHEDULE_UI.customCron,
  };
}

export default function BackupAutomationPanel({ token, role }: Readonly<Props>) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleUi, setScheduleUi] = useState<ScheduleUiState>(DEFAULT_SCHEDULE_UI);
  const [form, setForm] = useState<BackupConfig>({
    enabled: true,
    schedule: '0 */6 * * *',
    mariadbRetentionDays: 14,
    mongodbRetentionDays: 14,
  });

  useEffect(() => {
    if (role !== 'Superadministrador') {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest('/admin/backup-automation-config', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm({
          enabled: Boolean(response.enabled),
          schedule: response.schedule || '0 */6 * * *',
          mariadbRetentionDays: Number(response.mariadbRetentionDays || 14),
          mongodbRetentionDays: Number(response.mongodbRetentionDays || 14),
          updatedAt: response.updatedAt,
          configFile: response.configFile,
        });
        setScheduleUi(parseCronToUi(response.schedule || '0 */6 * * *'));
      } catch (requestError) {
        console.error('Error al cargar la configuración de respaldos:', requestError);
        setError('No fue posible cargar la configuración de respaldos.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token, role]);

  if (role !== 'Superadministrador') {
    return null;
  }

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const computedSchedule = buildCronFromUi(scheduleUi);
      if (!computedSchedule) {
        throw new Error('Define una frecuencia válida para los respaldos automáticos.');
      }

      const payload = {
        enabled: Boolean(form.enabled),
        schedule: computedSchedule,
        mariadbRetentionDays: Number(form.mariadbRetentionDays),
        mongodbRetentionDays: Number(form.mongodbRetentionDays),
      };

      const response = await apiRequest('/admin/backup-automation-config', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      const config = response?.config ?? payload;
      setForm((prev) => ({
        ...prev,
        enabled: Boolean(config.enabled),
        schedule: config.schedule,
        mariadbRetentionDays: Number(config.mariadbRetentionDays),
        mongodbRetentionDays: Number(config.mongodbRetentionDays),
        updatedAt: config.updatedAt,
        configFile: config.configFile,
      }));
      setScheduleUi(parseCronToUi(config.schedule));
      const cronNotice = response?.cronApplied === false
        ? ' La configuración se guardó, pero la tarea cron no se pudo aplicar automáticamente en este entorno.'
        : '';
      setSuccess(`Configuración de automatización de respaldos actualizada.${cronNotice}`);
    } catch (requestError: any) {
      setError(requestError?.message || 'No fue posible actualizar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-white p-4">
      <h2 className="text-lg font-semibold text-text-primary">Automatización de respaldos</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Esta configuración actualiza el archivo de respaldo y la tarea cron del servidor donde corre el backend.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-text-secondary">Cargando configuración...</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
              />
              <span>Activar respaldos automáticos</span>
            </label>

            <div className="md:col-span-2">
              <Select
                name="backup-schedule-preset"
                label="Frecuencia"
                value={scheduleUi.preset}
                onChange={(event) =>
                  setScheduleUi((prev) => ({
                    ...prev,
                    preset: event.target.value as SchedulePreset,
                  }))
                }
                disabled={!form.enabled || saving}
              >
                <option value="every_x_hours">Cada N horas</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="custom">Avanzado (cron)</option>
              </Select>
            </div>

            {scheduleUi.preset === 'every_x_hours' ? (
              <>
                <Select
                  name="backup-interval-hours"
                  label="Intervalo"
                  value={String(scheduleUi.intervalHours)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      intervalHours: Number.parseInt(event.target.value, 10) || 6,
                    }))
                  }
                  disabled={!form.enabled || saving}
                >
                  {INTERVAL_OPTIONS.map((hours) => (
                    <option key={hours} value={hours}>
                      {`Cada ${hours} horas`}
                    </option>
                  ))}
                </Select>

                <Input
                  name="backup-minute-interval"
                  type="number"
                  label="Minuto de ejecución"
                  min={0}
                  max={59}
                  value={String(scheduleUi.minute)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      minute: normalizeMinute(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />
              </>
            ) : null}

            {scheduleUi.preset === 'daily' ? (
              <>
                <Input
                  name="backup-daily-hour"
                  type="number"
                  label="Hora (0-23)"
                  min={0}
                  max={23}
                  value={String(scheduleUi.hour)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      hour: normalizeHour(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />

                <Input
                  name="backup-daily-minute"
                  type="number"
                  label="Minuto (0-59)"
                  min={0}
                  max={59}
                  value={String(scheduleUi.minute)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      minute: normalizeMinute(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />
              </>
            ) : null}

            {scheduleUi.preset === 'weekly' ? (
              <>
                <Select
                  name="backup-weekly-day"
                  label="Día de la semana"
                  value={String(scheduleUi.dayOfWeek)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      dayOfWeek: Number.parseInt(event.target.value, 10) || 0,
                    }))
                  }
                  disabled={!form.enabled || saving}
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </Select>

                <Input
                  name="backup-weekly-hour"
                  type="number"
                  label="Hora (0-23)"
                  min={0}
                  max={23}
                  value={String(scheduleUi.hour)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      hour: normalizeHour(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />

                <Input
                  name="backup-weekly-minute"
                  type="number"
                  label="Minuto (0-59)"
                  min={0}
                  max={59}
                  value={String(scheduleUi.minute)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      minute: normalizeMinute(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />
              </>
            ) : null}

            {scheduleUi.preset === 'monthly' ? (
              <>
                <Input
                  name="backup-monthly-day"
                  type="number"
                  label="Día del mes (1-28)"
                  min={1}
                  max={28}
                  value={String(scheduleUi.dayOfMonth)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      dayOfMonth: normalizeDayOfMonth(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />

                <Input
                  name="backup-monthly-hour"
                  type="number"
                  label="Hora (0-23)"
                  min={0}
                  max={23}
                  value={String(scheduleUi.hour)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      hour: normalizeHour(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />

                <Input
                  name="backup-monthly-minute"
                  type="number"
                  label="Minuto (0-59)"
                  min={0}
                  max={59}
                  value={String(scheduleUi.minute)}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      minute: normalizeMinute(Number.parseInt(event.target.value, 10)),
                    }))
                  }
                  disabled={!form.enabled || saving}
                />
              </>
            ) : null}

            {scheduleUi.preset === 'custom' ? (
              <div className="md:col-span-2">
                <Input
                  name="backup-cron-custom"
                  type="text"
                  label="Cron avanzado"
                  value={scheduleUi.customCron}
                  onChange={(event) =>
                    setScheduleUi((prev) => ({
                      ...prev,
                      customCron: event.target.value,
                    }))
                  }
                  placeholder="0 */6 * * *"
                  disabled={!form.enabled || saving}
                />
                <p className="text-xs text-text-secondary">
                  Usa este modo solo si necesitas una expresión cron específica.
                </p>
              </div>
            ) : null}

            <div className="md:col-span-2 rounded border border-border bg-card p-3 text-sm text-text-secondary">
              Cron que se aplicará: <span className="font-mono text-text-primary">{buildCronFromUi(scheduleUi)}</span>
            </div>

            <Input
              name="mariadb-retention-days"
              type="number"
              label="Retención MariaDB (días)"
              min={1}
              max={3650}
              value={String(form.mariadbRetentionDays)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, mariadbRetentionDays: Number(event.target.value || 14) }))
              }
              disabled={saving}
            />

            <Input
              name="mongodb-retention-days"
              type="number"
              label="Retención MongoDB (días)"
              min={1}
              max={3650}
              value={String(form.mongodbRetentionDays)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, mongodbRetentionDays: Number(event.target.value || 14) }))
              }
              disabled={saving}
            />
          </div>

          {form.updatedAt ? (
            <p className="mt-3 text-xs text-text-secondary">
              Última actualización: {new Date(form.updatedAt).toLocaleString('es-MX')}
            </p>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-green-700">{success}</p> : null}

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </>
      )}
    </section>
  );
}
