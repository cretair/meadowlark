module.exports = (req, res, next) => {
	// jeśli dostępny jest komunikat flash, przenieśmy go
  // do kontekstu, a następnie wyczyśćmy
	res.locals.flash = req.session.flash
	delete req.session.flash
	next()
}
