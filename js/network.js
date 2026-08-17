let database = null; // null perchè deve contenere il JSON che è un oggetto complesso
let tuttiIProtagonisti = []; // [] perchè conterrà un array
let tutteLeOrganizzazioni = [];
let cy = null;

async function caricaDatabase() {
    const response = await fetch("json/database.json");
    const data = await response.json();
    
    database = data;
    tuttiIProtagonisti = data.persone;
    tutteLeOrganizzazioni = data.organizzazioni;

    // richiamo le funzioni dentro la dichiarazione di caricaDatabase perchè hanno bisogno dei dei dati per funzionare 
    attivaBottoni();
    collaborazioni(); // richiamo solo la funzione del primo grafo per la pagina iniziale

}

function attivaBottoni() {

    // creo variabile che contiene tutti i bottoni HTML che si trovano dentro un elemento con classe .btn-group
    let tuttiBottoni = document.querySelectorAll('.btn-group button'); 
    // btn-group = classe del contenitore che contiene i bottoni; button = è il contenuto del contenitore

    // avvio ciclo: per ogni bottone trovato...
    for (let i = 0; i < tuttiBottoni.length; i++) {
        let unBottone = tuttiBottoni[i]; // un bottone è il i-esimo bottone che viene analizzato nel ciclo; i = 0 primo bottone, i = 1 secondo bottone ecc

        // ad ogni ciclo viene assegnata al i-esimo bottone la proprietà onclick, che definisco con la funzione anonima
        // quindi ad ogni ciclo prima viene rimossa la class active, poi viene attribuita active solo a "questo", poi viene controllato l'id di "questo" per capire quale grafico far vedere
        unBottone.onclick = function() {  // funzione anonima = non ha un nome proprio, viene assegnata direttamente alla proprietà onclick
            for (let j = 0; j < tuttiBottoni.length; j++) {
                tuttiBottoni[j].classList.remove('active');
            } // 1 avvio ciclo per togliere a tutti i bottoni la classe active 

            // 2 metto la classe active solo al bottone selezionato
            // this è il bottone che è stato cliccato
            this.classList.add('active');
 
            // 3 controllo l'id di "questo" bottone
            if (this.id === 'btn-collab') { // se l'id di "this" è uguale e dello stesso tipo di btn-collab avvio il grafo delle collaborazioni
                collaborazioni();
            } else if (this.id === 'btn-resp') {
                responsabilita();
            } else if (this.id === 'btn-flusso') {
                flusso();
            }
        };
    }
}

// GRAFO 1: PROTAGONISTA <-> PROTAGONISTA
function collaborazioni() {
    const elementi = []; // variabile vuota (array) che conterrà i nodi (protagonisti) e gli archi (linee)

    // primo ciclo = crea i nodi (protagonisti)
    for (let i = 0; i < tuttiIProtagonisti.length; i++) {
        const protagonista = tuttiIProtagonisti[i]; // protagonista = il protagonista che viene analizzato nel i-esimo ciclo

        elementi.push({ // metto nella variabile "elementi" i dati per ogni protagonista
            data: {
                id: protagonista.id,
                label: protagonista.nome + " " + protagonista.cognome,
                type: 'protagonista',
                info: protagonista.note_bio
            }
        });
    }
    
    // secondo ciclo = crea gli archi (linee)
    for (let j = 0; j < tuttiIProtagonisti.length; j++) { // faccio passare tutti i protagonisti
        const protagonista = tuttiIProtagonisti[j]; // protagonista che viene analizzato nel j-esimo ciclo
        // se nel JSON nell'array del j-esimo protagonista esiste un array chiamato id_persone (elenco degli id delle persone correlate)...
        if (protagonista.id_persone) {
            // ... avvio un ciclo che fa passare l'array delle persone correlate alla j-esima persona (per tutta la lunghezza dell'elenco degli id correlati)
            for (let k = 0; k < protagonista.id_persone.length; k++) {
                // estraggo l'ID della persona correlata che sto analizzando nel k-esimo giro
                const correlazione = protagonista.id_persone[k];
                // metto nella variabile "elementi" i dati per le linee (da... a...)
                elementi.push({
                    data: { 
                            source: protagonista.id, // id da cui parte la linea
                            target: correlazione //
                        }
                });
            }
        }
    }

    disegna(elementi, 'circle'); // disegno il grafo caricando i dati che ho appena calcolato e con il layout circle
}

