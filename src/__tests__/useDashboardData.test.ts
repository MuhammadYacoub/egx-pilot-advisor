import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../hooks/useDashboardData';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useDashboardData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should handle invalid data gracefully', async () => {
    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            symbol: 'TEST',
            currentPrice: 100,
            companyName: 'Test Company'
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: null // Invalid data
        })
      });

    const { result } = renderHook(() => useDashboardData('TEST'));

    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.error).toBeNull();
    expect(result.current.technicalData).toBeTruthy();
  });

  it('should handle array data correctly', async () => {
    const mockHistoricalData = [
      { close: 100, closePrice: 100, date: '2023-01-01' },
      { close: 102, closePrice: 102, date: '2023-01-02' },
      { close: 98, closePrice: 98, date: '2023-01-03' }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            symbol: 'TEST',
            currentPrice: 100,
            companyName: 'Test Company'
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockHistoricalData
        })
      });

    const { result } = renderHook(() => useDashboardData('TEST'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.technicalData).toBeTruthy();
    expect(result.current.technicalData?.rsi).toBeGreaterThan(0);
  });
});
