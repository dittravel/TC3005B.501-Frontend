/**
 * RouteInputGroup component for managing travel route input fields.
 */

import React from 'react';
import Button from './Button';
import type { TravelRoute } from '@/types/TravelRoute';

interface RouteInputGroupProps {
  route: TravelRoute;
  onChange: (index: number, name: string, value: any) => void;
  index: number;
  onRemove?: (index: number) => void;
  isRemovable: boolean;
}

const baseInputClass = "w-full border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-card border-border";

const RouteInputGroup: React.FC<RouteInputGroupProps> = ({ route, onChange, index, onRemove, isRemovable }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    onChange(index, name, type === 'checkbox' ? checked : value);
  };

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  return (
    <div className="border-b-4 border-dashed border-card py-8 px-4 rounded-lg bg-secondary/10">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-text-primary">Ruta #{index + 1}</h4>
        {isRemovable && onRemove && (
          <Button
            type="button"
            onClick={() => onRemove(index)}
            color="warning"
            variant="empty"
            size="small"
          >
            Eliminar Ruta
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">País de Origen<span className="text-warning-500"> *</span></label>
          <input name="origin_country_name" placeholder="País Origen" className={baseInputClass} value={route.origin_country_name === "notSelected" ? '' : route.origin_country_name} onChange={handleInputChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Ciudad de Origen<span className="text-warning-500"> *</span></label>
          <input name="origin_city_name" placeholder="Ciudad Origen" className={baseInputClass} value={route.origin_city_name === "notSelected" ? '' : route.origin_city_name} onChange={handleInputChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">País de Destino<span className="text-warning-500"> *</span></label>
          <input name="destination_country_name" placeholder="País Destino" className={baseInputClass} value={route.destination_country_name === "notSelected" ? '' : route.destination_country_name} onChange={handleInputChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Ciudad de Destino<span className="text-warning-500"> *</span></label>
          <input name="destination_city_name" placeholder="Ciudad Destino" className={baseInputClass} value={route.destination_city_name === "notSelected" ? '' : route.destination_city_name} onChange={handleInputChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de Inicio (MM/DD/YYYY)<span className="text-warning-500"> *</span></label>
          <input
            name="beginning_date"
            type="date"
            min={todayISO}
            className={baseInputClass}
            value={route.beginning_date === "1900-01-01" ? '' : route.beginning_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Hora de Inicio (HH:MM AM/PM)<span className="text-warning-500"> *</span></label>
          <input name="beginning_time" type="time" className={baseInputClass} value={route.beginning_time === "00:00:00" ? '' : route.beginning_time} onChange={handleInputChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de Fin (MM/DD/YYYY)<span className="text-warning-500"> *</span></label>
          <input
            name="ending_date"
            type="date"
            min={route.beginning_date && route.beginning_date !== "1900-01-01" ? route.beginning_date : todayISO}
            className={baseInputClass}
            value={route.ending_date === "1900-01-01" ? '' : route.ending_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Hora de Fin (HH:MM AM/PM)<span className="text-warning-500"> *</span></label>
          <input name="ending_time" type="time" className={baseInputClass} value={route.ending_time === "00:00:00" ? '' : route.ending_time} onChange={handleInputChange} required />
        </div>
        <label className="text-text-secondary flex items-center gap-2 my-2">
          <input type="checkbox" name="plane_needed" checked={route.plane_needed} onChange={handleInputChange} />
          ¿Requiere Avión?
        </label>
        <label className="text-text-secondary flex items-center gap-2 my-2">
          <input type="checkbox" name="hotel_needed" checked={route.hotel_needed} onChange={handleInputChange} />
          ¿Requiere Hotel?
        </label>
      </div>
    </div>
  );
};

export default RouteInputGroup;