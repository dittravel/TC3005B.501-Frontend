/**
 * Comprobaciones List Component
 * 
 * Displays a list of expense verification requests for applicants.
 */

import Card from '@/components/Utils/Card';
import Button from '@/components/Buttons/Button';
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

// Calculate remaining days to validate a receipt
function getRemainingDays(request: any) {
  const totalDays = request.days_to_validate;

  if (!totalDays || !request.beginning_date) return 'Sin asignar';

  const start = new Date(request.beginning_date);
  const today = new Date();

  // Calculate the difference in days
  const diffTime = today.getTime() - start.getTime();

  // Convert milliseconds to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const remaining = totalDays - diffDays;

  return remaining > 0 ? remaining : 0;
}

export default function ComprobacionesList({ data, title = "Comprobaciones", subtitle }: Props) {
  return (
    <section className="space-y-6 w-full">
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
                href={`/comprobar-solicitud/${request.request_id}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="space-y-3">
                    <div className="text-sm text-text-primary space-y-1">
                      <p>
                        <span className="font-semibold">Lugar:</span> {request.destination_country}
                      </p>
                      <p>
                        <span className="font-semibold">Fechas:</span> {request.beginning_date} - {request.ending_date}
                      </p>
                      <p>
                        <span className="font-semibold">Responsable:</span> {request.assigned_to_name || 'Sin asignar'}
                      </p>
                      <p>
                        <span className="font-semibold">Días restantes para validar:</span> {getRemainingDays(request)}
                      </p>
                    </div>

                    {stats.total === 0 ? (
                      <p className="text-sm text-text-secondary">No se han enviado comprobantes</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-text-secondary">{stats.accepted}/{stats.total} Aceptadas</p>
                        </div>
                        <div className="w-full h-2 bg-card rounded-full overflow-hidden flex">
                          <div className="bg-success-300 h-full" style={{ width: `${percent(stats.accepted)}%` }} />
                          <div className="bg-warning-300 h-full" style={{ width: `${percent(stats.rejected)}%` }} />
                          <div className="bg-alert-400 h-full" style={{ width: `${percent(stats.pending)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary font-semibold">
            No tienes comprobantes pendientes
          </p>
        </Card>
      )}
    </section>
  );
}
