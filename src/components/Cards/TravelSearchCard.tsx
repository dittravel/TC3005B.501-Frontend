import React, { useState } from 'react';
import FlightSearchForm from '@/components/Forms/FlightSearchForm';
import HotelSearchForm from '@/components/Forms/HotelSearchForm';
import type { TravelRoute } from '@/types/TravelRoute';

interface TravelSearchCardProps {
  route: TravelRoute;
  routeIndex: number;
  onSelectFlight?: (flight: any) => void;
  onSelectHotel?: (hotel: any) => void;
}

const TravelSearchCard = ({ route, routeIndex, onSelectFlight, onSelectHotel }: TravelSearchCardProps) => {
  const [isFlightSearchOpen, setIsFlightSearchOpen] = useState(false);
  const [isHotelSearchOpen, setIsHotelSearchOpen] = useState(false);

  return (
    <div className="card">
      <div className="card-title">
        <h2 className="text-lg font-semibold text-text-primary">
          Ruta #{routeIndex + 1}: Selecciona Vuelos y Hoteles
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Search Section */}
        <div>
          <button
            onClick={() => setIsFlightSearchOpen(!isFlightSearchOpen)}
            className="route-title rounded-lg mt-4 w-full text-white text-left"
          >
            <span className="text-base font-semibold">Form para buscar Vuelos</span>
          </button>

          {isFlightSearchOpen && (
            <FlightSearchForm
              route={route}
              routeIndex={routeIndex}
              onSelectFlight={(flight) => {
                if (onSelectFlight) onSelectFlight(flight);
                setIsFlightSearchOpen(false);
              }}
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
