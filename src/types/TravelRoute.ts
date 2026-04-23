/**
 * Structure of a travel route object in the application
 */

export interface TravelRoute {
  route_id?: number;
  router_index: number;
  origin_country_name?: string;
  origin_city_name?: string;
  destination_country_name?: string;
  destination_city_name?: string;
  origin_country?: string;
  origin_city?: string;
  destination_country?: string;
  destination_city?: string;
  beginning_date: string;
  beginning_time: string;
  ending_date: string;
  ending_time: string;
  plane_needed: boolean;
  hotel_needed: boolean;
  flight_fee?: number | null;
  hotel_fee?: number | null;
  selected_flight: null;
  selected_hotel: null;
}