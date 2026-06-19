/**
 * NETSENTINEL - Moteur d'interface Front-End
 * Gère le routage Single Page Application (SPA) et les données simulées.
 */

// 1. BASE DE DONNÉES SIMULÉE (Prête pour une future synchronisation Firestore)
const NetSentinelData = {
    global: {
        consommationAujourdhui: "42.8 GB",
        picBandePassante: "184.2 Mbps",
        statutMoteur: "ONLINE",
        version: "v1.0.0-alpha"
    },
    topApplications: [
        { nom: "chrome.exe", pid: 4120, fluxRecu: "16.2 GB", fluxEnvoye: "2.2 GB", part: 65, statut: "Actif" },
        { nom: "docker-daemon", pid: 1082, fluxRecu: "11.8 GB", fluxEnvoye: "300 MB", part: 45, statut: "Actif" },
        { nom: "slack.exe", pid: 8440, fluxRecu: "4.1 GB", fluxEnvoye: "700 MB", part: 18, statut: "En veille" },
        { nom: "discord.exe", pid: 3112, fluxRecu: "2.8 GB", fluxEnvoye: "400 MB", part: 12, statut: "Actif" },
        { nom: "spotify.exe", pid: 5541, fluxRecu: "1.5 GB", fluxEnvoye: "50 MB", part: 5, statut: "En veille" }
    ],
    alertes: [
        { id: 1, titre: "Dépassement de quota de flux critique", description: "Le processus unknown_binary.exe a généré plus de 5 GB de trafic montant en moins de 5 min.", heure: "Aujourd'hui à 15:12", gravite: "Critique", couleur: "danger" },
        { id: 2, titre: "Pic d'activité inhabituel", description: "Le processus docker-daemon dépasse la moyenne horaire de 120%.", heure: "Hier à 22:45", gravite: "Moyen", couleur: "warning" }
    ]
};

