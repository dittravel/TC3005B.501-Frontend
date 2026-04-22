/**
 * HotelSearchForm Component
 *
 * Form for searching and selecting hotels inside a travel review card for travel agency users.
 * Displays search filters and hotel options below the hotel checkbox.
 */

import React, { useState } from 'react';
import type { TravelRoute } from '@/types/TravelRoute';
import Button from '../Buttons/Button';
import Card from '../Utils/Card';
import { apiRequest } from '@/utils/apiClient';

interface HotelSearchFormProps {
  token: string;
  route: TravelRoute;
  routeIndex: number;
}

const HotelSearchForm = ({ token, route, routeIndex }: HotelSearchFormProps) => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [shownHotels, setShownHotels] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const [address, setAddress] = useState(`${route.destination_city}, ${route.destination_country}` || '');
  const [checkInDate, setCheckInDate] = useState(route.beginning_date || '');
  const [checkOutDate, setCheckOutDate] = useState(route.ending_date || '');
  const [guests, setGuests] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate || !address) {
      alert('Por favor completa todos los campos antes de buscar.');
      return;
    }

    setLoadingHotels(true);
    setShownHotels(false);

    const payload = {
      checkInDate,
      checkOutDate,
      guests,
      address,
      pageSize,
    };

    try {
      const response = await apiRequest('/travel-agent/hotels/search', {
        method: 'POST',
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const results = Array.isArray(response?.hotels) ? response.hotels : [];
      setHotels(results);
      setShownHotels(true);
    } catch (error) {
      console.error('Error buscando hoteles:', error);
      alert('Ocurrió un error al buscar hoteles. Por favor intenta de nuevo.');
      setShownHotels(true);
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleChooseHotel = (hotel: any) => {
    setSelectedHotel(hotel);
  };

  const handleSubmitHotel = () => {
    if (!selectedHotel) {
      alert('Por favor selecciona un hotel antes de continuar.');
      return;
    }
    console.log('Hotel seleccionado:', selectedHotel);
    alert(`Has seleccionado ${selectedHotel.name} por $${selectedHotel.cost} por noche.`);
  };

  return (
    <Card className="mt-4 p-6 bg-gray-50 rounded-lg border space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Address */}
        <div className="space-y-2">
          <label
            htmlFor={`address-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Destino <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`address-${routeIndex}`}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-card px-4 py-2.5 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label
            htmlFor={`guests-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Número de huéspedes <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id={`guests-${routeIndex}`}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value={1}>1 huésped</option>
              <option value={2}>2 huéspedes</option>
              <option value={3}>3 huéspedes</option>
              <option value={4}>4 huéspedes</option>
              <option value={5}>5+ huéspedes</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">▼</span>
          </div>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <label
            htmlFor={`checkin-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Check-In <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`checkin-${routeIndex}`}
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-card px-4 py-2.5 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label
            htmlFor={`checkout-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Check-Out <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`checkout-${routeIndex}`}
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-card px-4 py-2.5 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Page Size */}
        <div className="space-y-2">
          <label
            htmlFor={`pagesize-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Número de resultados <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id={`pagesize-${routeIndex}`}
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">▼</span>
          </div>
        </div>

        {/* Search Button */}
        <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-gray-200 pt-4">
          <Button
            type="button"
            onClick={handleSearch}
            color="secondary"
          >
            Buscar hoteles
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loadingHotels && <p className="text-sm text-gray-500">Buscando hoteles...</p>}

      {/* Results */}
      {shownHotels && (
        <div className="space-y-3">
          {hotels.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No se encontraron hoteles para esta búsqueda.
            </p>
          ) : (
            <>
              {hotels.map((hotel, index) => {
                const isSelected = selectedHotel?.name === hotel.name;

                return (
                  <div
                    key={index}
                    className={`rounded-md border p-4 shadow-sm transition ${
                      isSelected
                        ? 'border-gray-200 bg-secondary/5 ring-2 ring-secondary/30'
                        : 'border-gray-200 bg-tertiary hover:border-gray-300 hover:bg-secondary/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleChooseHotel(hotel)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-tertiary">{hotel.name}</p>
                          <p className="text-sm text-gray-500">
                            ⭐ {hotel.rating ?? 'Sin calificación'} | {hotel.installation ?? 'Sin tipo'}
                          </p>
                        </div>
                          <p className="font-semibold text-tertiary">
                            {hotel.cost ? `$${hotel.cost} ${hotel.currency ?? 'USD'} / noche` : 'Precio no disponible'}
                          </p>
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* Submit Button */}
              <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-gray-200 pt-4">
                <Button
                  type="button"
                  onClick={handleSubmitHotel}
                  color="secondary"
                >
                  Seleccionar hotel
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default HotelSearchForm;