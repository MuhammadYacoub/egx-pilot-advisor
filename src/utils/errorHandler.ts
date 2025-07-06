// إعدادات معالجة الأخطاء العامة للتطبيق
export const ErrorBoundaryConfig = {
  // معالجة الأخطاء غير المتوقعة
  handleError: (error: Error, errorInfo?: any) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    
    // يمكن إضافة خدمة إرسال الأخطاء هنا (مثل Sentry)
    // sendErrorToService(error, errorInfo);
  },

  // التحقق من صحة البيانات
  validateApiResponse: (response: any): boolean => {
    if (!response) return false;
    if (typeof response !== 'object') return false;
    return true;
  },

  // معالجة البيانات التاريخية
  processHistoricalData: (data: any): any[] => {
    console.log('Processing historical data:', typeof data, data);
    
    // تحقق من أن البيانات array
    if (Array.isArray(data)) {
      console.log('Data is already an array:', data.length, 'items');
      return data;
    }
    
    // تحقق من وجود خاصية data (استجابة API معيارية)
    if (data && data.data) {
      // للاستجابات المتداخلة مثل {data: {data: []}}
      if (data.data.data && Array.isArray(data.data.data)) {
        console.log('Found nested data.data.data array:', data.data.data.length, 'items');
        return data.data.data;
      }
      // للاستجابات العادية مثل {data: []}
      if (Array.isArray(data.data)) {
        console.log('Found data.data array:', data.data.length, 'items');
        return data.data;
      }
    }
    
    // تحقق من وجود خاصية results
    if (data && data.results && Array.isArray(data.results)) {
      console.log('Found data.results array:', data.results.length, 'items');
      return data.results;
    }
    
    // تحقق من وجود خاصية quotes
    if (data && data.quotes && Array.isArray(data.quotes)) {
      console.log('Found data.quotes array:', data.quotes.length, 'items');
      return data.quotes;
    }
    
    // إذا لم تكن البيانات صحيحة، أرجع array فارغ
    console.warn('Invalid historical data format. Expected array or object with data/results property:', data);
    return [];
  },

  // معالجة أخطاء الشبكة
  handleNetworkError: (error: any): string => {
    if (error.name === 'NetworkError') {
      return 'خطأ في الاتصال بالشبكة';
    }
    
    if (error.status === 404) {
      return 'البيانات غير موجودة';
    }
    
    if (error.status === 500) {
      return 'خطأ في الخادم';
    }
    
    if (error.status === 429) {
      return 'تم تجاوز حد الطلبات المسموح';
    }
    
    return error.message || 'خطأ غير متوقع';
  }
};

// مكون معالج الأخطاء
export class ErrorHandler {
  static safeApiCall = async <T>(
    apiCall: () => Promise<T>,
    fallbackValue: T,
    errorMessage?: string
  ): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      console.error(errorMessage || 'API call failed:', error);
      return fallbackValue;
    }
  };

  static safeArrayOperation = <T>(
    array: any,
    operation: (arr: T[]) => any,
    fallbackValue: any = null
  ): any => {
    try {
      if (!Array.isArray(array)) {
        console.warn('Expected array but got:', typeof array);
        return fallbackValue;
      }
      return operation(array);
    } catch (error) {
      console.error('Array operation failed:', error);
      return fallbackValue;
    }
  };
}
