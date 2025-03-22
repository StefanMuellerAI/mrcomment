# MrComment

MrComment ist eine Webanwendung zur Generierung von LinkedIn-Kommentaren basierend auf Kundenprofilen und deren Vorgeschichten. Die Anwendung nutzt KI-Technologie, um personalisierte Kommentarvorschläge zu erstellen, die zum Stil und zur Geschichte des Kunden passen.

## Funktionen

- **Authentifizierung**: Benutzer- und Admin-Login-Funktionalität
- **Kundenverwaltung**: Erstellen, Bearbeiten und Löschen von Kundenprofilen
- **KI-gestützte Kommentare**: Generierung von LinkedIn-Kommentaren basierend auf Kundenprofilen
- **Admin-Dashboard**: Verwaltung von Nutzern und Nutzungsstatistiken (für Administratoren)
- **Responsive Design**: Optimiert für verschiedene Bildschirmgrößen

## Technologie-Stack

- **Frontend**: React mit TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API-Integration**: OpenAI API für KI-generierte Inhalte
- **Backend**: Supabase für Authentifizierung und Datenspeicherung
- **Build-Tool**: Vite

## Service-Module

Die Anwendung verwendet eine modulare Architektur mit verschiedenen Service-Modulen:

- **authService**: Verwaltet die Authentifizierung, Sitzungen und Benutzerberechtigungen
- **customerService**: Handhabt die Erstellung, Aktualisierung und Löschung von Kundenprofilen
- **openaiService**: Kapselt die Interaktion mit der OpenAI-API für die Generierung von Stilanalysen und Kommentaren
- **commentService**: Kümmert sich um die Kommentargenerierung und -verwaltung
- **modalService**: Zentrale Verwaltung von Modal-Fenstern (Laden, Bestätigung, rechtliche Hinweise)

## Projektstruktur

```
mrcomment/
├── public/                 # Öffentliche Dateien
├── src/                    # Quellcode
│   ├── assets/             # Statische Assets
│   │   └── legal/          # Rechtliche Dokumente
│   │       ├── datenschutz.md
│   │       └── impressum.md
│   ├── components/         # React-Komponenten
│   │   ├── auth/           # Authentifizierungskomponenten
│   │   │   └── LoginForm.tsx
│   │   ├── common/         # Allgemeine UI-Komponenten
│   │   │   ├── DeleteConfirmationModal.tsx
│   │   │   ├── LoadingModal.tsx
│   │   │   └── ModalContainer.tsx
│   │   ├── features/       # Feature-Komponenten
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerProfileList.tsx
│   │   │   └── LinkedInPostEditor.tsx
│   │   ├── layouts/        # Layout-Komponenten
│   │   │   └── Header.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── Footer.tsx
│   │   ├── LegalModal.tsx
│   │   └── Logo.tsx
│   ├── contexts/           # React Contexts
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Bibliotheks-Integrationen
│   ├── pages/              # Seiten-Komponenten
│   ├── services/           # Dienste und API-Clients
│   │   ├── authService.ts     # Authentifizierungslogik
│   │   ├── commentService.ts  # Kommentarfunktionen
│   │   ├── customerService.ts # Kundenverwaltung
│   │   ├── modalService.ts    # Modal-Verwaltung
│   │   └── openaiService.ts   # OpenAI-Integration
│   ├── styles/             # CSS und Styling
│   ├── types/              # TypeScript-Typdefinitionen
│   ├── utils/              # Hilfsfunktionen
│   ├── App.tsx             # Hauptanwendungskomponente
│   ├── index.css           # Globale CSS-Datei
│   ├── main.tsx            # Einstiegspunkt der Anwendung
│   └── vite-env.d.ts       # Vite-Typdefinitionen
├── supabase/               # Supabase-Konfiguration
├── .env                    # Umgebungsvariablen
├── package.json            # Projektabhängigkeiten
├── tsconfig.json           # TypeScript-Konfiguration
├── tailwind.config.js      # Tailwind-Konfiguration
└── vite.config.ts          # Vite-Konfiguration
```

