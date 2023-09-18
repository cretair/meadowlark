const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

// konfiguracja silnika widoków Handlebars
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'))

const port = process.env.PORT || 3000

app.get('/', (req, res) => res.render('home'))

const fortunes = [
  "Conquer your fears or they will conquer you.",
  "Rivers need springs.",
  "Do not fear what you don't know.",
  "You will have a pleasant surprise.",
  "Whenever possible, keep it simple.",
]

app.get('/about', (req, res) => {
  const randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)]
  res.render('about', { fortune: randomFortune })
})

// niestandardowa strona 404
app.use((req, res) => {
  res.status(404)
  res.render('404')
})

// niestandardowa strona 500
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500)
  res.render('500')
})

app.listen(port, () => console.log(
  `Express został uruchomiony pod adresem http://localhost:${port}; ` +
  `naciśnij Ctrl-C, aby zakończyć.`))