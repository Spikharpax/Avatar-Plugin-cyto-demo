/*
  See http://js.cytoscape.org/  for further explanation and possibilities about CytoScape
  See https://electronjs.org/docs for further explanation and possibilities about Electron (Menu, dialog box, etc...)
  Stéphane Bascher
  avatar.home.automation@gmail.com
  Demo plugin to test cyto-avatar librairy
*/


const {Graph} = require('cyto-avatar');
const {remote} = require('electron');
const {Menu, BrowserWindow} = remote;

// global Graph
let cyto;

// juste pour la démo
// compteur d'éléments
let num = 2;

// Exécution synchrone après la création du graph cytoscape dans l'interface Avatar
// @param  {Object}   CY    An instance of Cytoscape.js corresponds to the graph
exports.addPluginElements = function(CY){

    // init variable globale module Graph
    cyto = new Graph (CY, __dirname);

    // Chargement des éléments sauvegardés
    cyto.loadAllGraphElements()
    .then(elems => {

      // Test sur la collection pour ajout d'événements
      elems.forEach(function(ele) {

        if (ele.hasClass('clickme')) {
          cyto.onClick(ele, (evt) => { // Ajout d'un event click si l'élément appartient à la classe 'clickme'
                // Ici pour test: Ajoute des éléments
                addTestElement();
          })
          .then(elem => cyto.onRightClick(elem, (evt) => { // Ajout d'un event rightClick si l'élément appartient à la classe 'clickme'
              // Ici pour test: on affiche un menu
              showClickMeContextMenu(evt);
          }))
        }

        // Ajout des event click et rightclick si les éléments appartiennentt à la classe 'test'
        if (ele.hasClass('test')) {
          if (ele.id() == 'test3') // click seulement pour l'id test3
            cyto.onClick(ele, (evt) => {
              // Ici pour test: on selectionne ou déselectionne l'elément
              cyto.selectElement(evt, !cyto.isElementSelected(evt))
            })

            // menu contextuel pour tous les elements de la classe test
            cyto.onRightClick(ele, (evt) => {
                // Ici pour test: on affiche un menu
                showTestContextMenu(evt);
            })
        }
      })
    })
    .catch(err => {
      console.log('Error loading Elements', err);
    })

    // Passé une fois pour sauvegarder l'élément clickme
    //addClickMe();
}


// Exécution synchrone lorsque Avatar se ferme
// @param  {function}   callback   Chains all onAvatarClose plugin functions when Avatar is closing
exports.onAvatarClose = function(callback){

  // Pour exemple: Sauvegarde seulement les éléments de classe 'cyto' (ici, l'élément 'clickme')
  cyto.saveAllGraphElements("cyto")
  .then(() => {
    // Obligatoire,
    // chaine onAvatarClose pour tous les plugins
    callback();
  })
  .catch(err => {
    console.log('Error saving Elements', err)
    // Obligatoire,
    // chaine onAvatarClose pour tous les plugins
    callback();
  })

}


// Fonction de création de l'élément clickme
// @param  none
function addClickMe () {

      cyto.getGraph()
      .then(cy => cyto.addGraphElement(cy, "ClickMe"))
      .then(elem => cyto.addElementClass(elem, "cyto"))
      .then(elem => cyto.addElementClass(elem, "clickme"))
      .then(elem => cyto.addElementImage(elem, __dirname+"/assets/images/clickme.png"))
      .then(elem => cyto.addElementSize(elem, 60))
      .then(elem => cyto.addElementRenderedPosition(elem, 100, 100))
      .catch(err => {
        console.log('err:', err || 'erreur dans la création de l\'élément')
      })

}