## Features im Detail

### Kundenprofile

Jedes Kundenprofil enthält:

- **Name**: Identifikation des Kunden
- **Stilanalyse**: Eine KI-generierte Analyse des Schreibstils basierend auf LinkedIn-Beispielen
- **LinkedIn-Beispiele**: Mindestens drei Beispiele von vergangenen LinkedIn-Aktivitäten

### Kommentargenerierung

Der Kommentargenerierungsprozess umfasst:

1. **Postanalyse**: Der eingegebene LinkedIn-Post wird analysiert
2. **Stilabgleich**: Der Stil des Kunden wird mit dem Postkontext abgeglichen
3. **Kommentargenerierung**: Die KI generiert mehrere passende Kommentarvorschläge
4. **Verfeinerung**: Kommentare können bei Bedarf neu generiert oder bearbeitet werden

### Admin-Dashboard

Das Admin-Dashboard bietet:

- Übersicht über registrierte Benutzer
- Nutzungsstatistiken (Generierte Kommentare, API-Aufrufe)
- Verwaltung von Benutzerberechtigungen und Nutzungslimits

## Installation und Einrichtung

### Voraussetzungen

- Node.js (v16 oder höher)
- npm oder yarn
- Supabase-Konto
- OpenAI API-Schlüssel

### Installation

1. Klone das Repository:
   ```bash
   git clone [repository-url]
   cd mrcomment
   ```

2. Installiere die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Erstelle eine `.env`-Datei im Stammverzeichnis des Projekts mit den folgenden Umgebungsvariablen:
   ```
   VITE_SUPABASE_URL=deine-supabase-url
   VITE_SUPABASE_ANON_KEY=dein-supabase-anon-key
   VITE_OPENAI_API_KEY=dein-openai-api-key
   ```

4. Starte die Entwicklungsumgebung:
   ```bash
   npm run dev
   ```

## Nutzung

### Authentifizierung

- Registriere dich als neuer Benutzer oder melde dich mit einem bestehenden Konto an.
- Admin-Benutzer haben Zugriff auf das Admin-Dashboard.

### Kundenverwaltung

- Erstelle neue Kundenprofile mit Namen, Stilanalyse und LinkedIn-Beispielen.
- Bearbeite oder lösche vorhandene Kundenprofile.

### Kommentargenerierung

- Wähle einen Kunden aus der Liste.
- Gib einen LinkedIn-Post ein, auf den du kommentieren möchtest.
- Generiere personalisierte Kommentarvorschläge mit der KI.

### Admin-Funktionen

- Verwalte Benutzer und deren Nutzungslimits.
- Überwache Nutzungsstatistiken.

## Projektarchitektur

Das Projekt folgt einer modularen Architektur mit klaren Verantwortlichkeiten:

- **Components**: UI-Komponenten, die für die Darstellung und Benutzerinteraktion verantwortlich sind.
- **Services**: Kapselung der Geschäftslogik und API-Kommunikation, um die Wiederverwendbarkeit zu fördern.
- **Context/Hooks**: State-Management und wiederverwendbare Logik.

## Modularisierungsprozess

Die Anwendung durchlief einen Modularisierungsprozess, bei dem folgende Komponenten ausgelagert wurden:

1. **Authentifizierungslogik**: Vom `App.tsx` in den `authService`
2. **Kundenfunktionalität**: Vom `App.tsx` in den `customerService`
3. **OpenAI-Integration**: In einen dedizierten `openaiService`
4. **Modal-Management**: Zentralisierte Verwaltung in `modalService`
5. **Rechtliche Inhalte**: Ausgelagert in Markdown-Dateien

## Lizenz

Alle Rechte vorbehalten. Dieses Projekt darf ohne ausdrückliche Genehmigung des Rechteinhabers nicht verwendet, modifiziert oder weitergegeben werden.

## Kontakt

Stefan Müller  
E-Mail: info@stefanai.de 