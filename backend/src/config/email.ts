import nodemailer from 'nodemailer';
import { config } from './index';

export const emailTransporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Email templates
export const emailTemplates = {
  welcome: (name: string, language: 'ar' | 'en') => ({
    subject: language === 'ar' ? 'مرحباً بك في EGX Pilot Advisor' : 'Welcome to EGX Pilot Advisor',
    html: language === 'ar' ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4;">مرحباً ${name}!</h1>
        <p>أهلاً وسهلاً بك في منصة EGX Pilot Advisor لتحليل الأسهم المصرية.</p>
        <p>يمكنك الآن الاستفادة من جميع ميزات التحليل الفني والأساسي ومتابعة محفظتك الاستثمارية.</p>
        <p>مع تحيات فريق EGX Pilot Advisor</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4;">Welcome ${name}!</h1>
        <p>Welcome to EGX Pilot Advisor - Your Egyptian Stock Market Analysis Platform.</p>
        <p>You can now access all technical and fundamental analysis features and track your investment portfolio.</p>
        <p>Best regards,<br>EGX Pilot Advisor Team</p>
      </div>
    `
  }),

  dailyReport: (data: any, language: 'ar' | 'en') => ({
    subject: language === 'ar' ? 'التقرير اليومي - EGX Pilot Advisor' : 'Daily Report - EGX Pilot Advisor',
    html: language === 'ar' ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4;">التقرير اليومي</h1>
        <h2>ملخص السوق</h2>
        <p>مؤشر EGX 30: ${data.egx30?.value || 'غير متاح'}</p>
        <p>التغيير: ${data.egx30?.change || 'غير متاح'}%</p>
        <h2>محفظتك</h2>
        <p>القيمة الإجمالية: ${data.portfolio?.totalValue || 'غير متاح'} جنيه</p>
        <p>الربح/الخسارة اليوم: ${data.portfolio?.dailyPnl || 'غير متاح'} جنيه</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4;">Daily Report</h1>
        <h2>Market Summary</h2>
        <p>EGX 30 Index: ${data.egx30?.value || 'N/A'}</p>
        <p>Change: ${data.egx30?.change || 'N/A'}%</p>
        <h2>Your Portfolio</h2>
        <p>Total Value: ${data.portfolio?.totalValue || 'N/A'} EGP</p>
        <p>Today's P&L: ${data.portfolio?.dailyPnl || 'N/A'} EGP</p>
      </div>
    `
  }),

  alert: (alertMessage: string, symbol: string, language: 'ar' | 'en') => ({
    subject: language === 'ar' ? `تنبيه: ${symbol}` : `Alert: ${symbol}`,
    html: language === 'ar' ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">🚨 تنبيه مهم</h1>
        <h2>السهم: ${symbol}</h2>
        <p>${alertMessage}</p>
        <p>تم إرسال هذا التنبيه من منصة EGX Pilot Advisor</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">🚨 Important Alert</h1>
        <h2>Stock: ${symbol}</h2>
        <p>${alertMessage}</p>
        <p>This alert was sent from EGX Pilot Advisor platform</p>
      </div>
    `
  })
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await emailTransporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};
