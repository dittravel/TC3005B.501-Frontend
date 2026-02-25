export interface TravelRoute {
  routeIndex: number;
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
}