// GRAFO 2: PROTAGONISTA <-> ORGANIZZAZIONI
function responsabilita() {
    const elementi = []; // variabile vuota (array) che conterrà i nodi (protagonisti e organizzazioni) e gli archi (linee)
    
    // primo ciclo = crea i nodi dei protagonisti
    for (let i = 0; i < tuttiIProtagonisti.length; i++) {
        const protagonista = tuttiIProtagonisti[i]; // protagonista = il protagonista che viene analizzato nel i-esimo ciclo

        elementi.push({ // metto nella variabile "elementi" i dati per ogni protagonista
            data: {
                id: protagonista.id,
                label: protagonista.nome + " " + protagonista.cognome,
                type: 'protagonista',
                info: protagonista.ruolo
            }
        });
    }

    // secondo ciclo = crea i nodi delle organizzazioni
    for (let i = 0; i < tutteLeOrganizzazioni.length; i++) {
        let org = tutteLeOrganizzazioni[i]; // org = l'organizzazione che viene analizzato nel i-esimo ciclo

        elementi.push({ // metto nella variabile "elementi" i dati per ogni protagonista
            data: {
                id: org.id,
                label: org.nome_org,
                type: org.tipologia_org,
                info: org.note_org
            }
        });
    }

    // terzo ciclo = crea gli archi (linee)
    for (let k = 0; k < tuttiIProtagonisti.length; k++) {
        const p = tuttiIProtagonisti[k];

        if (p.id_istituzioni) {
            for (let l = 0; l < p.id_istituzioni.length; l++) {
                elementi.push({
                    data: { 
                            source: p.id, 
                            target: p.id_istituzioni[l] 
                        }
                });
            }
        }

        if (p.id_rifugi) {
            for (let m = 0; m < p.id_rifugi.length; m++) {
                elementi.push({
                    data: { 
                            source: p.id, 
                            target: p.id_rifugi[m] 
                        }
                });
            }
        }

        if (p.id_enti) {
            for (let n = 0; n < p.id_enti.length; n++) {
                elementi.push({
                    data: { 
                            source: p.id, 
                            target: p.id_enti[n] 
                        }
                });
            }
        }
    }

    // Una volta raccolto tutto, disegnamo il grafo
    disegna(elementi, 'concentric');
}

// GRAFO 3: ISTITUZIONI <-> RIFUGI
function flusso() {
    const elementi = []; // variabile vuota (array) che conterrà i nodi (istituzioni e rifugi) e gli archi (linee)
    
    // primo ciclo = crea i nodi delle organizzazioni
    for (let j = 0; j < tutteLeOrganizzazioni.length; j++) {
        const org = tutteLeOrganizzazioni[j]; // org = j-esima organizzazione dell'array
        
        const categoria = org.tipologia_org;
        if (categoria === "istituzione" || categoria === "rifugio") { // solo se è un'istituzione o un rifugio
            elementi.push({
                data: {
                    id: org.id,
                    label: org.nome_org,
                    type: org.tipologia_org, 
                    info: org.note_org
                }
            });
        }
    }

    // secondo ciclo = crea le linee
    // ciclo che fa scorrere tutte le organizzazioni
    for (let k = 0; k < tutteLeOrganizzazioni.length; k++) {
        const rifugio = tutteLeOrganizzazioni[k];

        // se nel JSON questa organizzazione ha una lista di istituzioni correlate (id_istituzioni)
        // e se la tipologia coincide con rifugio
        if (rifugio.id_istituzioni && rifugio.tipologia_org === "rifugio") {

            
            // avvio il ciclo per scorrere la lista di ID delle istituzioni correlate al k-esimo rifugio
            for (let l = 0; l < rifugio.id_istituzioni.length; l++) {
                const istituzione = rifugio.id_istituzioni[l]; // istituzione = id dell'istituzione

                elementi.push({
                    data: {
                        source: rifugio.id,
                        target: istituzione
                    }
                });
            }
        }
    }

    // chiamo la funzione per disegnare il grafo
    disegna(elementi, 'breadthfirst');
}

