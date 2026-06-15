import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'react-intlayer';
import i18n from 'i18next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { profile, setProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-sync locale with user profile preferred language
  useEffect(() => {
    if (profile?.preferred_language && profile.preferred_language !== locale) {
      const matched = LANGUAGES.find((l) => l.code === profile.preferred_language);
      if (matched) {
        setLocale(matched.code as any);
        i18n.changeLanguage(matched.code);
      }
    }
  }, [profile?.preferred_language]);

  // Apply RTL class to html tag when Arabic is active
  useEffect(() => {
    if (locale === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    // 1. Update React-Intlayer locale state
    setLocale(langCode as any);

    // 2. Update react-i18next language state
    await i18n.changeLanguage(langCode);

    // 3. Save to user profiles if authenticated
    if (profile?.id) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ preferred_language: langCode })
          .eq('id', profile.id);
        
        if (error) {
          console.error('Failed to update preferred language in Supabase:', error);
        } else {
          // Update local zustand state
          setProfile({
            ...profile,
            preferred_language: langCode,
          });
        }
      } catch (err) {
        console.error('Error updating profile preferred language:', err);
      }
    }

    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Globe className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline-block">
            {currentLang.flag} {currentLang.name}
          </span>
          <span className="sm:hidden">{currentLang.flag}</span>
          <ChevronDown className="-mr-1 h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-100 overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1 max-h-80 overflow-y-auto no-scrollbar" role="none">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-teal-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
