#!/usr/bin/env python3
"""
Génère une page-cadeau Alex Harper pour une commande de chanson.

Usage (depuis la racine du repo AlexH) :
    python outils/generer_carte.py commandes/camille.json

Crée :
    pour/<prenom>-<code>/index.html   page publiée (enveloppe + carte + chanson)
    pour/<prenom>-<code>/chanson.mp3
    pour/<prenom>-<code>/apercu.jpg   vignette affichée par WhatsApp
    pour/<prenom>-<code>/carte.pdf    (si fourni dans la commande)
    outils/livraisons/<prenom>-<code>/message-whatsapp.txt
    outils/livraisons/<prenom>-<code>/qr.png   (si le module qrcode est installé)

Dépendances : Pillow  (pip install pillow)
Optionnel    : qrcode  (pip install qrcode)
"""

import html
import json
import re
import secrets
import shutil
import sys
import unicodedata
import urllib.parse
from pathlib import Path

BASE_URL = "https://alexharper.fr"
DOSSIER_PUBLIC = "pour"

OUTILS = Path(__file__).resolve().parent
RACINE_SITE = OUTILS.parent
MODELE = OUTILS / "modele_carte.html"
POLICES = OUTILS / "fonts"

# ------------------------------------------------------------------
# Thèmes par occasion (mêmes catégories que le formulaire)
# ------------------------------------------------------------------
THEMES = {
    "diplome": {
        "fond": "#0D0D0F", "accent": "#c8a96e",
        "libelle": "Pour ton diplôme",
        "ornement": '<path d="M8 26 L32 16 L56 26 L32 36 Z"/><path d="M18 30 V42 C18 47 46 47 46 42 V30"/><path d="M56 26 V38"/>',
    },
    "mariage": {
        "fond": "#121014", "accent": "#D9CBA3",
        "libelle": "Pour vous deux",
        "ornement": '<circle cx="26" cy="36" r="12"/><circle cx="38" cy="36" r="12"/><path d="M34 21 L38 15 L42 21"/>',
    },
    "naissance": {
        "fond": "#0F121A", "accent": "#D9CBA3",
        "libelle": "Bienvenue au monde",
        "ornement": '<path d="M40 12 A20 20 0 1 0 52 46 A15 15 0 1 1 40 12 Z"/><path d="M16 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z"/>',
    },
    "anniversaire": {
        "fond": "#140F10", "accent": "#c8a96e",
        "libelle": "Pour ton anniversaire",
        "ornement": '<path d="M28 30 H36 V52 H28 Z"/><path d="M32 14 C36 19 36 24 32 26 C28 24 28 19 32 14 Z"/><path d="M16 52 H48"/>',
    },
    "retraite": {
        "fond": "#11100D", "accent": "#c8a96e",
        "libelle": "Pour ta nouvelle vie",
        "ornement": '<path d="M8 44 H56"/><path d="M18 44 A14 14 0 0 1 46 44"/><path d="M32 16 V23 M15 25 L20 30 M49 25 L44 30"/>',
    },
    "hommage": {
        "fond": "#121212", "accent": "#EDE6D8",
        "libelle": "En souvenir",
        "ornement": '<path d="M46 10 C26 15 18 33 18 52 C34 46 48 32 46 10 Z"/><path d="M18 52 L38 24"/>',
    },
    "autre": {
        "fond": "#0D0D0F", "accent": "#c8a96e",
        "libelle": "Pour toi",
        "ornement": '<path d="M26 44 V16 L48 12 V40"/><circle cx="21" cy="44" r="5"/><circle cx="43" cy="40" r="5"/>',
    },
}


def erreur(msg):
    print(f"Erreur : {msg}")
    sys.exit(1)


def slugifier(texte):
    t = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "cadeau"


def e(texte):
    return html.escape(texte or "", quote=True)


