/**
 * FlightSearchForm Component
 * 
 * Form for searching and selecting flights inside a travel form.
 * Displays search filters and flight options inline below the flight checkbox.
 */

import React from 'react';
import type { TravelRoute } from '@/types/TravelRoute';

interface FlightSearchFormProps {
  route: TravelRoute;
  routeIndex: number;
  onSelectFlight: (flight: any) => void;
}

const FlightSearchForm = ({ route, routeIndex, onSelectFlight }: FlightSearchFormProps) => {
  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6">
      <h4 className="text-base font-semibold text-gray-800">Form para buscar vuelos</h4>
    </div>
  );
};

export default FlightSearchForm;