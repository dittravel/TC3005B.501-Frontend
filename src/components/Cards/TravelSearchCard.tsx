import React, { useState } from 'react';
import FlightSearchForm from '@/components/Forms/FlightSearchForm';
import HotelSearchForm from '@/components/Forms/HotelSearchForm';
import type { TravelRoute } from '@/types/TravelRoute';

interface TravelSearchCardProps {
  token: string;
  route: TravelRoute;
  routeIndex: number;
  onSelectFlight?: (flight: any) => void;
  onChange: (index: number, name: string, value: any) => void;
  onSelectHotel?: (hotel: any) => void;
}

const TravelSearchCard = ({ token, route, routeIndex, onSelectFlight, onSelectHotel, onChange }: TravelSearchCardProps) => {
  const [isFlightSearchOpen, setIsFlightSearchOpen] = useState(false);
  const [isHotelSearchOpen, setIsHotelSearchOpen] = useState(false);

  return (
    <div className="card">
      <div className="card-title">
        <h2 className="text-lg font-semibold text-text-primary">
          Ruta #{routeIndex + 1}: Selecciona Vuelos y Hoteles
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Flight Search Section */}
        <div>
          <button
            onClick={() => setIsFlightSearchOpen(!isFlightSearchOpen)}
            type='button'
            className="route-title rounded-lg mt-4 w-full text-white text-left"
          >
            <span className="text-base font-semibold">Form para buscar Vuelos</span>
          </button>

          {isFlightSearchOpen && (
            <FlightSearchForm
              token={token}
              route={route}
              routeIndex={routeIndex}
              // onSelectFlight={(flight) => {
              //   onChange(routeIndex, 'selected_flight', flight);
              // }}
            />
          )}
        </div>

        {/* Hotel Search Section */}
        <div>
          <button
            onClick={() => setIsHotelSearchOpen(!isHotelSearchOpen)}
            className="route-title rounded-lg mt-4 w-full text-white text-left"
          >
            <span className="text-base font-semibold">Form para buscar Hoteles</span>
          </button>

          {isHotelSearchOpen && (
            <HotelSearchForm
              route={route}
              routeIndex={routeIndex}
              onSelectHotel={(hotel) => {
                if (onSelectHotel) onSelectHotel(hotel);
                setIsHotelSearchOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelSearchCard;
