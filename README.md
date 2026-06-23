# TP-ALGO - Fanoron-telo avec IA (Minimax + Alpha-Beta)

**Projet de Hackathon - ISPM (Institut Supérieur Polytechnique de Madagascar)**

Une implémentation complète du **Fanoron-telo** (jeu traditionnel malgache) avec intelligence artificielle avancée utilisant l'algorithme **Minimax avec élagage Alpha-Beta**.

---

## 🎮 À propos du jeu

Le **Fanoron-telo** est un jeu de société traditionnel malgache très proche du Tic-Tac-Toe, mais avec une mécanique plus riche :
- **Phase 1 (Placement)** : Les joueurs placent leurs 3 pions sur le plateau.
- **Phase 2 (Déplacement)** : Une fois tous les pions placés, les joueurs peuvent déplacer leurs pions sur les cases adjacentes.
- **Objectif** : Aligner ses 3 pions horizontalement, verticalement ou diagonalement.

Ce projet combine **logique de jeu**, **interface interactive** et **algorithmique avancée**.

---

## ✨ Fonctionnalités

- **Interface web moderne** et responsive
- **Mode Joueur vs Joueur** (Local)
- **Mode Joueur vs IA** (difficulté réglable)
- **Implémentation de l'algorithme Minimax** avec **élagage Alpha-Beta** (optimisation majeure)
- **Détection automatique des phases** (Placement → Déplacement)
- **Détection de victoire et match nul**
- **Historique des coups**
- **Design propre** inspiré des jeux traditionnels malgaches

---

## 🛠 Technologies utilisées

- **HTML5** + **CSS3**
- **JavaScript** (Vanilla JS)
- Architecture modulaire :
  - `game.js` → Logique du jeu
  - `ai.js` → Algorithme Minimax + Alpha-Beta
  - `ui.js` → Interface utilisateur
  - `main.js` → Point d'entrée

---

## 📁 Structure du projet

```
TP-ALGO/
├── index.html
├── style.css
├── .nojekyll
├── js/
│   ├── main.js
│   ├── game.js
│   ├── ai.js
│   └── ui.js
└── README.md
```

---

## 🚀 Comment jouer

1. Clone le repository :
   ```bash
   git clone https://github.com/Nathanael009/TP-ALGO.git
   ```

2. Ouvre le fichier `index.html` dans ton navigateur (double-clic ou via Live Server).

3. Choisis ton mode de jeu :
   - Joueur vs Joueur
   - Joueur vs IA

---

## 🎯 Objectifs pédagogiques du projet

- Comprendre et implémenter l'algorithme **Minimax**
- Optimiser avec l'**élagage Alpha-Beta**
- Gestion d'états de jeu complexes (deux phases distinctes)
- Séparation claire des préoccupations (Game logic / AI / UI)
- Développement d'un jeu complet en temps limité (Hackathon)

---

## 📊 Performance de l'IA

- **Profondeur de recherche** optimisée grâce à l'élagage Alpha-Beta
- Temps de réponse rapide même avec une profondeur élevée
- IA quasi imbattable en mode difficile

---

## 🛣️ Améliorations possibles (Future Work)

- Ajout de niveaux de difficulté plus fins
- Mode en ligne (multi-joueurs)
- Sauvegarde des parties
- Animations plus fluides
- Thèmes visuels malgaches (variantes du plateau)
- Analyse statistique des parties

---

## 👤 Auteur

- **Nathanael**  
- Étudiant en **IGGLIA 4ème année** - ISPM  
- Projet réalisé dans le cadre d'un Hackathon / TP Algorithmique

---

## 📄 Licence

Ce projet est open-source. Tu es libre de l'utiliser, le modifier et le distribuer.

---

**⭐ Si ce projet t'a plu, n'hésite pas à mettre une étoile !**

---

**Made with ❤️ for Madagascar & Algorithmic Excellence**
