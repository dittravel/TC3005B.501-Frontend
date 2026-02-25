/**
 * RouteInputGroup Component
 * 
 * Renders a form group for inputting travel route details including origin/destination
 * countries and cities, start/end dates and times, and service requirements (plane/hotel).
 * Supports dynamic removal and handles input validation with date constraints.
 */

import React from 'react';
import type { TravelRoute } from '@/types/TravelRoute';

interface RouteInputGroupProps {
  route: TravelRoute;
  onChange: (index: number, name: string, value: any) => void;
  index: number;
  onRemove?: (index: number) => void;
  isRemovable: boolean;
}

// Tailwind CSS classes for consistent input field styling
const inputStyle = 'border border-gray-300 p-2 rounded w-full bg-white';

/**
 * RouteInputGroup Component
 * Displays a form group for a single travel route with various input fields.
 * Manages route state changes and provides optional removal functionality.
 * @param {RouteInputGroupProps} props - Component properties
 * @returns {JSX.Element} Rendered route input form group
 */
const RouteInputGroup: React.FC<RouteInputGroupProps> = ({ route, onChange, index, onRemove, isRemovable }) => {
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
    <div className="bg-white p-4 rounded shadow border border-gray-200">
      {/* Route Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-700">Ruta #{index + 1}</h4>
        {/* Remove Route Button - Only shown if route is removable */}
        {isRemovable && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Eliminar Ruta
          </button>
        )}
      </div>

      {/* Route Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Country */}
        <div>
          <label className="block text-sm font-medium mb-1">País de Origen<span className="text-red-500"> *</span></label>
          <input
            name="originCountryName"
            placeholder="País Origen"
            className={inputStyle}
            value={route.originCountryName === "notSelected" ? '' : route.originCountryName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Origin City */}
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad de Origen<span className="text-red-500"> *</span></label>
          <input
            name="originCityName"
            placeholder="Ciudad Origen"
            className={inputStyle}
            value={route.originCityName === "notSelected" ? '' : route.originCityName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Destination Country */}
        <div>
          <label className="block text-sm font-medium mb-1">País de Destino<span className="text-red-500"> *</span></label>
          <input
            name="destinationCountryName"
            placeholder="País Destino"
            className={inputStyle}
            value={route.destinationCountryName === "notSelected" ? '' : route.destinationCountryName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Destination City */}
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad de Destino<span className="text-red-500"> *</span></label>
          <input
            name="destinationCityName"
            placeholder="Ciudad Destino"
            className={inputStyle}
            value={route.destinationCityName === "notSelected" ? '' : route.destinationCityName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Inicio (MM/DD/YYYY)<span className="text-red-500"> *</span></label>
          <input
            name="beginningDate"
            type="date"
            min={todayISO}
            className={inputStyle}
            value={route.beginningDate === "1900-01-01" ? '' : route.beginningDate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium mb-1">Hora de Inicio (HH:MM AM/PM)<span className="text-red-500"> *</span></label>
          <input
            name="beginningTime"
            type="time"
            className={inputStyle}
            value={route.beginningTime === "00:00:00" ? '' : route.beginningTime}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Fin (MM/DD/YYYY)<span className="text-red-500"> *</span></label>
          <input
            name="endingDate"
            type="date"
            min={route.beginningDate && route.beginningDate !== "1900-01-01" ? route.beginningDate : todayISO}
            className={inputStyle}
            value={route.endingDate === "1900-01-01" ? '' : route.endingDate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium mb-1">Hora de Fin (HH:MM AM/PM)<span className="text-red-500"> *</span></label>
          <input
            name="endingTime"
            type="time"
            className={inputStyle}
            value={route.endingTime === "00:00:00" ? '' : route.endingTime}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Plane Requirement Checkbox */}
        <label className="flex items-center gap-2 my-2">
          <input
            type="checkbox"
            name="planeNeeded"
            checked={route.planeNeeded}
            onChange={handleInputChange}
          />
          ¿Requiere Avión?
        </label>

        {/* Hotel Requirement Checkbox */}
        <label className="flex items-center gap-2 my-2">
          <input
            type="checkbox"
            name="hotelNeeded"
            checked={route.hotelNeeded}
            onChange={handleInputChange}
          />
          ¿Requiere Hotel?
        </label>
      </div>
    </div>
  );
};

export default RouteInputGroup;