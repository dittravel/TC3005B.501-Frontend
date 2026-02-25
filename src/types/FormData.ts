import type { TravelRoute } from './TravelRoute';

export interface FormData {
  routeIndex: number;
  notes: string;
  requestedFee: number | string;
  imposedFee: number | string;
  originCountryName: string;
  originCityName: string;
  destinationCountryName: string;
  destinationCityName: string;
  beginningDate: string;
  beginningTime: string;
  endingDate: string;
  endingTime: string;
  planeNeeded: boolean;
  hotelNeeded: boolean;
  routes: TravelRoute[];
}