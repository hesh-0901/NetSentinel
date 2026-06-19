/**
 * NETSENTINEL - Moteur Graphique (Chart.js)
 * Gère le rendu et la mise à jour des graphiques de flux réseau.
 */

let instanceGraphiquePrincipal = null;

function initDashboardChart() {
    const conteneurCanvas = document.getElementById('mainDashboardChart');
    
    // Sécurité : Si le canvas n'est pas encore présent dans le DOM, on stoppe.
    if (!conteneurCanvas) return;

    const ctx = conteneurCanvas.getContext('2d');

    // 1. NETTOYAGE MÉMOIRE
    // Si un graphique existe déjà (changement d'onglet), on le détruit pour éviter les fuites de mémoire.
    if (instanceGraphiquePrincipal !== null) {
        instanceGraphiquePrincipal.destroy();
    }

    // 2. CRÉATION DU DÉGRADÉ DE FOND (Effet Néon SaaS)
    const gradientBleu = ctx.createLinearGradient(0, 0, 0, 240);
    gradientBleu.addColorStop(0, 'rgba(59, 130, 246, 0.22)'); // Bleu électrique transparent en haut
    gradientBleu.addColorStop(1, 'rgba(59, 130, 246, 0.00)'); // Extinction totale en bas

    // 3. CONFIGURATION ET CONFIGURATION DE CHART.JS
    instanceGraphiquePrincipal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
            datasets: [{
                label: 'Débit global (Mbps)',
                data: [62, 78, 142, 95, 112, 184, 130],
                borderColor: '#3B82F6',          // Couleur de la ligne (Bleu électrique)
                borderWidth: 2,                  // Ligne fine type dashboard financier
                pointBackgroundColor: '#3B82F6', // Couleur des points au survol
                pointHoverRadius: 5,             // Rayon du point au survol
                pointRadius: 0,                  // Masquer les points par défaut pour un look épuré
                tension: 0.38,                   // Courbe lissée fluide (Bézier)
                fill: true,
                backgroundColor: gradientBleu    // Injection du dégradé
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,          // Permet de s'adapter à la hauteur du conteneur HTML
            plugins: {
                legend: {
                    display: false               // Masque la légende inutile
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#161F30',  // Fond du tooltip assorti à nos cartes .glass
                    titleColor: '#94A3B8',
                    bodyColor: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderWidth: 1,
                    font: { family: 'Inter' },
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)', // Lignes de grille horizontales très subtiles
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748B',        // Couleur du texte (Slate-500)
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        callback: function(value) {
                            return value + ' Mbps'; // Ajoute l'unité proprement
                        }
                    }
                },
                x: {
                    grid: {
                        display: false           // Masque les grilles verticales pour alléger l'UI
                    },
                    ticks: {
                        color: '#64748B',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                }
            }
        }
    });
}
