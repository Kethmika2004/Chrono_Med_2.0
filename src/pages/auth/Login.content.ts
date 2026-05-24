import { t, type Dictionary } from "intlayer"

const loginContent = {
  key: "login",
  content: {
    title: t({
      en: "Welcome Back",
      si: "නැවත සාදරයෙන් පිළිගනිමු",
      ta: "மீண்டும் வருக",
    }),
    subtitle: t({
      en: "Sign in to access your portal",
      si: "ඔබගේ ද්වාරයට ප්‍රවේශ වීමට ලොග් වන්න",
      ta: "உங்கள் போர்ட்டலை அணுக உள்நுழைக",
    }),
    emailLabel: t({
      en: "Email Address",
      si: "විද්‍යුත් තැපෑල",
      ta: "மின்னஞ்சல் முகவரி",
    }),
    emailPlaceholder: t({
      en: "name@example.com",
      si: "name@example.com",
      ta: "name@example.com",
    }),
    passwordLabel: t({
      en: "Password",
      si: "මුරපදය",
      ta: "கடவுச்சொல்",
    }),
    passwordPlaceholder: t({
      en: "••••••••",
      si: "••••••••",
      ta: "••••••••",
    }),
    forgotPassword: t({
      en: "Forgot password?",
      si: "මුරපදය අමතකද?",
      ta: "கடவுச்சொல் மறந்துவிட்டதா?",
    }),
    signInButton: t({
      en: "Sign In",
      si: "ඇතුල් වන්න",
      ta: "உள்நுழைக",
    }),
    signingIn: t({
      en: "Signing in...",
      si: "ඇතුල් වෙමින්...",
      ta: "உள்நுழைகிறது...",
    }),
    dontHaveAccount: t({
      en: "Don't have an account?",
      si: "ගිණුමක් නොමැතිද?",
      ta: "கணக்கு இல்லையா?",
    }),
    registerLink: t({
      en: "Register here",
      si: "මෙහි ලියාපදිංචි වන්න",
      ta: "இங்கே பதிவு කරන්න",
    }),
  },
} satisfies Dictionary

export default loginContent
