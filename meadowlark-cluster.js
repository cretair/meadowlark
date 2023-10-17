const cluster = require('cluster')

function startWorker() {
  const worker = cluster.fork()
  console.log(`Klaster: Węzeł roboczy ${worker.id} zaczął działanie`)
}

if(cluster.isMaster){

  require('os').cpus().forEach(startWorker)

  // rejestrujemy wszystkie robocze węzły, które się odłączają; jeśli taki węzeł się odłączy
  // powinien zakończyć działanie, a zatem będziemy czekać, aż zdarzenie utworzy
  // nowy węzeł roboczy, który zastąpi poprzedni
  cluster.on('disconnect', worker => console.log(
    `Klaster: Węzeł roboczy ${worker.id} odłączył się od klastra.`
  ))

  // gdy węzeł roboczy kończy działanie (wywołuje zdarzenie exit), tworzymy węzeł roboczy,
  // który zastąpi poprzedni
  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `Klaster: Węzeł roboczy ${worker.id} zakończył działanie zdarzeniem exit ` +
      `kod ${code} (${signal})`
    )
    startWorker()
  })

} else {

    const port = process.env.PORT || 3000
    // uruchamiamy aplikację w węźle roboczym; patrz meadowlark.js
    require('./meadowlark.js')(port)

}
