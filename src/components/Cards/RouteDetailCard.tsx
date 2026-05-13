/**
 * Route Detail Card Component
 *
 * Displays detailed information about a specific route within a travel request
 */

import { useState } from 'react';
import LabeledValue from '@/components/Utils/LabeledValue';
import Icon from '@/components/Utils/Icon';

interface RouteDetailCardProps {
  route: any;
  index: number;
}

/**
 * Route Detail Card Component
 * @param {object} route - The route data containing origin, destination, dates, times, and additional services
 * @param {number} index - The index of the route in the list of routes (used for display purposes)
 * @returns {JSX.Element} A card component displaying detailed information about the route
 */
export default function RouteDetailCard({ route, index }: RouteDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="routes-wrapper">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center bg-secondary text-white px-4 py-2 cursor-pointer hover:opacity-80"
          aria-label={isExpanded ? "Contraer" : "Expandir"}
        >
          <span>Ruta #{index + 1}</span>
          <Icon name={isExpanded ? "expand_less" : "expand_more"} />
        </button>

        {isExpanded && (
          <div className="route-content space-y-4">
            {/* Origin and Destination */}
            <div>
              <h5 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Icon name="location_on" className="text-base" />
                Origen y Destino
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledValue
                  label="Origen"
                  value={`${route.origin_city}, ${route.origin_country}`}
                />
                <LabeledValue
                  label="Destino"
                  value={`${route.destination_city}, ${route.destination_country}`}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="divider"></div>

            {/* Dates and Times */}
            <div>
              <h5 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Icon name="schedule" className="text-base" />
                Fechas y Horarios
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <LabeledValue
                    label="Fecha de Salida"
                    value={route.beginning_date}
                  />
                  <LabeledValue
                    label="Fecha de Regreso"
                    value={route.ending_date}
                  />
                </div>
                <div className="space-y-3">
                  <LabeledValue
                    label="Hora de Salida"
                    value={route.beginning_time}
                  />
                  <LabeledValue
                    label="Hora de Regreso"
                    value={route.ending_time}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider my-3"></div>

            {/* Additional Services */}
            <div>
              <h5 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Icon name="deployed_code" />
                Servicios Adicionales
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledValue
                  label="¿Requiere Avión?"
                  value={route.plane_needed ? 'Sí' : 'No'}
                />
                <LabeledValue
                  label="¿Requiere Hotel?"
                  value={route.hotel_needed ? 'Sí' : 'No'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
