/**
 * HotelSearchForm Component
 *
 * Form for searching and selecting hotels inside a travel review card for travel agency users.
 * Displays search filters and hotel options below the hotel checkbox.
 */

import React, { useState } from 'react';
import type { TravelRoute } from '@/types/TravelRoute';
import Button from '../Buttons/Button';
import Toast from '@/components/Utils/Toast';
import Select from '@/components/Utils/Select';
import Input from '@/components/Utils/Input';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const [address, setAddress] = useState(`${route.destination_city}, ${route.destination_country}` || '');
  const [checkInDate, setCheckInDate] = useState(route.beginning_date || '');
  const [checkOutDate, setCheckOutDate] = useState(route.ending_date || '');
  const [guests, setGuests] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate || !address) {
      setToast({ message: 'Por favor completa todos los campos antes de buscar.', type: 'warning' });
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
      setToast({ message: 'Ocurrió un error al buscar hoteles. Por favor intenta de nuevo.', type: 'error' });
      setShownHotels(true);
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleChooseHotel = (hotel: any) => {
    setSelectedHotel(hotel);
  };

  const handleSubmitHotel = async () => {
    if (!selectedHotel) {
      setToast({ message: 'Por favor selecciona un hotel antes de continuar.', type: 'warning' });
      return;
    }

    if (!route.route_id) {
      setToast({ message: 'No se encontró la ruta para guardar la tarifa del hotel.', type: 'error' });
      return;
    }

    const parsedHotelFee = Number(selectedHotel.cost);
    if (!Number.isFinite(parsedHotelFee) || parsedHotelFee < 0) {
      setToast({ message: 'El precio del hotel seleccionado no es válido.', type: 'warning' });
      return;
    }

    try {
      await apiRequest(`/travel-agent/route-fees/${route.route_id}`, {
        method: 'PUT',
        data: { hotel_fee: parsedHotelFee },
        headers: { Authorization: `Bearer ${token}` },
      });

      setToast({ message: `Has seleccionado ${selectedHotel.name} por ${selectedHotel.cost} ${selectedHotel.currency || ''} por noche.`, type: 'success' });
    } catch (error) {
      console.error('Error guardando hotel_fee:', error);
      setToast({ message: 'No se pudo guardar la tarifa del hotel. Intenta de nuevo.', type: 'error' });
    }
  };

  return (
    <div>
      <div className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Address */}
          <Input
            name={`address-${routeIndex}`}
            label="Destino"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          {/* Guests */}
          <Select
            name={`guests-${routeIndex}`}
            label="Número de huéspedes"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            required
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5+</option>
          </Select>

          {/* Check-in Date */}
          <Input
            name={`checkin-${routeIndex}`}
            label="Check-In"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            required
          />

          {/* Check-out Date */}
          <Input
            name={`checkout-${routeIndex}`}
            label="Check-Out"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            required
          />

          {/* Page Size */}
          <Select
            name={`pagesize-${routeIndex}`}
            label="Número de resultados"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            required
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Select>

          {/* Search Button */}
          <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-border pt-4">
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
                          ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/30'
                          : 'border-border bg-tertiary hover:border-secondary hover:bg-secondary/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleChooseHotel(hotel)}
                        className="w-full text-left hover:cursor-pointer"
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
                <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-border pt-4">
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
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default HotelSearchForm;