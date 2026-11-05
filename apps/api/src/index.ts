import express from 'express';
import { environment } from './config/environment.js';
import { loadLeagueData } from './modules/league/league.service.js';

const app = express();
app.disable('x-powered-by');

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', source: environment.source });
});

app.get('/api/league', async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  try {
    response.json(await loadLeagueData());
  } catch (error) {
    console.error('League data request failed:', error);
    response.status(500).json({ message: 'Unable to load league data. Check the API terminal and PostgreSQL configuration.' });
  }
});

app.listen(environment.port, '127.0.0.1', () => {
  console.log(`45CUT API listening on http://127.0.0.1:${environment.port} (${environment.source} mode)`);
});
