import React, { useState } from 'react';
import FlightSearchForm from '@/components/Forms/FlightSearchForm';
import HotelSearchForm from '@/components/Forms/HotelSearchForm';
import type { TravelRoute } from '@/types/TravelRoute';
import Checkbox from '../Utils/Checkbox';

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "plane_form") {
      setIsFlightSearchOpen(checked);
    }

    if (name === "hotel_form") {
      setIsHotelSearchOpen(checked);
    }
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {route.plane_needed === true && (
          <>
            {/* Flight Search Section */}
            <Checkbox
              name="plane_form"
              label="Agregar Vuelo"
              checked={isFlightSearchOpen}
              onChange={handleInputChange}
            />

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
          </>
        )}

        {route.hotel_needed === true && (
          <>
            <Checkbox
              name="hotel_form"
              label="Agregar Hotel"
              checked={isHotelSearchOpen}
              onChange={handleInputChange}
            />

            {isHotelSearchOpen && (
              <HotelSearchForm
                token={token}
                route={route}
                routeIndex={routeIndex}
              />
            )}
          </>
        )}
      </div>
  );
};

export default TravelSearchCard;
