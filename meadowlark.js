const express = require('express')
const expressHandlebars = require('express-handlebars')

const handlers = require('./lib/handlers')

const app = express()

// konfiguracja silnika widoków Handlebars
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.get('/', handlers.home)

app.get('/about', handlers.about)

// niestandardowa strona 404
app.use(handlers.notFound)

// niestandardowa strona 500
app.use(handlers.serverError)

if(require.main === module) {
  app.listen(port, () => {
    console.log( `Express został uruchomiony pod adresem http://localhost:${port}` +
      '; naciśnij Ctrl-C, aby zakończyć.' )
  })
} else {
  module.exports = app
}
