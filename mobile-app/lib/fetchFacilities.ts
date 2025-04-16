import { fetchAPI } from "@/lib/fetch";

export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
  
    return parseFloat((distance * 0.621371).toFixed(1)); // Convert to miles and round to 1 decimal place
  };
  
  export const fetchFacilities = async (
    latitude: number,
    longitude: number
  ): Promise<Court[]> => {
    try {
      // Fetch the parsed JSON data directly
      const data = await fetchAPI("/api/sports-facilities");
  
      // Map the API response to the `Court` interface
      const mappedData: Court[] = data.map((facility: any) => {
        const courtLatitude = parseFloat(facility.coordinates.x); // Assuming `coordinates` is a POINT type
        const courtLongitude = parseFloat(facility.coordinates.y);
  
        return {
          id: facility.id.toString(),
          name: facility.name,
          address: facility.address,
          available: true, // Set this based on your logic
          sport: facility.sports,
          distance: calculateDistance(latitude, longitude, courtLatitude, courtLongitude), // Use the centralized function
          popularity: facility.stars, // Map stars
          type: facility.free_vs_paid,
          capacity: parseInt(facility.capacity, 10),
          coordinate: {
            latitude: courtLatitude,
            longitude: courtLongitude,
          },
          description: facility.description,
          amenities: facility.amenities,
          website: facility.website,
          stars: facility.stars,
        };
      });
  
      return mappedData;
    } catch (error) {
      console.error("Error fetching facilities:", error);
      throw error;
    }
  };