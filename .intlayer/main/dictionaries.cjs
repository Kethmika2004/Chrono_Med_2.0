const _kaoob0nlr9 = require('../dictionary/appointments.json');
const _1wqxboouyb5 = require('../dictionary/book-appointment.json');
const _1jvtvxei63m = require('../dictionary/dashboard.json');
const _1gpd2ifvzzb = require('../dictionary/login.json');
const _1ehqsorlxvl = require('../dictionary/patient-layout.json');
const _1aff88qztw6 = require('../dictionary/queue-tracker.json');
const _18vf5v4gm9s = require('../dictionary/register.json');

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

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
