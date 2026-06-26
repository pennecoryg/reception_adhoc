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
    
    const colonnesMinuscules = ["N° de tracking", "Désignation", "Référence"];

    data_LEB = data.LEB.map(row => {
      let obj = {};
      
      Object.keys(row).forEach(key => {
        const cleanKey = key.trim();
        
        let valeur = String(row[key] || "")
          .replace(/\r/g, "")
          .trim();

        if (!colonnesMinuscules.includes(cleanKey)) {
          valeur = valeur.toUpperCase();
        }

        obj[cleanKey] = valeur;
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

  // ✅ Maintenant les données sont chargées, on peut remplir les datalists
  
  

  
  

  //--------------------------------------------------------------------------------//
  //------------------------------------Variables-----------------------------------//
  //--------------------------------------------------------------------------------//

  // On récupère les éléments HTML par leur ID
  const inputEB = document.getElementById("inputEB");
  const inputLEB = document.getElementById("inputLEB");
  const inputStatut = document.getElementById("inputStatut");
  const inputcriticite = document.getElementById("inputCriticite");
  const inputvalideur = document.getElementById("inputValideur");
  const inputPON = document.getElementById("inputPON");
  const inputfournisseur = document.getElementById("inputFournisseur");
  const inputsemaine = document.getElementById("inputSemaine");
  const btnValider = document.getElementById("btnValider")
  const btnEffacer = document.getElementById("btnEffacer")
  const checkCloturees = document.getElementById("checkCloturees");


  //-------------------------------------------------------------------------------//
  //--------------------------------------Main-------------------------------------//
  //-------------------------------------------------------------------------------//

  // Ajout de l'info nb LEB cloturées dans EB pour chaque ligne

  for (const row of data_LEB) {
    const eb = row["Expression du besoin_x003a_ Expression du besoin"];

    const groupe = data_LEB.filter(
        r => r["Expression du besoin_x003a_ Expression du besoin"] === eb
    );

    const total = groupe.length;

    const cloturees = groupe.filter(
        r => r["Statut client"] === "CLÔTURÉ"
    ).length;

    row["nb LEB cloturées dans EB"] = `${cloturees}/${total}`;
  }

  // On supprime les EB entièrement clôturées
  
  data_LEB = data_LEB.filter(row => {
      const [cloturees, total] = row["nb LEB cloturées dans EB"]
          .split("/")
          .map(Number);

      return cloturees !== total;
  });

  // /!\/!\/!\/!\/!\/!\/!\/!\ PRISE EN COMPTE OU NON DES LIGNES AVEC LEB CLOTUREES/!\/!\/!\/!\/!\/!\/!\/!\ 
  function getDataFiltree() {                                                   ///!\/!\/!\/!\/!\/!\/!\/!\
    if (checkCloturees.checked) {                                               ///!\/!\/!\/!\/!\/!\/!\/!\
      return data_LEB;                                                          ///!\/!\/!\/!\/!\/!\/!\/!\
    }                                                                           ///!\/!\/!\/!\/!\/!\/!\/!\
                                                                                ///!\/!\/!\/!\/!\/!\/!\/!\
    return data_LEB.filter(                                                     ///!\/!\/!\/!\/!\/!\/!\/!\
      row => row["Statut client"] !== "CLÔTURÉ"                                 ///!\/!\/!\/!\/!\/!\/!\/!\
    );                                                                          ///!\/!\/!\/!\/!\/!\/!\/!\
  }                                                                             ///!\/!\/!\/!\/!\/!\/!\/!\
                                                                                ///!\/!\/!\/!\/!\/!\/!\/!\
  // /!\/!\/!\/!\/!\/!\/!\/!\ PRISE EN COMPTE OU NON DES LIGNES AVEC LEB CLOTUREES/!\/!\/!\/!\/!\/!\/!\/!\    
  function lancerRemplissage() {
    remplirTableau();
  }

  lancerRemplissage();
  
  btnEffacer.onclick = function () {
    inputEB.value = "";
    inputLEB.value = "";
    inputStatut.value = "";
    inputcriticite.value = "";
    inputvalideur.value = "";
    inputPON.value = "";
    inputfournisseur.value = "";
    inputsemaine.value = "";
    lancerRemplissage();
    }

  checkCloturees.onchange =  function () {
    lancerRemplissage();
  }



  // Première condition du lancement de remplissage de tableau avec bouton valider
  btnValider.onclick = lancerRemplissage;


  // Deuxième condition du lancement de remplissage de tableau avec touche entrer
  [inputEB, inputLEB, inputStatut, inputcriticite, inputvalideur, inputPON, inputfournisseur, inputsemaine].forEach(input => {
    input.addEventListener("keydown", function (e) {if (e.key === "Enter") {lancerRemplissage();}
    });
  });


  function mettreAJourDatalist(lignes) {
    // Remplir la liste des EB
    const EB_disp = [...new Set(lignes.map(item => excelDateHeureVersDate(item["Expression du besoin_x003a_ Expression du besoin"])))].filter(m => m).sort();
    const EBDatalist = document.getElementById("EBList");
    EBDatalist.innerHTML = "";
    EB_disp.forEach(EB => {
      const option = document.createElement("option");
      option.value = EB;
      EBDatalist.appendChild(option);
    });


    // Remplir la liste des LEB
    const LEB_disp = [...new Set(lignes.map(item => item["Ligne d'expression du besoin"]))].filter(m => m).sort();
    const LEBDatalist = document.getElementById("LEBList");
    LEBDatalist.innerHTML = "";
    LEB_disp.forEach(LEB => {
      const option = document.createElement("option");
      option.value = LEB;
      LEBDatalist.appendChild(option);
    });

    // Remplir la liste des statuts
    const statut_disp = [...new Set(lignes.map(item => item["Statut client"]))].filter(m => m).sort();
    const StatutDatalist = document.getElementById("StatutList");
    StatutDatalist.innerHTML = "";
    statut_disp.forEach(criticite => {
      const option = document.createElement("option");
      option.value = criticite;
      StatutDatalist.appendChild(option);
    });

    // Remplir la liste des criticités
    const criticite_disp = [...new Set(lignes.map(item => item["Priorité"]))].filter(m => m).sort();
    const CriticiteDatalist = document.getElementById("CriticiteList");
    CriticiteDatalist.innerHTML = "";
    criticite_disp.forEach(criticite => {
      const option = document.createElement("option");
      option.value = criticite;
      CriticiteDatalist.appendChild(option);
    });


    // Remplir la liste des valideurs
    const valideur_disp = [...new Set(lignes.map(item => item["Valideur_x003a_ Nom complet"]))].filter(m => m).sort();
    const ValideurDatalist = document.getElementById("ValideurList");
    ValideurDatalist.innerHTML = "";
    valideur_disp.forEach(valideur => {
      const option = document.createElement("option");
      option.value = valideur;
      ValideurDatalist.appendChild(option);
    });


    // Remplir la liste des PON
    const PON_disp = [...new Set(lignes.map(item => item["Commentaires suivi"]))].filter(m => m).sort();
    const PONDatalist = document.getElementById("PONList");
    PONDatalist.innerHTML = "";
    PON_disp.forEach(PON => {
      const option = document.createElement("option");
      option.value = PON;
      PONDatalist.appendChild(option);
    });
    

    // Remplir la liste des fournisseurs
    const fournisseur_disp = [...new Set(lignes.map(item => item.Fournisseur))].filter(m => m).sort();
    const FournisseurDatalist = document.getElementById("FournisseurList");
    FournisseurDatalist.innerHTML = "";
    fournisseur_disp.forEach(fournisseur => {
      const option = document.createElement("option");
      option.value = fournisseur;
      FournisseurDatalist.appendChild(option);
    });


    // Remplir la liste des semaines
    const semaine_disp = [...new Set(lignes.map(row => {const dateUtilisee = row["Date report de délai"] || row["Date prévue de réception selon ARC"];return getSemaineISO(dateUtilisee);}))].filter(m => m).sort();
    const SemaineDatalist = document.getElementById("SemaineList");
    SemaineDatalist.innerHTML = "";
    semaine_disp.forEach(semaine => {
      const option = document.createElement("option");
      option.value = semaine;
      SemaineDatalist.appendChild(option);
    });

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
        const heures = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        return date.toLocaleDateString("fr-FR") + " " + heures + ":" + minutes;
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
    let data_to_take = getDataFiltree();  
    const tbody = document.getElementById("resultsTableau");
    tbody.innerHTML = "";

    const valeursRenseignees = {
        EB:          inputEB.value.trim().toUpperCase(),
        LEB:         inputLEB.value.trim().toUpperCase(),
        Statut:      inputStatut.value.trim().toUpperCase(),
        criticite:   inputcriticite.value.trim().toUpperCase(),
        valideur:    inputvalideur.value.trim().toUpperCase(),
        PON:         inputPON.value.trim().toUpperCase(),
        fournisseur: inputfournisseur.value.trim().toUpperCase(),
        semaine:     inputsemaine.value.trim().toUpperCase(),
    };

    // Correspondance entre les clés et les colonnes du JSON
    const correspondance = {
        EB:          "Expression du besoin_x003a_ Expression du besoin",
        LEB:         "Ligne d'expression du besoin",
        Statut:      "Statut client",
        criticite:   "Priorité",
        valideur:    "Valideur_x003a_ Nom complet",
        PON:         "Commentaires suivi",
        fournisseur: "Fournisseur",
        };

    // Filtrage
    const lignesFiltrees = data_to_take.filter(row => {    // /!\ ATTENTION : Ici on ne prend plus Data_LEB mais data_to_take 
        return Object.entries(valeursRenseignees).every(([cle, val]) => {
        if (!val) return true;
        if (cle === "EB") {
          const valeurLigneEB = row[correspondance[cle]] || "";
          const dateLigneEB = excelDateHeureVersDate(valeurLigneEB);
          return dateLigneEB !== null && String(dateLigneEB) === val;
        }
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
    })


    // Tri de l'EB du plus vieux au plus récent 
    .sort((a, b) => {
    const dateA = a["Expression du besoin_x003a_ Expression du besoin"];
    const dateB = b["Expression du besoin_x003a_ Expression du besoin"];
    return dateA - dateB; // du plus vieux au plus récent
    });

    // Mettre à jour les datalists APRÈS le filtrage
    mettreAJourDatalist(lignesFiltrees);

    // Remplissage du tableau
    lignesFiltrees.forEach(row => {
        const tr = document.createElement("tr");
        if (row["Priorité"] === "BLOQUANT") {
          tr.classList.add("bloquant");
        }
        tr.innerHTML = `
            <td>${excelDateHeureVersDate(row["Expression du besoin_x003a_ Expression du besoin"])|| ""}</td>
            <td>${row["nb LEB cloturées dans EB"] || ""}</td>
            <td>${row["Ligne d'expression du besoin"] || ""}</td>
            <td>${row["Statut client"] || ""}</td>
            <td>${row["Priorité"] || ""}</td>
            <td>${row["Demandeur_x003a_ Nom complet"] || ""}</td>
            <td>${row["Lieu de livraison du besoin"].split("PL-AH_")[1] || ""}</td>
            <td>${["1","1.0",1].includes(row["Livraison partielle souhaitée"]) ? "OUI" : ["0","0.0",0].includes(row["Livraison partielle souhaitée"]) ? "NON" : ""}</td>
            <td>${row["Quantité"] || ""}</td>
            <td>${row["Commentaires suivi"] || ""}</td>
            <td>${row["Fournisseur"] || ""}</td>
            <td>${excelDateVersDate(row["Date report de délai"] || row["Date prévue de réception selon ARC"]) || ""}</td>
            <td>${row["Référence"] || ""}</td>
            <td>${row["Désignation"] || ""}</td>
            <td>
              ${row["N° de tracking"] ? `<a href="${row["N° de tracking"]}" target="_blank">${row["N° de tracking"]}</a>` : ""}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

  


})

