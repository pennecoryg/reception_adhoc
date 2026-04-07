//------------------------------------------------------------------------------//
//-------------------------------------DATA-------------------------------------//
//------------------------------------------------------------------------------//

let data_LEBLoaded = false;
let data_LEB = [];

async function chargerDonnees() {
  try {
    const response = await fetch("dataLEB.json");
    const data = await response.json();
    console.log(data); 
    

    // CARTO
    data_LEB = data.LEB.map(row => {
      let obj = {};
      Object.keys(row).forEach(key => {
        obj[key.trim()] = String(row[key] || "")
          .replace(/\r/g, "")
          .trim()
          .toUpperCase();
      });
      return obj;
    });
    
    console.log(Object.keys(data_LEB[0]))
    
    data_LEBLoaded = true;
    console.log("Fichier LEB chargé :", data_LEB);

  } catch (error) {
    console.error("Erreur chargement JSON :", error);
  }
}

chargerDonnees().then(() => {



  //--------------------------------------------------------------------------------//
  //------------------------------------Variables-----------------------------------//
  //--------------------------------------------------------------------------------//

  // On récupère les éléments HTML par leur ID
  const inputLEB = document.getElementById("inputLEB");
  const inputcriticite = document.getElementById("inputCriticite");
  const inputvalideur = document.getElementById("inputValideur");
  const inputPON = document.getElementById("inputPON");
  const inputfournisseur = document.getElementById("inputFournisseur");
  const inputsemaine = document.getElementById("inputSemaine");
  const btnValider = document.getElementById("btnValider")
  const btnEffacer = document.getElementById("btnEffacer")


  //-------------------------------------------------------------------------------//
  //--------------------------------------Main-------------------------------------//
  //-------------------------------------------------------------------------------//
  remplirTableau();


  btnEffacer.onclick = function () {
    inputLEB.value = "";
    inputcriticite.value = "";
    inputvalideur.value = "";
    inputPON.value = "";
    inputfournisseur.value = "";
    inputsemaine.value = "";
    remplirTableau();
    }


  btnValider.onclick = function () {
    remplirTableau();
  }

  
  function excelDateVersDate(serial) {
    if (!serial) return "";
    if (!isNaN(serial)) {
        const date = new Date((Number(serial) - 25569) * 86400 * 1000);
        return date.toLocaleDateString("fr-FR");
    }
    return serial;
  }


  function excelDateHeureVersDate(serial) {
    if (!serial) return "";
    if (!isNaN(serial)) {
        const date = new Date((Number(serial) - 25569) * 86400 * 1000);
        return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"});
    }
    return serial;
  }


  
  // Fonction pour calculer le numéro de semaine en fonction d'une date 
  function getSemaineISO(dateStr) {
    if (!dateStr) return null;
    let date;
    if (!isNaN(dateStr)) {
        // Numéro série Excel
        date = new Date((Number(dateStr) - 25569) * 86400 * 1000);
    } else if (dateStr.includes("/")) {
        const [jour, mois, annee] = dateStr.split("/");
        date = new Date(Date.UTC(Number(annee), Number(mois) - 1, Number(jour)));
    } else {
        date = new Date(dateStr);
    }
    if (isNaN(date)) return null;
    const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const debut = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil((((tmp - debut) / 86400000) + 1) / 7);
  }




  function remplirTableau() {
    const tbody = document.getElementById("resultsTableau");
    tbody.innerHTML = "";

    const valeursRenseignees = {
        LEB:         inputLEB.value.trim().toUpperCase(),
        criticite:   inputcriticite.value.trim().toUpperCase(),
        valideur:    inputvalideur.value.trim().toUpperCase(),
        PON:         inputPON.value.trim().toUpperCase(),
        fournisseur: inputfournisseur.value.trim().toUpperCase(),
        semaine:     inputsemaine.value.trim().toUpperCase(),
    };

    // Correspondance entre les clés et les colonnes du JSON
    const correspondance = {
        LEB:         "Ligne d'expression du besoin",
        criticite:   "Priorité",
        valideur:    "Valideur_x003a_ Nom complet",
        PON:         "Commentaires suivi",
        fournisseur: "Fournisseur",
        };

    // Filtrage
    const lignesFiltrees = data_LEB.filter(row => {
        return Object.entries(valeursRenseignees).every(([cle, val]) => {
        if (!val) return true;
        if (cle === "LEB") {
          const valeurLigneLEB = row[correspondance[cle]] || "";
          const partieAprestiret = valeurLigneLEB.split("LEB-")[1] || "";
          return valeurLigneLEB.includes(val) || partieAprestiret.includes(val);
        }
        if (cle === "PON") {
          const valeurLignePON = row[correspondance[cle]] || "";
          const partieApresPON = valeurLignePON.split("PON")[1] || "";
          return valeurLignePON.includes(val) || partieApresPON.includes(val);
        }
        if (cle === "semaine") {
          const dateUtilisee = row["Date report de délai"] || row["Date prévue de réception selon ARC"];
          const semaineLigne = getSemaineISO(dateUtilisee);
          return semaineLigne !== null && String(semaineLigne) === val;
        }
        return row[correspondance[cle]]?.includes(val);
        });
    });

    // Remplissage du tableau
    lignesFiltrees.forEach(row => {
        const tr = document.createElement("tr");
        if (row["Priorité"] === "BLOQUANT") {
          tr.classList.add("bloquant");
        }
        tr.innerHTML = `
            <td>${excelDateHeureVersDate(row["Expression du besoin_x003a_ Expression du besoin"])|| ""}</td>
            <td>${row["Ligne d'expression du besoin"] || ""}</td>
            <td>${row["Priorité"] || ""}</td>
            <td>${row["Demandeur_x003a_ Nom complet"] || ""}</td>
            <td>${row["Lieu de livraison du besoin"] || ""}</td>
            <td>${["1","1.0",1].includes(row["Livraison partielle souhaitée"]) ? "OUI" : ["0","0.0",0].includes(row["Livraison partielle souhaitée"]) ? "NON" : ""}</td>
            <td>${row["Quantité"] || ""}</td>
            <td>${row["Commentaires suivi"] || ""}</td>
            <td>${row["Fournisseur"] || ""}</td>
            <td>${row["N° de tracking"] || ""}</td>
            <td>${excelDateVersDate(row["Date report de délai"] || row["Date prévue de réception selon ARC"]) || ""}</td>
        `;
        tbody.appendChild(tr);
    });
}

  


})
