const credentials = require('./credentials')

const { Client } = require('pg')
//const { connectionString } = ('postgres://yobyeoht:GAgeFpXwaIqGSa8dzt2e5F5x78jeaBpo@trumpet.db.elephantsql.com/yobyeoht')
const conString = "postgres://yobyeoht:GAgeFpXwaIqGSa8dzt2e5F5x78jeaBpo@trumpet.db.elephantsql.com/yobyeoht" 
//const client = new Client({ connectionString })
const client = new Client({ conString })
const createScript = `
  CREATE TABLE IF NOT EXISTS vacations (
    name varchar(200) NOT NULL,
    slug varchar(200) PRIMARY KEY,
    category varchar(50),
    sku varchar(20),
    description text,
    location_search varchar(100) NOT NULL,
    location_lat double precision,
    location_lng double precision,
    price money,
    tags jsonb,
    in_season boolean,
    available boolean,
    requires_waiver boolean,
    maximum_guests integer,
    notes text,
    packages_sold integer
  );
  CREATE TABLE IF NOT EXISTS vacation_in_season_listeners (
    email varchar(200) NOT NULL,
    sku varchar(20) NOT NULL,
    PRIMARY KEY (email, sku)
  );
`

const getVacationCount = async client => {
  const { rows } = await client.query('SELECT COUNT(*) FROM VACATIONS')
  return Number(rows[0].count)
}

const seedVacations = async client => {
  const sql = `
    INSERT INTO vacations(
      name,
      slug,
      category,
      sku,
      description,
      location_search,
      price,
      tags,
      in_season,
      available,
      requires_waiver,
      maximum_guests,
      notes,
      packages_sold
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `
  await client.query(sql, [
    'Jednodniowa wycieczka do Hood River',
    'hood-river-day-trip',
    'Jednodniowa wycieczka',
    'HR199',
    'Spędź dzień na żeglowaniu po Kolumbii i rozkoszuj się rzemieślniczymi piwami w Hood River!',
    'Hood River, Oregon, USA',
    99.95,
    `["jednodniowa wycieczka", "hood river", "żeglowanie", "windsurfing", "browary"]`,
    true,
    true,
    false,
    16,
    null,
    0,
  ])
  await client.query(sql, [
    'Krótki urlop na wybrzeżu Oregonu',
    'oregon-coast-getaway',
    'Wycieczka weekendowa',
    'OC39',
    'Rozkoszuj się powietrzem znad oceanu oraz urokiem nadbrzeżnych miasteczek!!',
    'Cannon Beach, Oregon, USA',
    269.95,
    JSON.stringify(['wycieczka weekendowa', 'wybrzeże oregonu', 'plażowanie']),
    false,
    true,
    false,
    8,
    '',
    0,
  ])
  await client.query(sql, [
    'Wspinaczka skałkowa w Bend',
    'rock-climbing-in-bend',
    'Przygoda',
    'B99',
    'Przeżyj dreszcz emocji podczas wspinaczki na pustyni.',
    'Bend, Oregon, USA',
    289.95,
    JSON.stringify(['wycieczka weekendowa ', 'bend', 'pustynia', 'wspinaczka skałkowa']),
    true,
    true,
    true,
    4,
    'Przewodnik wycieczki obecnie dochodzi do zdrowia po wypadku narciarskim.',
    0,
  ])
}

client.connect().then(async () => {
  try {
    console.log('tworzenie schemata bazy danych')
    await client.query(createScript)
    const vacationCount = await getVacationCount(client)
    if(vacationCount === 0) {
      console.log('seeding vacations')
      await seedVacations(client)
    }
  } catch(err) {
    console.log('ERROR: nie udało się zainicjalizować bazy danych')
    console.log(err.message)
  } finally {
    client.end()
  }
})