// 2. GABARITS HTML DES VUES (Templates injectés dynamiquement)
const VuesHTML = {
    tableau_de_bord: `
        <div class="space-y-8 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass p-6 rounded-2xl">
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Usage Global (Aujourd'hui)</p>
                    <p class="text-3xl font-bold text-white mt-2 font-mono">${NetSentinelData.global.consommationAujourdhui}</p>
                    <div class="mt-2 flex items-center gap-1.5 text-xs text-brand-success">
                        <span>-4.2% par rapport à hier</span>
                    </div>
                </div>
                <div class="glass p-6 rounded-2xl">
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Pic de bande passante</p>
                    <p class="text-3xl font-bold text-brand-accent mt-2 font-mono">${NetSentinelData.global.picBandePassante}</p>
                    <p class="text-xs text-slate-500 mt-2">Détecté à 14:32:01</p>
                </div>
                <div class="glass p-6 rounded-2xl border-l-2 border-l-brand-warning">
                    <p class="text-xs font-semibold uppercase tracking-wider text-brand-warning">Alerte Seuil</p>
                    <p class="text-lg font-semibold text-white mt-2">Quota Data Atteint à 85%</p>
                    <p class="text-xs text-slate-400 mt-1">Seuil configuré : 50 GB / jour</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 glass p-6 rounded-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-sm font-semibold text-white tracking-wide">Analyse des flux temporels (Flux Live)</h3>
                        <span class="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 font-mono">Intervalle : 10s</span>
                    </div>
                    <div class="h-64">
                        <canvas id="mainDashboardChart"></canvas>
                    </div>
                </div>

                <div class="glass p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-white tracking-wide mb-4">Top Applications</h3>
                        <div id="top-apps-list" class="space-y-4">
                            </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    applications: `
        <div class="glass rounded-2xl overflow-hidden animate-fade-in">
            <div class="p-6 border-b border-slate-800/60 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-white">Processus & Applications détectés</h3>
                <input type="text" placeholder="Filtrer par nom de processus..." class="bg-slate-900 border border-slate-800 rounded-lg text-xs px-4 py-2 w-64 focus:outline-none focus:border-brand-accent transition text-slate-300">
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800/40 bg-slate-900/40 text-slate-400 text-xs tracking-wider uppercase">
                            <th class="p-4 font-medium">Application / PID</th>
                            <th class="p-4 font-medium">Données Reçues</th>
                            <th class="p-4 font-medium">Données Envoyées</th>
                            <th class="p-4 font-medium">Charge réseau relative</th>
                            <th class="p-4 font-medium text-right">Statut</th>
                        </tr>
                    </thead>
                    <tbody id="apps-table-body" class="text-xs divide-y divide-slate-800/40 text-slate-300 font-mono">
                        </tbody>
                </table>
            </div>
        </div>
    `,
    alertes: `
        <div class="space-y-6 animate-fade-in">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-white">Historique des seuils et anomalies réseau</h3>
            </div>
            <div id="alertes-container" class="space-y-3">
                </div>
        </div>
    `,
    rapports: `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div class="glass p-6 rounded-2xl h-fit space-y-6">
                <h3 class="text-sm font-semibold text-white">Générateur d'exports analytiques</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-400 mb-1.5">Période d'audit</label>
                        <select class="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-300 focus:outline-none focus:border-brand-accent">
                            <option>Dernières 24 heures</option>
                            <option>7 derniers jours</option>
                        </select>
                    </div>
                </div>
                <button class="w-full py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-brand-accent/10">
                    Compiler et générer le rapport
                </button>
            </div>
            <div class="lg:col-span-2 glass p-6 rounded-2xl space-y-4">
                <h3 class="text-sm font-semibold text-white border-b border-slate-800/60 pb-4">Prévisualisation du flux brut</h3>
                <pre class="bg-[#080C14] rounded-xl p-4 font-mono text-[11px] text-slate-400 h-64 overflow-y-auto border border-slate-900 leading-relaxed"><code>${JSON.stringify(NetSentinelData, null, 2)}</code></pre>
            </div>
        </div>
    `
};

// 3. MOTEUR DE NAVIGATION (ROUTEUR SPA)
function naviguerVers(idPage) {
    const conteneur = document.getElementById('content-viewport');
    const titrePage = document.getElementById('page-title');
    
    if (!conteneur || !VuesHTML[idPage]) return;

    // Injection de la vue
    conteneur.innerHTML = VuesHTML[idPage];

    // Mise à jour du titre de la top bar
    const titres = {
        tableau_de_bord: "Tableau de bord",
        applications: "Applications détections",
        alertes: "Historique des alertes",
        rapports: "Gestion des rapports"
    };
    titrePage.textContent = titres[idPage];

    // Gestion de la classe active sur les boutons de navigation
    document.querySelectorAll('.nav-link').forEach(bouton => {
        const cible = bouton.getAttribute('data-page');
        if (cible === idPage) {
            bouton.className = "nav-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 bg-brand-accent/10 text-brand-accent border border-brand-accent/20";
        } else {
            bouton.className = "nav-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/40 hover:text-white";
        }
    });

    // Post-traitements spécifiques aux pages (Injections de boucles ou graphiques)
    if (idPage === 'tableau_de_bord') {
        genererMiniListeApps();
        if (typeof initDashboardChart === 'function') initDashboardChart();
    } else if (idPage === 'applications') {
        genererTableauCompletApps();
    } else if (idPage === 'alertes') {
        genererListeAlertes();
    }
}

// 4. FONCTIONS DE RENDU DYNAMIQUE DE DONNÉES
function genererMiniListeApps() {
    const cible = document.getElementById('top-apps-list');
    if (!cible) return;
    
    cible.innerHTML = NetSentinelData.topApplications.slice(0, 3).map(app => `
        <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-medium">
                <span class="text-slate-300">${app.nom}</span>
                <span class="text-slate-400 font-mono">${app.fluxRecu}</span>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-brand-accent h-full rounded-full" style="width: ${app.part}%"></div>
            </div>
        </div>
    `).join('');
}

function genererTableauCompletApps() {
    const cible = document.getElementById('apps-table-body');
    if (!cible) return;

    cible.innerHTML = NetSentinelData.topApplications.map(app => `
        <tr class="hover:bg-slate-800/20 transition">
            <td class="p-4 font-sans font-medium text-white">${app.nom} <span class="text-slate-500 font-mono text-[10px] ml-2">#${app.pid}</span></td>
            <td class="p-4">${app.fluxRecu}</td>
            <td class="p-4">${app.fluxEnvoye}</td>
            <td class="p-4 w-1/4">
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-brand-accent h-full" style="width: ${app.part}%"></div>
                </div>
            </td>
            <td class="p-4 text-right">
                <span class="px-2 py-0.5 rounded text-[10px] font-sans font-medium ${app.statut === 'Actif' ? 'bg-brand-success/10 text-brand-success' : 'bg-slate-800 text-slate-500'}">${app.statut}</span>
            </td>
        </tr>
    `).join('');
}

function genererListeAlertes() {
    const cible = document.getElementById('alertes-container');
    if (!cible) return;

    cible.innerHTML = NetSentinelData.alertes.map(alt => `
        <div class="glass p-4 rounded-xl border-l-4 border-l-brand-${alt.couleur} flex items-center justify-between">
            <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-brand-${alt.couleur}/10 text-brand-${alt.couleur} mt-0.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-white">${alt.titre}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${alt.description}</p>
                    <span class="text-[10px] text-slate-500 font-mono mt-2 block">${alt.heure}</span>
                </div>
            </div>
            <span class="px-2.5 py-1 rounded bg-brand-${alt.couleur}/10 text-brand-${alt.couleur} text-[10px] font-semibold uppercase tracking-wider">${alt.gravite}</span>
        </div>
    `).join('');
}

// 5. INITIALISATION AU CHARGEMENT DE L'APPLICATION
document.addEventListener('DOMContentLoaded', () => {
    // Écoute des clics sur la barre latérale fixe
    document.querySelectorAll('.nav-link').forEach(lien => {
        lien.addEventListener('click', (e) => {
            const cible = e.currentTarget.getAttribute('data-page');
            naviguerVers(cible);
        });
    });

    // Lancement par défaut sur le Tableau de bord
    naviguerVers('tableau_de_bord');
});
