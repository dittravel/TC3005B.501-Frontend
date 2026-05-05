/**
 * Comprobaciones List Component
 * 
 * Displays a list of expense verification requests for applicants.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
import InfoCard from '@/components/Utils/InfoCard';
import LabeledValue from '@/components/Utils/LabeledValue';
import type { CardTag } from '@/types/card';

interface Props {
  data: any[];
  title?: string;
  subtitle?: string;
}

function getVerificationStats(request: any) {
  const verifications = Array.isArray(request.verifications) ? request.verifications : [];
  const total = verifications.length;
  const accepted = verifications.filter((v: any) => v.validation === 'Aprobado').length;
  const rejected = verifications.filter((v: any) => v.validation === 'Rechazado').length;
  const pending = verifications.filter((v: any) => v.validation === 'Pendiente').length;
  return { total, accepted, rejected, pending };
}

function getStatusTag(stats: any): CardTag {
  const { total, accepted, rejected, pending } = stats;
  const isPending = pending > 0 || total === 0;
  const isAccepted = accepted === total && total > 0;
  const isRejected = rejected === total && total > 0;
  
  return {
    text: isPending ? 'Pendiente' : isAccepted ? 'Aceptada' : isRejected ? 'Rechazada' : 'Mixta',
    type: isPending ? 'warning' : isAccepted ? 'success' : isRejected ? 'alert' : 'default'
  };
}

export default function ComprobacionesList({ data, title = "Comprobaciones", subtitle }: Props) {
  return (
    <section className="space-y-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <InfoCard
          value={data.filter((r: any) => {
            const stats = getVerificationStats(r);
            return stats.accepted === stats.total && stats.total > 0;
          }).length}
          type="success"
          title="Aceptadas"
        />
        <InfoCard
          value={data.filter((r: any) => {
            const stats = getVerificationStats(r);
            return stats.pending > 0 || stats.total === 0;
          }).length}
          type="alert"
          title="Pendientes"
        />
        <InfoCard
          value={data.filter((r: any) => {
            const stats = getVerificationStats(r);
            return stats.rejected === stats.total && stats.total > 0;
          }).length}
          type="warning"
          title="Rechazadas"
        />
        <InfoCard
          value={data.filter((r: any) => {
            const stats = getVerificationStats(r);
            return stats.accepted > 0 && stats.rejected > 0;
          }).length}
          type="info"
          title="Mixtas"
        />
      </div>
      <div className="flex flex-col justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title} ({data.length})</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {data.length > 0 ? (
        <div className="space-y-6">
          {data.map((request: any) => {
            const stats = getVerificationStats(request);
            const statusTag = getStatusTag(stats);
            const percent = (count: number) => stats.total ? (count / stats.total) * 100 : 0;

            return (
              <Card
                key={request.request_id}
                tag={{ text: `Solicitud #${request.request_id}`, type: 'secondary' }}
                status={statusTag}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-20">
                  {/* Request Info */}
                  <div className="flex fex-col md:flex-row items-center justify-between gap-8">
                    <LabeledValue
                      label="Destino"
                      value={request.destination_country}
                    />
                    <LabeledValue
                      label="Fechas"
                      value={`${request.beginning_date} - ${request.ending_date}`}
                    />
                    <LabeledValue
                      label="Responsable"
                      value={request.assigned_to_name || 'Sin asignar'}
                    />
                  </div>

                  {/* Buttons */}
                  <Button
                    color="secondary"
                    variant="filled"
                    href={`/comprobar-solicitud/${request.request_id}`}
                    className="w-full md:w-auto"
                  >
                    Ver Comprobantes
                  </Button>
                </div>

                {/* Verification Stats */}
                <div>
                  {stats.total === 0 ? (
                    <p className="text-sm text-text-secondary">No se han enviado comprobantes</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1 rounded-full flex">
                        <div className="bg-success-400 h-full" style={{ width: `${percent(stats.accepted)}%` }} />
                        <div className="bg-warning-400 h-full" style={{ width: `${percent(stats.rejected)}%` }} />
                        <div className="bg-alert-400 h-full" style={{ width: `${percent(stats.pending)}%` }} />
                      </div>
                      <p className="text-sm text-text-secondary whitespace-nowrap">{stats.accepted}/{stats.total} aceptadas</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            No tienes solicitudes en proceso de comprobación.
          </p>
        </Card>
      )}
    </section>
  );
}
