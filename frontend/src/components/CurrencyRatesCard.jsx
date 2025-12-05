import React from 'react';
import { useTranslation } from 'react-i18next';
import useCurrencyRates from '../config/useCurrencyRates';
import { Box, Typography, Card, CardContent, CircularProgress, IconButton, Tooltip, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EuroIcon from '@mui/icons-material/Euro';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyLiraIcon from '@mui/icons-material/CurrencyLira';

/**
 * Currency Rates Display Component
 * Shows real-time exchange rates for EUR, USD, and TRY
 */
const CurrencyRatesCard = ({ compact = false }) => {
    const { t } = useTranslation();
    const { rates, loading, error, lastUpdated, refresh } = useCurrencyRates(60000);

    const getCurrencyIcon = (currency) => {
        switch (currency) {
            case 'EUR':
                return <EuroIcon fontSize="small" />;
            case 'USD':
                return <AttachMoneyIcon fontSize="small" />;
            case 'TRY':
                return <CurrencyLiraIcon fontSize="small" />;
            default:
                return null;
        }
    };

    const formatRate = (rate) => {
        if (!rate) return '-';
        return rate.toFixed(4);
    };

    if (loading && Object.keys(rates).length === 0) {
        return (
            <Card sx={{ minWidth: compact ? 200 : 300 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }} color="text.secondary">
                        {t('loading', 'Loading rates...')}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (error && Object.keys(rates).length === 0) {
        return (
            <Card sx={{ minWidth: compact ? 200 : 300 }}>
                <CardContent>
                    <Typography color="error">
                        {t('currencyError', 'Failed to load rates')}
                    </Typography>
                    <IconButton onClick={refresh} size="small" color="primary">
                        <RefreshIcon />
                    </IconButton>
                </CardContent>
            </Card>
        );
    }

    if (compact) {
        return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                {Object.entries(rates).map(([currency, rate]) => (
                    <Chip
                        key={currency}
                        icon={getCurrencyIcon(currency)}
                        label={`${currency}: ${formatRate(rate)}`}
                        size="small"
                        variant="outlined"
                    />
                ))}
                <Tooltip title={t('refreshRates', 'Refresh rates')}>
                    <IconButton onClick={refresh} size="small" disabled={loading}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Card sx={{ minWidth: 300 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="primary" />
                        <Typography variant="h6" component="div">
                            {t('exchangeRates', 'Exchange Rates')}
                        </Typography>
                    </Box>
                    <Tooltip title={t('refreshRates', 'Refresh rates')}>
                        <IconButton onClick={refresh} size="small" disabled={loading}>
                            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {t('baseCurrency', 'Base')}: EUR | {lastUpdated && `${t('updated', 'Updated')}: ${lastUpdated}`}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {Object.entries(rates).map(([currency, rate]) => (
                        <Box
                            key={currency}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'action.hover'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getCurrencyIcon(currency)}
                                <Typography variant="body1" fontWeight="medium">
                                    {currency}
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold">
                                {formatRate(rate)}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {error && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                        {t('usingCachedRates', 'Using cached rates')}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default CurrencyRatesCard;
