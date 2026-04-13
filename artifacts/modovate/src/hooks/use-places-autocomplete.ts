import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
      };
    };
  }
}

interface PlaceResult {
  formatted_address: string;
  lat: number;
  lng: number;
}

export function usePlacesAutocomplete(
  onSelect: (result: PlaceResult) => void
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isReady, setIsReady] = useState(false);

  const waitForGoogle = useCallback(() => {
    if (window.google?.maps?.places) {
      setIsReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = waitForGoogle();
    return cleanup;
  }, [waitForGoogle]);

  useEffect(() => {
    if (!isReady || !inputRef.current || autocompleteRef.current) return;

    const ac = new window.google!.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ca" },
      types: ["address"],
      fields: ["formatted_address", "geometry"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place?.formatted_address && place?.geometry?.location) {
        onSelect({
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    autocompleteRef.current = ac;
  }, [isReady, onSelect]);

  return { inputRef, isReady };
}

export function getStaticMapUrl(
  lat: number,
  lng: number,
  width: number,
  height: number,
  zoom = 19
): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return "";
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${key}`;
}
