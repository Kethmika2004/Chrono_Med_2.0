const _17ylyox2say = require('../unmerged_dictionary/appointments.json');
const _1yn45bv1577 = require('../unmerged_dictionary/book-appointment.json');
const _2g5wiqd8u6b = require('../unmerged_dictionary/dashboard.json');
const _1t88xg4228x = require('../unmerged_dictionary/login.json');
const _6jzvvjavk = require('../unmerged_dictionary/patient-layout.json');
const _bi90zu9taz = require('../unmerged_dictionary/queue-tracker.json');
const _28jpu6044eo = require('../unmerged_dictionary/register.json');

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

module.exports.getUnmergedDictionaries = getUnmergedDictionaries;
module.exports = dictionaries;
