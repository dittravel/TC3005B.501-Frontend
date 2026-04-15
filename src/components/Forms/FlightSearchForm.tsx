/**
 * FlightSearchForm Component
 *
 * Form for searching and selecting flights inside a travel form.
 * Displays search filters and flight options inline below the flight checkbox.
 */

import React, { useEffect, useState } from 'react';
import type { TravelRoute } from '@/types/TravelRoute';
import Button from '../Buttons/Button';
import { set } from 'node_modules/cypress/types/lodash';

interface FlightSearchFormProps {
  route: TravelRoute;
  routeIndex: number;
  // onSelectFlight: (flight: any) => void;
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

const actualDummyFlights = [
  {
    "id": "off_0000B5EzFtbpAEXFquXsLc",
    "owner": "Aeromexico",
    "price": "372.02",
    "currency": "USD",
    "cabinClass": "Economy",
    "totalDuration": "4h 28m",
    "segments":
      [
        { "from": "MEX", "to": "CUN", "departure": "2026-05-10T12:55:00", "arrival": "2026-05-10T16:23:00", "airline": "Aeromexico", "flightNumber": "0528", "aircraft": "Boeing 737 MAX 9 / BBJ MAX 9" },
        { "from": "CUN", "to": "MEX", "departure": "2026-05-15T09:14:00", "arrival": "2026-05-15T10:40:00", "airline": "Aeromexico", "flightNumber": "0515", "aircraft": "Boeing 737 MAX 9 / BBJ MAX 9" }
      ]
  },
  {
    "id": "off_0000B5EzFtbpAEXFquXsLa",
    "owner": "Korean Air",
    "price": "350.00",
    "currency": "USD",
    "cabinClass": "Economy",
    "totalDuration": "5h 0m",
    "segments":
      [
        { "from": "MEX", "to": "CUN", "departure": "2026-05-10T14:00:00", "arrival": "2026-05-10T19:00:00", "airline": "Korean Air", "flightNumber": "0528", "aircraft": "Boeing 777" },
        { "from": "CUN", "to": "MEX", "departure": "2026-05-15T11:00:00", "arrival": "2026-05-15T16:00:00", "airline": "Korean Air", "flightNumber": "0515", "aircraft": "Boeing 777" }
      ]
  },
  {
    "id": "off_0000B5EzFtbpAEXFquXsLb",
    "owner": "Delta",
    "price": "400.00",
    "currency": "USD",
    "cabinClass": "Economy",
    "totalDuration": "4h 30m",
    "segments":
      [
        { "from": "MEX", "to": "CUN", "departure": "2026-05-10T16:00:00", "arrival": "2026-05-10T20:30:00", "airline": "Delta", "flightNumber": "0528", "aircraft": "Airbus A320" },
        { "from": "CUN", "to": "MEX", "departure": "2026-05-15T13:00:00", "arrival": "2026-05-15T17:30:00", "airline": "Delta", "flightNumber": "0515", "aircraft": "Airbus A320" }
      ]
  },
];

const FlightSearchForm = ({ route, routeIndex, tripType, ticketType }: FlightSearchFormProps) => {
  // const storageKey = `flight-trip-type-${routeIndex}`;
  const [selectedTripType, setSelectedTripType] = useState<'one_way' | 'round'>(tripType || 'one_way');
  const [selectedTicketType, setSelectedTicketType] = useState<'economy' | 'premium_economy' | 'business' | 'first'>(ticketType || 'economy');
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<string>('');
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState<string>('');
  const [shownFlights, setShownFlights] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Handle trip type change
  const handleTripTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTripType(event.target.value as 'one_way' | 'round');
  };

  // Handle ticket type change
  const handleTicketTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTicketType(event.target.value as 'economy' | 'premium_economy' | 'business' | 'first');
  };

  const handleDepartureAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartureAirport(event.target.value);
  };

  const handleArrivalAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArrivalAirport(event.target.value);
  };

  const handleSearch = () => {
    if (!selectedTripType || !selectedTicketType || !selectedDepartureAirport || !selectedArrivalAirport) {
      alert('Por favor selecciona todos los campos antes de buscar.');
      return;
    }

    // Show dummy flight options when search is clicked
    setLoadingFlights(true);
    setSearchError(null);
    setShownFlights(false);

    const payload = {
      origin: selectedDepartureAirport,
      destination: selectedArrivalAirport,
      departureDate: route.beginning_date,
      returnDate: route.ending_date,
      tripType: selectedTripType,
      cabinClass: selectedTicketType,
      pageSize: 10,
    };
    console.log("Buscando vuelos con payload:", payload);

    // onSelectFlight({ tripType: selectedTripType, ticketType: selectedTicketType, route });

    // try {
    //   API CALL
    //
    // } catch (err) {
    //   setSearchError('No se pudieron obtener vuelos. Intenta de nuevo.');
    //   setFlights([]);
    //   setShownFlights(false);
    // } finally {
    //   setLoadingFlights(false);
    // }
  }

  const handleChooseFlight = (flight: any) => {
    setSelectedFlight(flight);
    // onSelectFlight({ ...flight, tripType: selectedTripType, ticketType: selectedTicketType, route });
  }

  const handleSubmitFlight = (flight: any) => {
    if (!selectedFlight) {
      alert('Por favor selecciona un vuelo antes de continuar.');
      return;
    }
    //onSelectFlight({ ...selectedFlight, price: selectedFlight.price });
    console.log("Precio vuelo:", selectedFlight.price);
  }

  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`trip-type-${routeIndex}`}
            className="block text-sm font-medium"
          >
            Tipo de viaje <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`trip-type-${routeIndex}`}
              value={selectedTripType}
              onChange={handleTripTypeChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
            className="block text-sm font-medium"
          >
            Aeropuerto de Salida <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id={`departure-airport-${routeIndex}`}
              value={selectedDepartureAirport}
              onChange={handleDepartureAirportChange}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
      {shownFlights && (
        <div className="space-y-3">
          {actualDummyFlights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;

            return (
              <div
                key={flight.id}
                className={`rounded-md border p-4 shadow-sm transition ${isSelected
                  ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/30'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => handleChooseFlight(flight)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{flight.owner}</p>
                      <p className="text-sm text-gray-500">
                        {flight.totalDuration}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {flight.price} {flight.currency}
                    </p>
                  </div>
                </button>

                {isSelected && (
                  <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
                    {flight.segments?.map((segment: any, index: number) => (
                      <div key={`${segment.flightNumber}-${index}`} className="rounded-md bg-white p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {segment.from} → {segment.to}
                        </p>
                        <p className="text-xs text-gray-600">
                          Salida: {new Date(segment.departure).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Llegada: {new Date(segment.arrival).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Vuelo {segment.flightNumber} · {segment.aircraft}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="col-span-full text-sm text-secondary flex justify-end items-center border-t border-gray-200 pt-4">
            <Button
              type='button'
              onClick={handleSubmitFlight}
              color='secondary'
            >
              Seleccionar vuelo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearchForm;