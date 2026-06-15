import _17ylyox2say from '../unmerged_dictionary/appointments.json' with { type: 'json' };
import _1yn45bv1577 from '../unmerged_dictionary/book-appointment.json' with { type: 'json' };
import _2g5wiqd8u6b from '../unmerged_dictionary/dashboard.json' with { type: 'json' };
import _1t88xg4228x from '../unmerged_dictionary/login.json' with { type: 'json' };
import _6jzvvjavk from '../unmerged_dictionary/patient-layout.json' with { type: 'json' };
import _bi90zu9taz from '../unmerged_dictionary/queue-tracker.json' with { type: 'json' };
import _28jpu6044eo from '../unmerged_dictionary/register.json' with { type: 'json' };

const dictionaries = {
  "appointments": _17ylyox2say,
  "book-appointment": _1yn45bv1577,
  "dashboard": _2g5wiqd8u6b,
  "login": _1t88xg4228x,
  "patient-layout": _6jzvvjavk,
  "queue-tracker": _bi90zu9taz,
  "register": _28jpu6044eo
};
const getUnmergedDictionaries = () => dictionaries;

export { getUnmergedDictionaries };
export default dictionaries;