def paroles_en_html(texte):
    """Retire les balises Suno ([Verse], [Chorus]…) et crée un paragraphe par strophe."""
    lignes = [l.rstrip() for l in texte.splitlines()]
    lignes = [l for l in lignes if not re.fullmatch(r"\s*\[.*\]\s*", l)]
    strophes, courante = [], []
    for l in lignes:
        if l.strip():
            courante.append(e(l.strip()))
        elif courante:
            strophes.append(courante)
            courante = []
    if courante:
        strophes.append(courante)
    return "\n    ".join("<p>" + "<br>".join(s) + "</p>" for s in strophes)


def hex_vers_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def police(nom, taille):
    from PIL import ImageFont
    chemin = POLICES / nom
    try:
        f = ImageFont.truetype(str(chemin), taille)
        if nom.startswith("Montserrat"):
            try:
                f.set_variation_by_axes([300])  # graisse Light
            except Exception:
                pass
        return f
    except OSError:
        try:
            return ImageFont.load_default(size=taille)
        except TypeError:
            return ImageFont.load_default()


def creer_apercu(chemin, titre_haut, prenom, libelle, theme):
    """Vignette 1200x630 affichée par WhatsApp quand le lien est partagé."""
    from PIL import Image, ImageDraw
    fond = hex_vers_rgb(theme["fond"])
    accent = hex_vers_rgb(theme["accent"])
    clair = hex_vers_rgb("#EDE6D8")

    img = Image.new("RGB", (1200, 630), fond)
    d = ImageDraw.Draw(img)
    d.rectangle([40, 40, 1160, 590], outline=accent, width=2)

    f_petit = police("Montserrat-Light.ttf", 34)
    f_nom = police("MrsSaintDelafield-Regular.ttf", 150)
    f_titre = police("PlayfairDisplay-Regular.ttf", 64)
    f_sign = police("MrsSaintDelafield-Regular.ttf", 60)

    def centre(y, texte, f, couleur):
        l = d.textlength(texte, font=f)
        d.text(((1200 - l) / 2, y), texte, font=f, fill=couleur)

    centre(120, libelle, f_petit, accent)
    centre(190, titre_haut, f_titre, clair)
    centre(290, prenom, f_nom, accent)
    centre(500, "Alex Harper", f_sign, clair)
    img.save(chemin, "JPEG", quality=85, optimize=True)


