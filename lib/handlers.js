exports.api = {}

exports.home = (req, res) => res.render('home')

// **** te funkcje obsługują formularze wysłane przez przeglądarkę
exports.newsletterSignup = (req, res) => {
  // w dalszej części książki dowiemy się, czym jest CSRF...na razie
  // podamy zmyśloną wartość
  res.render('newsletter-signup', { csrf: 'miejsce na token CSRF' })
}
exports.newsletterSignupProcess = (req, res) => {
  console.log('Token CSRF (z ukrytego pola formularza): ' + req.body._csrf)
  console.log('Imię (z widocznego pola formularza): ' + req.body.name)
  console.log('Email (z widocznego pola formularza): ' + req.body.email)
  res.redirect(303, '/newsletter-signup/thank-you')
}
exports.newsletterSignupThankYou = (req, res) => res.render('newsletter-signup-thank-you')
// **** koniec funkcji obsługujących przeglądarki

exports.vacationPhotoContest = (req, res) => {
  const now = new Date()
  res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() })
}
exports.vacationPhotoContestAjax = (req, res) => {
  const now = new Date()
  res.render('contest/vacation-photo-ajax', { year: now.getFullYear(), month: now.getMonth() })
}

exports.vacationPhotoContestProcess = (req, res, fields, files) => {
  console.log('field data: ', fields)
  console.log('files: ', files)
  res.redirect(303, '/contest/vacation-photo-thank-you')
}
exports.vacationPhotoContestProcess = (req, res, fields, files) => {
  res.redirect(303, '/contest/vacation-photo-error')
}
exports.api.vacationPhotoContest = (req, res, fields, files) => {
  console.log('field data: ', fields)
  console.log('files: ', files)
  res.send({ result: 'success' })
}
exports.api.vacationPhotoContestError = (req, res, message) => {
  res.send({ result: 'error', error: message })
}

// **** te funkcje obsługują formularze fetch/JSON
exports.newsletter = (req, res) => {
  // w dalszej części książki dowiemy się, czym jest CSRF...na razie
  // podamy zmyśloną wartość
  res.render('newsletter', { csrf: 'miejsce na token CSRF' })
}
exports.api.newsletterSignup = (req, res) => {
  console.log('Token CSRF (z ukrytego pola formularza): ' + req.body._csrf)
  console.log('Imię (z widocznego pola formularza): ' + req.body.name)
  console.log('Email (z widocznego pola formularza): ' + req.body.email)
  res.send({ result: 'success' })
}
// **** koniec funkcji obsługi fetch/JSON

exports.notFound = (req, res) => res.render('404')

// Express rozpoznaje funkcję obsługi zdarzeń na podstawie czterech argumentów
// a zatem musimy wyłączyć regułę ESLint no-unused-vars
/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500')
/* eslint-enable no-unused-vars */
