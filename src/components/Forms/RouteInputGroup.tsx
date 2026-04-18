/**
 * RouteInputGroup Component
 * 
 * Renders a form group for inputting travel route details including origin/destination
 * countries and cities, start/end dates and times, and service requirements (plane/hotel).
 * Supports dynamic removal and handles input validation with date constraints.
 * 
 * Svg icons obtained from Heroicons (https://heroicons.com/)
 */

import React, {useState} from 'react';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Utils/Input';
import Checkbox from '@/components/Utils/Checkbox';
import FlightSearchForm from '@/components/Forms/FlightSearchForm';
import HotelSearchForm from '@/components/Forms/HotelSearchForm';
import type { TravelRoute } from '@/types/TravelRoute';

interface RouteInputGroupProps {
  route: TravelRoute;
  onChange: (index: number, name: string, value: any) => void;
  index: number;
  onRemove?: (index: number) => void;
  isRemovable: boolean;
}

/**
 * RouteInputGroup Component
 * Displays a form group for a single travel route with various input fields.
 * Manages route state changes and provides optional removal functionality.
 * @param {RouteInputGroupProps} props - Component properties
 * @returns {JSX.Element} Rendered route input form group
 */
const RouteInputGroup: React.FC<RouteInputGroupProps> = ({ route, onChange, index, onRemove, isRemovable }) => {
  const [flightSearchOpen, setFlightSearchOpen] = useState(false);
  const [hotelSearchOpen, setHotelSearchOpen] = useState(false);
  
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

    // Opens or closes the flight and hotel searches based on the checkbox and its state
    if (type === 'checkbox') {
      if (name === 'plane_needed') {
        setFlightSearchOpen(checked);
      } else if (name === 'hotel_needed') {
        setHotelSearchOpen(checked);
      }
    }
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Origen y Destino
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Country */}
            <Input
              name="origin_country_name"
              label="País de Origen"
              placeholder="País Origen"
              type="text"
              value={route.origin_country_name === "notSelected" ? '' : route.origin_country_name}
              onChange={handleInputChange}
              required
            />

            {/* Origin City */}
            <Input
              name="origin_city_name"
              label="Ciudad de Origen"
              placeholder="Ciudad Origen"
              type="text"
              value={route.origin_city_name === "notSelected" ? '' : route.origin_city_name}
              onChange={handleInputChange}
              required
            />

            {/* Destination Country */}
            <Input
              name="destination_country_name"
              label="País de Destino"
              placeholder="País Destino"
              type="text"
              value={route.destination_country_name === "notSelected" ? '' : route.destination_country_name}
              onChange={handleInputChange}
              required
            />

            {/* Destination City */}
            <Input
              name="destination_city_name"
              label="Ciudad de Destino"
              placeholder="Ciudad Destino"
              type="text"
              value={route.destination_city_name === "notSelected" ? '' : route.destination_city_name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Dates section */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
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