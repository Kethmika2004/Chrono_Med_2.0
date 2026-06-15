import _kaoob0nlr9 from '../dictionary/appointments.json' with { type: 'json' };
import _1wqxboouyb5 from '../dictionary/book-appointment.json' with { type: 'json' };
import _1jvtvxei63m from '../dictionary/dashboard.json' with { type: 'json' };
import _1gpd2ifvzzb from '../dictionary/login.json' with { type: 'json' };
import _1ehqsorlxvl from '../dictionary/patient-layout.json' with { type: 'json' };
import _1aff88qztw6 from '../dictionary/queue-tracker.json' with { type: 'json' };
import _18vf5v4gm9s from '../dictionary/register.json' with { type: 'json' };

const dictionaries = {
  "appointments": _kaoob0nlr9,
  "book-appointment": _1wqxboouyb5,
  "dashboard": _1jvtvxei63m,
  "login": _1gpd2ifvzzb,
  "patient-layout": _1ehqsorlxvl,
  "queue-tracker": _1aff88qztw6,
  "register": _18vf5v4gm9s
};
const getDictionaries = () => dictionaries;

export { getDictionaries };
export default dictionaries;
