import { useEffect, useRef, useCallback, useState } from "react";

interface PlaceResult {
  formatted_address: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  description: string;
  placeId: string;
}

export function usePlacesAutocomplete(onSelect: (result: PlaceResult) => void) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const check = () => {
      try {
        if (
          typeof google !== "undefined" &&
          google.maps?.places?.AutocompleteSessionToken
        ) {
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          setIsApiLoaded(true);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    };
    if (check()) return;
    const interval = setInterval(() => {
      if (check()) clearInterval(interval);
    }, 500);
    const timeout = setTimeout(() => clearInterval(interval), 8000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!input.trim() || input.length < 3 || !isApiLoaded) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const request: google.maps.places.AutocompleteRequest = {
            input,
            includedRegionCodes: ["ca"],
            includedPrimaryTypes: ["street_address", "subpremise", "premise"],
            sessionToken: sessionTokenRef.current!,
          };
          const { suggestions: results } =
            await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
          if (results && results.length > 0) {
            setSuggestions(
              results.slice(0, 5).map((r) => ({
                description: r.placePrediction?.text?.text || "",
                placeId: r.placePrediction?.placeId || "",
              })).filter((s) => s.description && s.placeId)
            );
            setShowDropdown(true);
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
        } catch {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }, 300);
    },
    [isApiLoaded]
  );

  const selectSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      setShowDropdown(false);
      setSuggestions([]);
      try {
        const place = new google.maps.places.Place({ id: suggestion.placeId });
        await place.fetchFields({ fields: ["formattedAddress", "location"] });
        if (place.location) {
          onSelect({
            formatted_address: place.formattedAddress || suggestion.description,
            lat: place.location.lat(),
            lng: place.location.lng(),
          });
        }
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      } catch {
        onSelect({
          formatted_address: suggestion.description,
          lat: 0,
          lng: 0,
        });
      }
    },
    [onSelect]
  );

  const dismissDropdown = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 200);
  }, []);

  return {
    suggestions,
    showDropdown,
    isApiLoaded,
    fetchSuggestions,
    selectSuggestion,
    dismissDropdown,
  };
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
