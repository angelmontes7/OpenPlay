import {useState, useEffect, useCallback} from "react";

// note to self: need to keep changing this to my ip run ipconfig getifaddr en0 in terminal to find ip 
// We will change this once we have deployed app on to an actual server
const BASE_URL = "https://openplay-4o4a.onrender.com";
 

export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    console.log(`fetch: ${BASE_URL}${endpoint}`)
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Route not found. Please check the URL: ${BASE_URL}${endpoint}`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAPI(url, options);
            setData(result.data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {data, loading, error, refetch: fetchData};
};