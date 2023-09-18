const fortune = require('./fortune')

exports.home = (req, res) => res.render('home')

exports.about = (req, res) =>
  res.render('about', { fortune: fortune.getFortune() })

exports.notFound = (req, res) => res.render('404')

// Express rozpoznaje funkcję obsługi zdarzeń na podstawie czterech argumentów
// a zatem musimy wyłączyć regułę ESLint no-unused-vars
/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500')
/* eslint-enable no-unused-vars */
