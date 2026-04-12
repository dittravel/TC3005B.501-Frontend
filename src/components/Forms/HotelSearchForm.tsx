/**
 * HotelSearchForm Component
 * 
 * Form for searching and selecting hotels within a travel route.
 * Displays search filters and hotel options inline below the hotel checkbox.
 */

import React from 'react';
import type { TravelRoute } from '@/types/TravelRoute';

interface HotelSearchFormProps {
  route: TravelRoute;
  routeIndex: number;
  onSelectHotel: (hotel: any) => void;
}

const HotelSearchForm = ({ route, routeIndex, onSelectHotel }: HotelSearchFormProps) => {
  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6">
      <h4 className="text-base font-semibold text-gray-800">Form para buscar hoteles</h4>
      {/* Aqui va el form Vale :) */}
    </div>
  );
};

export default HotelSearchForm;