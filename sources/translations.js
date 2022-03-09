import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// get selected language based on url parameter ?lang=xx or use "en"
window.lang = (new URLSearchParams(location.search)).get("lang") || "en"

const resources = {

    en: { translation: {
        "Welcome to OpenSSL in your browser!": "Welcome to OpenSSL in your browser! The upper terminal runs OpenSSL compiled to WebAssembly. You can also use the graphical user interface (GUI) to build and run commands. Have fun :)"
    }},

    de: { translation: {
        "Welcome to OpenSSL in your browser!": "Willkommen zu OpenSSL im Browser! Im obigen Terminal läuft ein zu WebAssembly kompiliertes OpenSSL. Sie können auch die grafische Benutzeroberfläche benutzen, um Befehle zu erzeugen. Viel Spaß :)",
        "Enter Fullscreen": "Vollbildmodus",
        "Exit Fullscreen": "Vollbild beenden",
        "Command": "Befehl",
        "Run": "Ausführen",
        "Welcome": "Willkommen",
        "Encrypt & Decrypt": "Verschlüsseln",
        "Generate Keys": "Schlüssel erzeugen",
        "Sign & Verify": "Signieren & Verifizieren",
        "Hashes": "Prüfsummen",
        "Files": "Dateien",
        "New": "Neu",
        "Reset fields": "Felder zurücksetzen",
        "Mode": "Modus",
        "Input": "Eingabe",
        "Select file": "Datei auswählen",
        "Method": "Methode",
        "Filename": "Dateiname",
        "Last modified": "Zuletzt verändert",
        "File size": "Dateigröße",
        "Actions": "Aktionen",
        "Key length": "Schlüssellänge",
        "Elliptic curve name": "Name der elliptischen Kurve",
        "Encryption Cipher": "Verschlüsselungs-Chiffre",
        "Derive Public Key": "Public Key ableiten",
        "input file name": "Eingabedatei",
        "Private Key Passphrase": "Private Key Passphrase",
        "Public Key output format": "Public Key Ausgabeformat",
        "Hash function": "Hash-Funktion",
        "Sign with Private Key": "Mit Private Key signieren",
        "Verify with Public Key": "Mit Public Key verifizieren",
        "Public Key": "Public Key",
        "Signature file": "Signaturdatei",
        "Key type": "Schlüsseltyp",
        "Options": "Optionen",

        "Encrypt": "Verschlüsseln",
        "Decrypt": "Entschlüsseln",
        "executing command": "Befehl wird ausgeführt",
        "Compiled to WebAssembly with Emscripten": "Zu WebAssembly kompiliert mit Emscripten",
        "Running in WebWorker": "Läuft im WebWorker",
        "Worker not available": "Worker nicht verfügbar",
        "Usage: openssl [command] [params]": "Benutzung: openssl [Befehl] [Parameter]",
        "error while": "Fehler während",
        "Hello world": "Hallo Welt",
        "File": "Datei",
        "Cipher": "Chiffre",
        "Cipher Passphrase": "Chiffre Passphrase",
        "Public Keys are not encrypted": "Public Keys sind nicht verschlüsselt",
        "Private Key not encrypted": "Private Key nicht verschlüsselt",
        "No Private Key selected": "Kein Private Key ausgewählt",
        "Enter passphrase ..": "Passphrase eingeben ..",
        "Output to file": "Ausgabe in Datei",
        "Please fill in all fields": "Bitte füllen Sie alle Felder aus",
        "Select a file from your computer": "Wählen Sie eine Datei von Ihrem Computer aus",
        "Elliptic curves": "Elliptische Kurven",
        "Generate Private Key": "Private Key erzeugen",
        "Generate EC Params": "EC Params erzeugen",
        "Encrypt (Passphrase):": "Verschlüsseln (Passphrase):",
        "Output Private Key to file": "Private Key in Datei speichern",
        "Select cipher": "Chiffre auswählen",
        "Output Public Key to file": "Public Key in Datei speichern",
        "Output signature to file": "Signatur in Datei speichern",

    }}
}

i18n.use(initReactI18next).init({ resources,
    lng: window.ioApp?.lang || window.lang, // ioApp = cryptool.org
    interpolation: { escapeValue: false }
})

export default i18n
