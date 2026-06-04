/**
 * RouteInputGroup Component
 * 
 * Renders a form group for inputting travel route details including origin/destination
 * countries and cities, start/end dates and times, and service requirements (plane/hotel).
 * Supports dynamic removal and handles input validation with date constraints.
 * 
 * Svg icons obtained from Heroicons (https://heroicons.com/)
 */

import React, { useState, useEffect } from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import Checkbox from '@/components/Utils/Checkbox';
import Icon from '@/components/Utils/Icon';
import type { TravelRoute } from '@/types/TravelRoute';
import Select from '@/components/Utils/Select';

interface Country { country_id: number; country_name: string; }
interface City    { city_id: number;    city_name: string; country_id: number; }

interface RouteInputGroupProps {
  route: TravelRoute;
  onChange: (index: number, name: string, value: any) => void;
  index: number;
  onRemove?: (index: number) => void;
  isRemovable: boolean;
  countries?: Country[];
  cities?: City[];
}

/**
 * RouteInputGroup Component
 * Displays a form group for a single travel route with various input fields.
 * Manages route state changes and provides optional removal functionality.
 * @param {RouteInputGroupProps} props - Component properties
 * @returns {JSX.Element} Rendered route input form group
 */
const RouteInputGroup: React.FC<RouteInputGroupProps> = ({ route, onChange, index, onRemove, isRemovable, countries, cities }) => {
  const [selectedOriginCountryId, setSelectedOriginCountryId] = useState<number | ''>('');
  const [selectedDestCountryId,   setSelectedDestCountryId]   = useState<number | ''>('');

  useEffect(() => {
    if (!countries || countries.length === 0) return;
    if (route.origin_country_name) {
      const c = countries.find(c => c.country_name === route.origin_country_name);
      if (c) setSelectedOriginCountryId(c.country_id);
    }
    if (route.destination_country_name) {
      const c = countries.find(c => c.country_name === route.destination_country_name);
      if (c) setSelectedDestCountryId(c.country_id);
    }
  }, [route.origin_country_name, route.destination_country_name, countries]);

  const originCities = (cities ?? []).filter(c => c.country_id === selectedOriginCountryId);
  const destCities   = (cities ?? []).filter(c => c.country_id === selectedDestCountryId);

  const handleCountryChange = (field: 'origin' | 'destination') => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value) || '';
    const selected  = (countries ?? []).find(c => c.country_id === countryId);
    if (field === 'origin') {
      setSelectedOriginCountryId(countryId as number);
      onChange(index, 'origin_country_name', selected?.country_name ?? '');
      onChange(index, 'origin_city_name', '');
    } else {
      setSelectedDestCountryId(countryId as number);
      onChange(index, 'destination_country_name', selected?.country_name ?? '');
      onChange(index, 'destination_city_name', '');
    }
  };

  const handleCityChange = (field: 'origin' | 'destination') => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = field === 'origin' ? 'origin_city_name' : 'destination_city_name';
    onChange(index, name, e.target.value);
  };

  /**
   * Handles input changes for all input fields in the route form.
   * Converts checkbox values to boolean and regular input values to string.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   * @returns {void}
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    onChange(index, name, type === 'checkbox' ? checked : value);
  };

  // Get today's date in ISO format for date input minimum constraint
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  return (
    <div className="routes-wrapper">
      <div className="route-title">
        <span>Ruta #{index + 1}</span>
        {isRemovable && onRemove && (
          <Button
            type="button"
            onClick={() => onRemove(index)}
            variant="filled"
            color="warning"
            size='small'
          >
            Eliminar Ruta
          </Button>
        )}
      </div>
      <div className="route-content">
        {/* Origin and destination section */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Icon name="location_on" />
            Origen y Destino
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Country */}
            <Select
              name="origin_country_name"
              label="País de Origen"
              value={selectedOriginCountryId}
              onChange={handleCountryChange('origin')}
              required
            >
              <option value="">Selecciona un país</option>
              {(countries ?? []).filter(c => c.country_name && c.country_name !== 'notSelected').map(c => (
                <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
              ))}
            </Select>

            {/* Origin City */}
            <Select
              name="origin_city_name"
              label="Ciudad de Origen"
              value={route.origin_city_name ?? ''}
              onChange={handleCityChange('origin')}
              disabled={originCities.length === 0}
              required
            >
              <option value="">Selecciona una ciudad</option>
              {originCities.filter(c => c.city_name && c.city_name !== 'notSelected').map(c => (
                <option key={c.city_id} value={c.city_name}>{c.city_name}</option>
              ))}
            </Select>

            {/* Destination Country */}
            <Select
              name="destination_country_name"
              label="País de Destino"
              value={selectedDestCountryId}
              onChange={handleCountryChange('destination')}
              required
            >
              <option value="">Selecciona un país</option>
              {(countries ?? []).filter(c => c.country_name && c.country_name !== 'notSelected').map(c => (
                <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
              ))}
            </Select>

            {/* Destination City */}
            <Select
              name="destination_city_name"
              label="Ciudad de Destino"
              value={route.destination_city_name ?? ''}
              onChange={handleCityChange('destination')}
              disabled={destCities.length === 0}
              required
            >
              <option value="">Selecciona una ciudad</option>
              {destCities.filter(c => c.city_name && c.city_name !== 'notSelected').map(c => (
                <option key={c.city_id} value={c.city_name}>{c.city_name}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Dates section */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Icon name="schedule" />
            Fechas y Horarios
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <Input
              name="beginning_date"
              label="Fecha de Inicio"
              type="date"
              value={route.beginning_date === "1900-01-01" ? '' : route.beginning_date}
              onChange={handleInputChange}
              min={todayISO}
              required
            />

            {/* Start Time */}
            <Input
              name="beginning_time"
              label="Hora de Inicio"
              type="time"
              value={route.beginning_time === "00:00:00" ? '' : route.beginning_time}
              onChange={handleInputChange}
              required
            />

            {/* End Date */}
            <Input
              name="ending_date"
              label="Fecha de Fin"
              type="date"
              value={route.ending_date === "1900-01-01" ? '' : route.ending_date}
              onChange={handleInputChange}
              min={route.beginning_date && route.beginning_date !== "1900-01-01" ? route.beginning_date : todayISO}
              required
            />

            {/* End Time */}
            <Input
              name="ending_time"
              label="Hora de Fin"
              type="time"
              value={route.ending_time === "00:00:00" ? '' : route.ending_time}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Additional services section */}
        <div>
          <h4 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Icon name="deployed_code" />
            Servicios Adicionales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              name="plane_needed"
              label="¿Requiere Avión?"
              checked={route.plane_needed}
              onChange={handleInputChange}
            />
            <Checkbox
              name="hotel_needed"
              label="¿Requiere Hotel?"
              checked={route.hotel_needed}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteInputGroup;