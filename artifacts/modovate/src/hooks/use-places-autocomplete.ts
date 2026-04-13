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

function waitForGoogleMaps(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof google !== "undefined" && google.maps?.places) {
      resolve(true);
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof google !== "undefined" && google.maps?.places) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts > 20) {
        clearInterval(interval);
        resolve(false);
      }
    }, 500);
  });
}

export function usePlacesAutocomplete(onSelect: (result: PlaceResult) => void) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    let cancelled = false;
    waitForGoogleMaps().then((loaded) => {
      if (cancelled) return;
      if (loaded) {
        try {
          serviceRef.current = new google.maps.places.AutocompleteService();
        } catch {}
        setIsApiLoaded(true);
      }
    });
    return () => { cancelled = true; };
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
          if (
            google.maps.places.AutocompleteSuggestion?.fetchAutocompleteSuggestions
          ) {
            const { suggestions: results } =
              await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                includedRegionCodes: ["ca"],
                includedPrimaryTypes: ["street_address", "subpremise", "premise"],
              });
            if (results?.length) {
              setSuggestions(
                results.slice(0, 5).map((r) => ({
                  description: r.placePrediction?.text?.text || "",
                  placeId: r.placePrediction?.placeId || "",
                })).filter((s) => s.description && s.placeId)
              );
              setShowDropdown(true);
              return;
            }
          }
        } catch {}

        if (serviceRef.current) {
          serviceRef.current.getPlacePredictions(
            {
              input,
              componentRestrictions: { country: "ca" },
              types: ["address"],
            },
            (predictions, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                predictions?.length
              ) {
                setSuggestions(
                  predictions.slice(0, 5).map((p) => ({
                    description: p.description,
                    placeId: p.place_id,
                  }))
                );
                setShowDropdown(true);
              } else {
                setSuggestions([]);
                setShowDropdown(false);
              }
            }
          );
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
        if (google.maps.places.Place) {
          const place = new google.maps.places.Place({ id: suggestion.placeId });
          await place.fetchFields({ fields: ["formattedAddress", "location"] });
          if (place.location) {
            onSelect({
              formatted_address: place.formattedAddress || suggestion.description,
              lat: place.location.lat(),
              lng: place.location.lng(),
            });
            return;
          }
        }
      } catch {}

      try {
        const dummyDiv = document.createElement("div");
        const svc = new google.maps.places.PlacesService(dummyDiv);
        svc.getDetails(
          { placeId: suggestion.placeId, fields: ["formatted_address", "geometry"] },
          (place, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place?.geometry?.location
            ) {
              onSelect({
                formatted_address: place.formatted_address || suggestion.description,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            }
          }
        );
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
