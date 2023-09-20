const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const multiparty = require('multiparty')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const credentials = require('./credentials')
const handlers = require('./lib/handlers')
const weatherMiddlware = require('./lib/middleware/weather')
const flashMiddleware = require('./lib/middleware/flash')
const nodemailer = require("nodemailer");
//const htmlToFormattedText = require('html-to-formatted-text')
const { convert } = require('html-to-text');

const app = express()

// nieco zmodyfikowana wersja oficjalnego wzorca regularnego adresu e-mail ze specyfikacji W3C HTML5:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
  '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
  '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$')

// konfiguracja silnika widoków Handlebars
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options) {
      if(!this._sections) this._sections = {}
      this._sections[name] = options.fn(this)
      return null
    },
  },
}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cookieParser(credentials.cookieSecret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}))

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.use(weatherMiddlware)
app.use(flashMiddleware)

const mailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//    user: "mrhalatsan@gmail.com",
//    pass: "scpavaxqrmhrcpgx",
    user: credentials.gmail.user,
    pass: credentials.gmail.password, 
 },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

app.post('/cart/checkout', (req, res, next) => {
	const cart = req.session.cart
	if(!cart) next(new Error('Cart does not exist.'))
	const name = req.body.name || '', email = req.body.email || ''
	// walidacja danych wejściowych
	if(!email.match(VALID_EMAIL_REGEX))
		return res.next(new Error('Invalid email address.'))
	// przypisujemy losowy identyfikator koszyka; w normalnej sytuacji należy użyć identyfikatora z bazy danych
//	cart.number = Math.random().toString().replace(/^0\.0*/, '')
//	cart.billing = {
//		name: name,
//		email: email,
//	}
  res.render('email/cart-thank-you', { layout: null, cart: cart },
    (err,html) => {
        console.log('rendered email: ', html)
        if(err) console.log('error in email template')
        mailTransport.sendMail({
          from: '"Meadowlark Travel": info@meadowlarktravel.com',
          to: email,
          subject: 'Podziękowanie za rezerwację wycieczki w biurze Meadowlark Travel',
          html: html,
          text: convert(html),
        })
          .then(info => {
            console.log('wysłano! ', info)
            res.render('cart-thank-you', { cart: cart })
          })
          .catch(err => {
            console.error('Nie udało się wysłać potwierdzenia: ' + err.message)
          })
    }
  )
})

app.get('*', (req, res) => {
  // symulacja koszyka
  req.session.cart = {
    items: [
      { id: '82RgrqGCAHqCf6rA2vujbT', qty: 1, guests: 2 },
      { id: 'bqBtwqxpB4ohuxCBXRE9tq', qty: 1 },
    ],
  }
  res.render('04-home')
})


app.get('/', handlers.home)

// obsługa formularzy przesłanych przez przeglądarkę
app.get('/newsletter-signup', handlers.newsletterSignup)
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess)
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou)

// obsługa formularzy typu fetch/JSON
app.get('/newsletter', handlers.newsletter)
app.post('/api/newsletter-signup', handlers.api.newsletterSignup)

// konkurs zdjęć z wakacji
app.get('/contest/vacation-photo', handlers.vacationPhotoContest)
app.get('/contest/vacation-photo-ajax', handlers.vacationPhotoContestAjax)
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
  const form = new multiparty.Form()
  form.parse(req, (err, fields, files) => {
    if(err) return handlers.vacationPhotoContestProcessError(req, res, err.message)
    console.log('got fields: ', fields)
    console.log('and files: ', files)
    handlers.vacationPhotoContestProcess(req, res, fields, files)
  })
})
app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
  const form = new multiparty.Form()
  form.parse(req, (err, fields, files) => {
    if(err) return handlers.api.vacationPhotoContestError(req, res, err.message)
    handlers.api.vacationPhotoContest(req, res, fields, files)
  })
})

app.use(handlers.notFound)
app.use(handlers.serverError)

if(require.main === module) {
  app.listen(port, () => {
    console.log( `Express został uruchomiony pod adresem http://localhost:${port}` +
      '; naciśnij Ctrl-C, aby zakończyć.' )
  })
} else {
  module.exports = app
}
