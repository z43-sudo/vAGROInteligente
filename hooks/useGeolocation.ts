import { useState, useEffect } from 'react';

interface Location {
    latitude: number;
    longitude: number;
}

interface GeolocationState {
    location: Location | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        location: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({
                location: null,
                error: 'Geolocalização não é suportada pelo seu navegador.',
                loading: false,
            });
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setState({
                location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                error: null,
                loading: false,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            let errorMessage = 'Erro desconhecido ao obter localização.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permissão de localização negada. Por favor, permita o acesso para ver o clima local.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Informações de localização indisponíveis.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'O pedido de localização expirou.';
                    break;
            }
            setState({
                location: null,
                error: errorMessage,
                loading: false,
            });
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

        // Optional: Watch position if needed, but current position is usually enough for weather
        // const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
        // return () => navigator.geolocation.clearWatch(watchId);

    }, []);

    return state;
};