// dichiaro la funzione che disegna i grafi e riceve come parametro gli elementi che ho calcolato nelle funzioni prima e il tipo di layout
function disegna(elementi, nameLayout) {
    if (cy) {cy.destroy()}
    
    cy = cytoscape({
        container: document.getElementById('network'), // dove inserire il grafo nell'html
        elements: elementi, // i dati che deve visualizzare calcolati con le precedenti funzioni
        style: [
            {
                selector: 'node', // caratteristiche di tutti i nodi
                style: {
                    'label': 'data(label)', // apre l'oggetto data e va a guardare label
                    'text-valign': 'bottom', // mette il nome del nodo sotto al pallino
                    'font-size': '10px', // grandezza della scritta
                    'width': 22, // larghezza e altezza del nodo
                    'height': 22,
                    'text-margin-y': '5px', // distanza del nome dal noto in verticale
                    'color': '#000000' // colore della scritta
                }
            },

            { 
                // node[proprietà="valore"], cerca tra tutti i nodi la proprietà che è uguale a protagonista
                selector: 'node[type="protagonista"]', // caratteristiche specifiche dei vari tipi di nodi (colore e forma)
                style: { 
                    'background-color': '#d4a42a' 
                } 
            },
            
            { 
                selector: 'node[type="istituzione"]', 
                style: { 
                    'background-color': '#800000', 
                    'shape': 'round-rectangle' 
                } 
            },
            
            { 
                selector: 'node[type="ente-pubblico"]', 
                style: { 
                    'background-color': '#3a3aab', 
                    'shape': 'round-hexagon' 
                } 
            },
            
            { 
                selector: 'node[type="rifugio"]', 
                style: { 
                    'background-color': '#305f57', 
                    'shape': 'round-diamond' 
                } 
            },
            
            { 
                selector: 'node[type="organizzazione"]', 
                style: { 
                    'background-color': '#6c757d' 
                } 
            },
            
            {
                selector: 'edge',
                style: {
                    'width': 1.5,
                    'line-color': '#ced4da',
                    'curve-style': 'bezier', // linea leggermente curvata
                    'target-arrow-shape': 'triangle', // freccia
                    'target-arrow-color': '#ced4da'
                }
            }
        ],

        layout: { 
                    name: nameLayout,
                    padding: 40,
                    nodeRepulsion: 4000000,
                    animate: true
        }
    });

    // cy.on = dice al grafo di aspettare che si verifichi un evento
    // tap = comando universale per il click -> l'evento
    // selector = node -> quindi quando viene cliccato un nodo
    cy.on('tap', 'node', function(evt) { // funzione che definisce l'azione da compiere; evt qabbreviaizone di event è il parametro
        const dataPerSidebar = evt.target.data(); // evt.target = il target dell'evento (lo specifico nodo che viene cliccato); .data() va a prendere in data i dati relativi (id, label, type, info)
        aggiornaSidebar(dataPerSidebar); // passa i dati alla funzione che li mostra sulla barra laterale
    });
}

function aggiornaSidebar(dataPerSidebar) {
    const sidebar = document.getElementById('info'); // recupero dall'html dove devo mettere la barra laterale per le info
    if (!sidebar) return; // se non trova un id che si chiama info si ferma

    sidebar.innerHTML = `
        <div class="p-2">
            <!--inserisce nella barra laterale type label e info -->
            <!-- type = il tipo di nodo, se non lo strova (||) scrive semplicemente Nodo; stessa cosa per info -->        
            <span class="badge bg-secondary mb-2 text-uppercase">${dataPerSidebar.type || 'Nodo'}</span>
            <h6>${dataPerSidebar.label}</h6>
            <hr>
            <p class="small" style="text-align:justify">${dataPerSidebar.info || "Informazione non disponibile."}</p>
        </div>
    `;
}

caricaDatabase();