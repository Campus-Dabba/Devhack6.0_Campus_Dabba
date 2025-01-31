export interface Location {
    latitude: number;
    longitude: number;
  }


export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  };
export const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      } else {
        throw new Error('No address found for the given coordinates.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Error fetching address: ' + error.message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };