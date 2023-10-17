const db = require('../db')

exports.api = {}

exports.home = (req, res) => res.render('home')

// **** poniższe funkcje obsługują formularze przesłane przez przeglądarki
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
// **** koniec obsługi formularzy przesłanych przez przeglądarki

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

const pathUtils = require('path')
const fs = require('fs')

// tworzymy katalog do zapisywania plików z wakacji (jeśli jeszcze nie istnieje)
const dataDir = pathUtils.resolve(__dirname, '..', 'data')
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos')
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if(!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir)

function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO...tym zajmiemy się później
}

// później skorzystamy z tych wersji funkcji fs opartych na obiektach promise
const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)

exports.api.vacationPhotoContest = async (req, res, fields, files) => {
  const photo = files.photo[0]
  const dir = vacationPhotosDir + '/' + Date.now()
  const path = dir + '/' + photo.originalFilename
  await mkdir(dir)
  await rename(photo.path, path)
  saveContestEntry('vacation-photo', fields.email,
    req.params.year, req.params.month, path)
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

function convertFromUSD(value, currency) {
  switch(currency) {
    case 'USD': return value * 1
    case 'GBP': return value * 0.79
    case 'BTC': return value * 0.000078
    default: return NaN
  }
}

exports.listVacations = async (req, res) => {
  const vacations = await db.getVacations({ available: true })
  const currency = req.session.currency || 'USD'
  const context = {
    currency: currency,
    vacations: vacations.map(vacation => {
      return {
        sku: vacation.sku,
        name: vacation.name,
        description: vacation.description,
        inSeason: vacation.inSeason,
        price: convertFromUSD(vacation.price, currency),
        qty: vacation.qty,
      }
    }),
  }

  switch(currency) {
    case 'USD': context.currencyUSD = 'selected'; break
    case 'GBP': context.currencyGBP = 'selected'; break
    case 'BTC': context.currencyBTC = 'selected'; break
  }
  res.render('vacations', context)
}

// poniższa trasa przekierowuje do strony /vacations,
// lecz możemy jej też chcieć używać na innych stronach!
exports.setCurrency = (req, res) => {
  req.session.currency = req.params.currency
  return res.redirect(303, '/vacations')
}

exports.notifyWhenInSeasonForm = (req, res) =>
  res.render('notify-me-when-in-season', { sku: req.query.sku })

exports.notifyWhenInSeasonProcess = async (req, res) => {
  const { email, sku } = req.body
  await db.addVacationInSeasonListener(email, sku)
  return res.redirect(303, '/vacations')
}

exports.notFound = (req, res) => res.render('404')

// Express rozpoznaje funkcję obsługi zdarzeń na podstawie czterech argumentów
// a zatem musimy wyłączyć regułę ESLint no-unused-vars
/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500')
/* eslint-enable no-unused-vars */
