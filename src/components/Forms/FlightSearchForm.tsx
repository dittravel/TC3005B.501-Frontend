/**
 * FlightSearchForm Component
 *
 * Form for searching and selecting flights inside a travel form.
 * Displays search filters and flight options inline below the flight checkbox.
 */

import React, { useEffect, useState } from 'react';
import type { TravelRoute } from '@/types/TravelRoute';
import Button from '../Buttons/Button';
import { apiRequest } from '@/utils/apiClient';

// Define the props for the FlightSearchForm component
interface FlightSearchFormProps {
  token: string;
  route: TravelRoute;
  routeIndex: number;
  tripType?: 'one_way' | 'round';
  ticketType?: 'economy' | 'premium_economy' | 'business' | 'first';
}

// Dummy airport options for testing
const dummyAirports = [
  { code: 'MEX', city: 'Aeropuerto Internacional Benito Juárez (MEX)' },
  { code: 'CUN', city: 'Aeropuerto Internacional de Cancún (CUN)' },
  { code: 'JFK', city: 'Aeropuerto Internacional John F. Kennedy (JFK)' },
  { code: 'LAX', city: 'Aeropuerto Internacional de Los Ángeles (LAX)' },
  { code: 'CDG', city: 'Aeropuerto Charles de Gaulle (CDG)' },
];

// Main component function
const FlightSearchForm = ({ token, route, routeIndex, tripType, ticketType }: FlightSearchFormProps) => {
  const [selectedTripType, setSelectedTripType] = useState<'one_way' | 'round'>(tripType || 'one_way');
  const [selectedTicketType, setSelectedTicketType] = useState<'economy' | 'premium_economy' | 'business' | 'first'>(ticketType || 'economy');
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<string>('');
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState<string>('');
  const [selectedResultsNumber, setSelectedResultsNumber] = useState<number>(10);
  const [shownFlights, setShownFlights] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Handle trip type change
  const handleTripTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTripType(event.target.value as 'one_way' | 'round');
  };

  // Handle ticket type change
  const handleTicketTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTicketType(event.target.value as 'economy' | 'premium_economy' | 'business' | 'first');
  };

  // Handle departure airport change
  const handleDepartureAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartureAirport(event.target.value);
  };

  // Handle arrival airport change
  const handleArrivalAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArrivalAirport(event.target.value);
  };

  // Handle results number change
  const handleResultsNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResultsNumber(parseInt(event.target.value, 10));
  }

  // Allows searching for flights based on selected filters and updates the flight options displayed
  const handleSearch = async () => {
    if (!selectedTripType || !selectedTicketType || !selectedDepartureAirport || !selectedArrivalAirport) {
      alert('Por favor selecciona todos los campos antes de buscar.');
      return;
    }

    setLoadingFlights(true);
    setShownFlights(false);

    const payload = {
      origin: selectedDepartureAirport,
      destination: selectedArrivalAirport,
      departureDate: route.beginning_date, 
      ...(selectedTripType === 'round' && { returnDate: route.ending_date }),
      tripType: selectedTripType,
      cabinClass: selectedTicketType,
      pageSize: selectedResultsNumber,
    };

    try {
      const response = await apiRequest('/travel-agent/flights/search', {
        method: 'POST',
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const offers = Array.isArray(response?.offers) ? response.offers : [];
      setFlights(offers);
      setShownFlights(true);
    } catch (error) {
      console.error('Error buscando vuelos:', error);
      alert('Ocurrió un error al buscar vuelos. Por favor intenta de nuevo.');
      setShownFlights(true);
    } finally {
      setLoadingFlights(false);
    }
  }

  // Handles selecting a flight from the search results
  const handleChooseFlight = (flight: any) => {
    setSelectedFlight(flight);
  }

  // Handles submitting the selected flight and saving its price to the database
  const handleSubmitFlight = (flight: any) => {
    if (!selectedFlight) {
      alert('Por favor selecciona un vuelo antes de continuar.');
      return;
    }
    // Guardar precio del vuelo seleccionado en la base de datos
    console.log("Precio vuelo:", selectedFlight.price);

    alert(`Has seleccionado el vuelo de ${selectedFlight.owner} por ${selectedFlight.price} ${selectedFlight.currency}.`);
  }

  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6 bg-primary/5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`trip-type-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Tipo de viaje <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`trip-type-${routeIndex}`}
              value={selectedTripType}
              onChange={handleTripTypeChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="one_way">Directo</option>
              <option value="round">Redondo</option>
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              ▼
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`trip-type-${routeIndex}`}
            className="block text-sm font-medium"
          >
            Tipo de boleto <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`ticket-type-${routeIndex}`}
              value={selectedTicketType}
              onChange={handleTicketTypeChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              ▼
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`departure-airport-${routeIndex}`}
            className="block text-sm font-medium text-tertiary"
          >
            Aeropuerto de Salida <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`departure-airport-${routeIndex}`}
              value={selectedDepartureAirport}
              onChange={handleDepartureAirportChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Selecciona un aeropuerto</option>
              {dummyAirports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.city}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              ▼
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`arrival-airport-${routeIndex}`}
            className="block text-sm font-medium"
          >
            Aeropuerto de Llegada <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`arrival-airport-${routeIndex}`}
              value={selectedArrivalAirport}
              onChange={handleArrivalAirportChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option disabled value="">Selecciona un aeropuerto</option>
              {dummyAirports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.city}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              ▼
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`arrival-airport-${routeIndex}`}
            className="block text-sm font-medium"
          >
            Número de resultados <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id={`results-number-${routeIndex}`}
              value={selectedResultsNumber}
              onChange={handleResultsNumberChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-tertiary shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option disabled value="">Selecciona un número</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              ▼
            </span>
          </div>
        </div>

        <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-gray-200 pt-4">
          <Button
            type='button'
            onClick={handleSearch}
            color='secondary'
          >
            Buscar vuelos
          </Button>
        </div>
      </div>
      {loadingFlights && <p className="text-sm text-gray-500">Buscando vuelos...</p>}
      {shownFlights && (
        <div className="space-y-3">
          {flights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;

            return (
              <div
                key={flight.id}
                className={`rounded-md border p-4 shadow-sm transition ${isSelected
                  ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/30'
                  : 'border-gray-200 bg-tertiary hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => handleChooseFlight(flight)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-tertiary">{flight.owner}</p>
                      <p className="text-sm text-gray-500">
                        {flight.totalDuration}
                      </p>
                    </div>
                    <p className="font-semibold text-tertiary">
                      {flight.price} {flight.currency}
                    </p>
                  </div>
                </button>


                {isSelected && (
                  <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
                    {flight.segments?.map((segment: any, index: number) => (
                      <div key={`${segment.flightNumber}-${index}`} className="rounded-md bg-primary p-3 border border-gray-100">
                        <p className="text-sm font-medium text-secondary">
                          {segment.from} → {segment.to}
                        </p>
                        <p className="text-xs text-tertiary">
                          Salida: {new Date(segment.departure).toLocaleString()}
                        </p>
                        <p className="text-xs text-tertiary">
                          Llegada: {new Date(segment.arrival).toLocaleString()}
                        </p>
                        <p className="text-xs text-tertiary">
                          Vuelo {segment.flightNumber} {segment.aircraft}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {flights.length > 0 && (
            <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-gray-200 pt-4">
              <Button
                type='button'
                onClick={handleSubmitFlight}
                color='secondary'
              >
                Seleccionar vuelo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSearchForm;