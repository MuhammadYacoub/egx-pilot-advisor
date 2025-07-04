import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { login, createTestUser, isLoading } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');

  const handleGoogleLogin = async () => {
    // In a real implementation, this would use Google OAuth
    // For now, we'll show a placeholder
    alert('Google OAuth integration would be implemented here');
  };

  const handleTestUserLogin = async () => {
    try {
      await createTestUser(testEmail, testName);
      onLogin?.();
    } catch (error) {
      console.error('Test user login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            مستشار الاستثمار EGX
          </CardTitle>
          <CardDescription className="text-center">
            مرحباً بك في منصة إدارة المحافظ الاستثمارية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login Section */}
          <div className="space-y-2">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              تسجيل الدخول بـ Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                أو للتطوير
              </span>
            </div>
          </div>

          {/* Test User Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">البريد الإلكتروني التجريبي</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="pl-10"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testName">الاسم التجريبي</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="testName"
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="pl-10"
                  placeholder="أدخل الاسم"
                />
              </div>
            </div>

            <Button 
              onClick={handleTestUserLogin}
              className="w-full"
              disabled={isLoading || !testEmail || !testName}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              إنشاء مستخدم تجريبي والدخول
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            المستخدم التجريبي مخصص للتطوير والاختبار فقط
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
