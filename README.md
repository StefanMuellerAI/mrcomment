# Ideen-Tool mit Research API Integration

Dieses Tool ermöglicht es, Trend-Recherchen zu einem bestimmten Thema durchzuführen und die Ergebnisse für Content-Ideen zu nutzen.

## Entwicklungsumgebung einrichten

1. Repository klonen
2. Abhängigkeiten installieren: `npm install`
3. `.env`-Datei basierend auf `.env.example` erstellen und API-Keys eintragen
4. Entwicklungsserver starten: `npm run dev:all`

## API-Integration

Das Tool integriert mit einer externen Research-API, die folgende Funktionen bietet:
- Trend-Analyse zu einem Thema starten
- Status der Analyse abfragen
- Ergebnisse der Trend-Analyse abrufen

Die API erfordert einen API-Key, der als `X-API-Key` in den HTTP-Headern übermittelt wird.

## Vercel Deployment

Die Anwendung ist für das Deployment auf Vercel konfiguriert. Dabei wird:
- Die Vite-App gebaut und bereitgestellt
- API-Anfragen über Vercel-Rewrites zur Research-API weitergeleitet
- Die CORS-Einstellungen für die API-Kommunikation konfiguriert

### Deployment-Konfiguration

- `vercel.json` enthält die Routing-Regeln für API-Anfragen zur Research-API
- In der Produktion werden API-Anfragen direkt an `researchapi.stefanai.de` weitergeleitet
- Der Express-Server wird nur in der Entwicklungsumgebung verwendet

### API-Key in Vercel konfigurieren

Du musst den API-Key in deinen Vercel-Umgebungsvariablen eintragen:

1. Gehe zum Dashboard deines Vercel-Projekts
2. Navigiere zu "Settings" > "Environment Variables"
3. Füge eine neue Umgebungsvariable hinzu:
   - Name: `VITE_RESEARCH_API_KEY`
   - Wert: Dein Research API Key
   - Environments: Production

## Umgebungsvariablen

Folgende Umgebungsvariablen werden benötigt:

**Lokale Entwicklung:**
- `RESEARCH_API_URL`: URL der lokalen Research-API (z.B. http://localhost:8000)
- `RESEARCH_API_KEY`: API-Key für die Research-API

**Produktion (Vercel):**
- `VITE_RESEARCH_API_KEY`: API-Key für die Research-API

## Lokaler Entwicklungsprozess

Bei der lokalen Entwicklung:
1. Der Vite-Server läuft auf Port 5173
2. Ein Express-Proxy-Server läuft auf Port 3001
3. API-Anfragen werden vom Vite-Server zum Express-Server und dann zur Research-API weitergeleitet
4. Der API-Key wird vom Proxy-Server zu den Anfragen hinzugefügt 