import { create } from 'zustand';

interface LocationState {
  userLocation: { lat: number; lng: number } | null;
  permissionGranted: boolean | null;
  isLocating: boolean;
  requestPermission: () => void;
  updateLocation: (lat: number, lng: number) => void;
  setMockLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  permissionGranted: null,
  isLocating: false,

  requestPermission: () => {
    set({ isLocating: true });
    if ('geolocation' in navigator) {
      // Safari requires more explicit permission handling
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            permissionGranted: true,
            isLocating: false,
          });
          // Start watching position for continuous updates
          navigator.geolocation.watchPosition(
            (pos) => {
              set({
                userLocation: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                },
              });
            },
            (error) => {
              // Ignore watch errors silently
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location access denied. Please enable location services in your browser settings.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert('Location information unavailable. Please check your device settings.');
          } else if (error.code === error.TIMEOUT) {
            alert('Location request timed out. Please try again.');
          }
          set({ permissionGranted: false, isLocating: false });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      set({ permissionGranted: false, isLocating: false });
    }
  },

  updateLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  
  setMockLocation: () => set({
    userLocation: { lat: 22.6958, lng: 88.3533 }, // Kolkata, India
    permissionGranted: true,
    isLocating: false,
  })
}));