// Fonction de création des éléments 1 et 2
// @param  none
function addTestElement () {

    if (num <= 3) { // Compteur de création. Seulement 2 éléments pour la démo
      cyto.getGraph()
      .then(cy => cyto.addGraphElement(cy, "test"+num.toString()))
      .then(elem => cyto.addElementClass(elem, "test"))
      .then(elem => cyto.addElementImage(elem, __dirname+'/assets/images/'+num.toString()+'.png'))
      .then(elem => cyto.addElementFont(elem,
              { 'font-family': "cursive",
                'font-size': "14px",
                'color': "white",
                'text-wrap': "wrap",
                'text-valign': "bottom",
                'text-halign': "center",
                'text-margin-y': "5px",
                'text-margin-x': "0px",
                'text-outline-width': 3,
                'text-outline-color': "rgba(86, 87, 85, 1)",
                'text-opacity': 0.8 }))
      .then(elem => cyto.addElementName(elem, ((num == 2) ? 'Avec menu contextuel\n(click droit)' : "Avec menu contextuel\n(click droit)\net click gauche")))
      .then(elem => cyto.addElementSize(elem, 60))
      .then(elem => cyto.addElementRenderedPosition(elem, 100, ((100 * num) + 30)))
      .then(elem => cyto.addElementBorder(elem, "rgba(226, 45, 17, 1)", 6))
      .then(elem => cyto.selectElement(elem, false))
      .then(elem => {
         return new Promise((resolve, reject) => {
            if (num == 3) // Seulement pour l'élément 2
              cyto.onClick(elem, (evt) => {
                  // Faire une action au clic
                  // Ici pour test: on selectionne ou déselectionne l'elément
                  cyto.selectElement(evt, !cyto.isElementSelected(evt))
            })
            resolve(elem);
          });
      })
      .then(elem => cyto.onRightClick(elem, (evt) => {
          // Faire une action au clic droit
          // Ici pour test: on affiche un menu
          showTestContextMenu(evt);
      }))
      .then(()=> {
        num = num + 1; // Incrément du compteur
      })
      .catch(err => {
        console.log('err:', err || 'erreur dans la création du node')
      })
    } else {
      let win = BrowserWindow.getFocusedWindow();
      remote.dialog.showMessageBox(win, {
        type: 'info',
        title: "Démo Cyto",
        message: "Vous avez atteint la limite de création !",
        detail: 'Utilisez la suppression dans le menu du clickme pour recommencer ou supprimez les éléments 1 à 1 par leurs menus.'
      })
    }

}


exports.action = function(data, next){

  next();

}


// fonction de menu contextuel pour les éléments 1 et 2
function showTestContextMenu(elem) {

    let pluginMenu = [
      {
          label: (cyto.isElementSelected(elem) ? 'Déselectionner' : 'Sélectionner'),
          click: () => {cyto.selectElement(elem, !cyto.isElementSelected(elem))}
      },
      {type: 'separator'},
      {
          label: (cyto.isElementLocked(elem) ? 'Déverrouiller' : 'Vérrouiller'),
          //icon: "path/monicon.png",
          click: () => {cyto.lockElement(elem, !cyto.isElementLocked(elem))}
      },
      {type: 'separator'},
      {
          label: "Réinitialiser la position",
          //icon: "path/monicon.png",
          click: () => {
              let pos = elem.id().substring(4);
              cyto.addElementRenderedPosition(elem, 100, ((100 *  parseInt(pos)) + 30))
            }
      },
      {type: 'separator'},
      {
          label: 'Supprimer l\'élément',
          //icon: "path/monicon.png",
          enabled: (elem.id() == ('test'+(num-1).toString())) ? true : false,
          click: () => {
              cyto.removeGraphElementByID(elem.id());
              num = num - 1;
          }
      }
    ];

    // Création du menu
    var handler = function (e) {
      e.preventDefault();
      menu.popup({window: remote.getCurrentWindow()});
      window.removeEventListener('contextmenu', handler, false);
    }
    const menu = Menu.buildFromTemplate(pluginMenu);
    window.addEventListener('contextmenu', handler, false);
}



// fonction de menu contextuel pour l'élément clickme
function showClickMeContextMenu(elem) {
    let pluginMenu = [
      {
          label: 'Supprimer tous les éléments test',
          //icon: "path/monicon.png",
          enabled: (num !=2) ? true : false,
          click: () => {
              cyto.removeGraphElementsByClass('test');
              num = 2;
          }
      },
      {type: 'separator'},
      {
          label: 'Tester la fonction OnAvatarClose', // F11 pour Avatar console
          //icon: "path/monicon.png",
          click: () => {Avatar.Interface.onAvatarClose(0, function() {
            console.log('ok sauvegardé !');
          })}
      }
    ];

    // Création du menu
    var handler = function (e) {
      e.preventDefault();
      menu.popup({window: remote.getCurrentWindow()});
      window.removeEventListener('contextmenu', handler, false);
    }
    const menu = Menu.buildFromTemplate(pluginMenu);
    window.addEventListener('contextmenu', handler, false);
}
