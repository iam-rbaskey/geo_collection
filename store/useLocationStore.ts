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
        },
        (error) => {
          console.error("Error getting location", error);
          set({ permissionGranted: false, isLocating: false });
        }
      );
    } else {
      set({ permissionGranted: false, isLocating: false });
    }
  },

  updateLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
  
  setMockLocation: () => set({
    userLocation: { lat: 40.7128, lng: -74.0060 }, // NYC Default
    permissionGranted: true,
    isLocating: false,
  })
}));
