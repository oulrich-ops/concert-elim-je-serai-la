# Je serai là ! — Concert d'Évangélisation 2026

Mini-site statique (HTML, CSS, JavaScript) sans serveur, sans compte et sans stockage des photos. Les participants ajoutent leur photo, la déplacent, ajustent le zoom, ajoutent éventuellement leur nom, puis téléchargent un visuel 1080 × 1350 en PNG ou JPG.

## Mise en ligne gratuite avec GitHub Pages

1. Créez un dépôt GitHub public, par exemple `concert-temple-elim`.
2. Ajoutez à la racine du dépôt `index.html`, `style.css`, `app.js` et le dossier `assets/`.
3. Ouvrez **Settings → Pages** dans le dépôt.
4. Dans **Build and deployment**, sélectionnez **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
5. Le site sera disponible sur `https://VOTRE-PSEUDO.github.io/concert-temple-elim/` lorsque GitHub aura terminé sa publication.

## Personnaliser

- Les couleurs principales sont dans `style.css`, sous `:root` ; le visuel exporté est dessiné dans `app.js`, fonction `draw()`.
- Les coordonnées, la date et le thème sont éditables dans `index.html` et `app.js`.
- Les images originales du concert sont conservées dans `assets/` ; `logo-jad.png` est recadré depuis votre teaser.
- Les polices web utilisent Google Fonts. Sans connexion, le site fonctionne avec les polices de secours installées sur l'appareil.

## Confidentialité

Aucune photo n'est téléversée ; toutes les opérations sont faites dans le navigateur. Les images restent locales à l'appareil du participant.

## Utilisation locale

Ouvrez `index.html` dans votre navigateur ; pour un comportement identique à GitHub Pages, vous pouvez aussi lancer un serveur local avec `python3 -m http.server 8000` depuis le dossier.
