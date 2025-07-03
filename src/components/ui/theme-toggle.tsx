import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { language } = useLanguage()

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      title={isDark ? 
        (language === 'ar' ? 'تبديل للوضع الفاتح' : 'Switch to light mode') : 
        (language === 'ar' ? 'تبديل للوضع الداكن' : 'Switch to dark mode')
      }
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}