def main():
    if len(sys.argv) != 2:
        erreur("indiquez le fichier de commande. Exemple : python outils/generer_carte.py commandes/camille.json")

    fichier_cmd = Path(sys.argv[1]).resolve()
    if not fichier_cmd.exists():
        erreur(f"commande introuvable : {fichier_cmd}")
    cmd = json.loads(fichier_cmd.read_text(encoding="utf-8"))
    dossier_cmd = fichier_cmd.parent

    prenom = (cmd.get("prenom") or "").strip()
    if not prenom:
        erreur("le champ 'prenom' est obligatoire.")
    occasion = cmd.get("occasion", "autre")
    if occasion not in THEMES:
        erreur(f"occasion inconnue '{occasion}'. Choix : {', '.join(THEMES)}")
    theme = THEMES[occasion]

    audio_src = dossier_cmd / cmd.get("chanson", "")
    if not audio_src.is_file():
        erreur(f"fichier audio introuvable : {audio_src}")
    taille_mo = audio_src.stat().st_size / 1_000_000
    if taille_mo > 10:
        print(f"Attention : le MP3 fait {taille_mo:.1f} Mo. Exportez-le en 192 kbit/s pour un chargement plus rapide.")

    paroles_src = dossier_cmd / cmd.get("paroles", "")
    paroles = paroles_src.read_text(encoding="utf-8") if paroles_src.is_file() else ""
    if not paroles:
        print("Attention : aucune parole trouvée, la section restera vide.")

    # Adresse difficile à deviner
    slug = f"{slugifier(prenom)}-{secrets.token_hex(4)}"
    dossier_page = RACINE_SITE / DOSSIER_PUBLIC / slug
    dossier_page.mkdir(parents=True, exist_ok=False)
    url = f"{BASE_URL}/{DOSSIER_PUBLIC}/{slug}/"

    shutil.copy(audio_src, dossier_page / "chanson.mp3")

    bouton_pdf = ""
    if cmd.get("carte_pdf"):
        pdf_src = dossier_cmd / cmd["carte_pdf"]
        if pdf_src.is_file():
            shutil.copy(pdf_src, dossier_page / "carte.pdf")
            bouton_pdf = f'<a href="carte.pdf" download="Carte pour {e(prenom)}.pdf">Télécharger la carte</a>'
        else:
            print(f"Attention : carte PDF introuvable ({pdf_src}), bouton non ajouté.")

    titre = cmd.get("titre") or f"Une chanson pour {prenom}"
    libelle = cmd.get("libelle") or theme["libelle"]

    creer_apercu(dossier_page / "apercu.jpg", "Une chanson pour", prenom, libelle, theme)

    dedicace = cmd.get("dedicace", "").strip()
    message = cmd.get("message", "").strip()
    de_la_part = cmd.get("de_la_part", "").strip()

    remplacements = {
        "{{TITRE}}": e(titre),
        "{{PRENOM}}": e(prenom),
        "{{OG_DESCRIPTION}}": e(cmd.get("apercu_texte") or "Un cadeau à ouvrir quand tu as un moment calme. Monte le son."),
        "{{OG_IMAGE}}": url + "apercu.jpg",
        "{{URL}}": url,
        "{{FOND}}": theme["fond"],
        "{{ACCENT}}": theme["accent"],
        "{{ORNEMENT}}": theme["ornement"],
        "{{LIBELLE}}": e(libelle),
        "{{DEDICACE}}": f'<p class="dedicace">{e(dedicace)}</p>' if dedicace else "",
        "{{MESSAGE}}": f'<p class="message">{e(message)}</p>' if message else "",
        "{{DE_LA_PART}}": f'<p class="de-la-part">{e(de_la_part)}</p>' if de_la_part else "",
        "{{PAROLES}}": paroles_en_html(paroles),
        "{{FICHIER_AUDIO}}": "chanson.mp3",
        "{{NOM_TELECHARGEMENT}}": e(f"Chanson pour {prenom}"),
        "{{BOUTON_PDF}}": bouton_pdf,
    }
    page = MODELE.read_text(encoding="utf-8")
    for cle, valeur in remplacements.items():
        page = page.replace(cle, valeur)
    (dossier_page / "index.html").write_text(page, encoding="utf-8")

    # Kit de livraison (non publié)
    dossier_livraison = OUTILS / "livraisons" / slug
    dossier_livraison.mkdir(parents=True, exist_ok=True)
    texte_wa = cmd.get("message_whatsapp") or "J'ai un cadeau pour toi 🎵 Ouvre-le quand tu as un moment calme, et monte le son."
    lien_wa = "https://wa.me/?text=" + urllib.parse.quote(f"{texte_wa}\n{url}")
    (dossier_livraison / "message-whatsapp.txt").write_text(
        f"Page : {url}\n\nLien WhatsApp prêt à envoyer au client :\n{lien_wa}\n\nTexte :\n{texte_wa}\n{url}\n",
        encoding="utf-8",
    )
    try:
        import qrcode
        qrcode.make(url).save(dossier_livraison / "qr.png")
        qr_info = "QR code créé pour la carte imprimée."
    except ImportError:
        qr_info = "QR code non créé (pip install qrcode pour l'activer)."

    print(f"\nPage créée : {dossier_page.relative_to(RACINE_SITE)}")
    print(f"Adresse une fois publiée : {url}")
    print(f"Lien WhatsApp et message : {(dossier_livraison / 'message-whatsapp.txt').relative_to(RACINE_SITE)}")
    print(qr_info)
    print("\nÉtape suivante : git add, commit et push pour publier sur Netlify.")


if __name__ == "__main__":
    main()
