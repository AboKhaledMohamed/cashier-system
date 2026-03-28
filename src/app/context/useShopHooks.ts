/**
 * Hooks for Shop Context functionality
 * These provide convenience wrappers around the API
 */

import { useState, useEffect } from 'react';
import { useShop } from './ShopContext';

/**
 * Hook to get low stock alerts
 */
export function useLowStockAlerts() {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const api = (window as any).electronAPI;
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.products.getLowStock();
        setLowStock(data);
      } catch (e) {
        console.error('Failed to load low stock:', e);
      }
    };
    load();
  }, []);

  return lowStock;
}

/**
 * Hook to get expiring products
 */
export function useExpiringProducts() {
  const [expiring, setExpiring] = useState<any[]>([]);
  const api = (window as any).electronAPI;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.products.getExpiringSoon();
        setExpiring(data);
      } catch (e) {
        console.error('Failed to load expiring products:', e);
      }
    };
    load();
  }, []);

  return expiring;
}
