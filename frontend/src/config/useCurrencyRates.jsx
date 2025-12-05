import { useState, useEffect, useCallback } from 'react';
import api from '../config/axiosInstance';

/**
 * Custom hook to fetch and manage real-time currency exchange rates.
 * Uses Frankfurter API through the backend for EUR, USD, and TRY rates.
 * 
 * @param {number} refreshInterval - Interval in milliseconds to refresh rates (default: 60000ms = 1 minute)
 * @returns {Object} - { rates, loading, error, lastUpdated, refresh, convert }
 */
export const useCurrencyRates = (refreshInterval = 60000) => {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [baseCurrency, setBaseCurrency] = useState('EUR');

    const fetchRates = useCallback(async () => {
        try {
            setError(null);
            const response = await api.get('/currencies/rates');
            const data = response.data;
            
            setRates(data.rates || {});
            setLastUpdated(data.date);
            setBaseCurrency(data.base || 'EUR');
        } catch (err) {
            console.error('Failed to fetch currency rates:', err);
            setError(err.message || 'Failed to fetch rates');
        } finally {
            setLoading(false);
        }
    }, []);

    // Convert amount from one currency to another
    const convert = useCallback((amount, from, to) => {
        if (!rates || Object.keys(rates).length === 0) {
            return null;
        }
        
        const fromUpper = from.toUpperCase();
        const toUpper = to.toUpperCase();
        
        if (fromUpper === toUpper) {
            return amount;
        }
        
        const fromRate = rates[fromUpper];
        const toRate = rates[toUpper];
        
        if (!fromRate || !toRate) {
            return null;
        }
        
        // Convert through EUR (base currency)
        const amountInEur = amount / fromRate;
        return amountInEur * toRate;
    }, [rates]);

    // Force refresh rates
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.post('/currencies/refresh');
            const data = response.data;
            
            setRates(data.rates || {});
            setLastUpdated(data.date);
            setBaseCurrency(data.base || 'EUR');
            setError(null);
        } catch (err) {
            console.error('Failed to refresh currency rates:', err);
            setError(err.message || 'Failed to refresh rates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
        
        // Set up auto-refresh interval
        const interval = setInterval(fetchRates, refreshInterval);
        
        return () => clearInterval(interval);
    }, [fetchRates, refreshInterval]);

    return {
        rates,
        loading,
        error,
        lastUpdated,
        baseCurrency,
        refresh,
        convert
    };
};

export default useCurrencyRates;
