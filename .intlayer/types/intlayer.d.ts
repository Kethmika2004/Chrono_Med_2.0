import "intlayer";
import _42wyqlcmwp from './appointments.ts';
import _18gtj9kw7fh from './book-appointment.ts';
import _2kqwtalwzx from './dashboard.ts';
import _17azxkn87i9 from './login.ts';
import _13ciikehcos from './patient-layout.ts';
import _18ioa9l2buf from './queue-tracker.ts';
import _15vv7urqtoo from './register.ts';

declare module 'intlayer' {
  interface __DictionaryRegistry {
    "appointments": typeof _42wyqlcmwp;
    "book-appointment": typeof _18gtj9kw7fh;
    "dashboard": typeof _2kqwtalwzx;
    "login": typeof _17azxkn87i9;
    "patient-layout": typeof _13ciikehcos;
    "queue-tracker": typeof _18ioa9l2buf;
    "register": typeof _15vv7urqtoo;
  }

  interface __DeclaredLocalesRegistry {
    "en": 1;
    "si": 1;
    "ta": 1;
    "hi": 1;
    "fr": 1;
    "de": 1;
    "ar": 1;
    "ja": 1;
    "zh": 1;
    "es": 1;
  }

  interface __RequiredLocalesRegistry {
    "en": 1;
    "si": 1;
    "ta": 1;
    "hi": 1;
    "fr": 1;
    "de": 1;
    "ar": 1;
    "ja": 1;
    "zh": 1;
    "es": 1;
  }

  interface __SchemaRegistry {

  }

  interface __StrictModeRegistry { mode: 'inclusive' }

  interface __EditorRegistry { enabled : false }

  interface __RoutingRegistry { mode: 'prefix-no-default'; defaultLocale: 'en' }
}
