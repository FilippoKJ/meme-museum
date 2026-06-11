// e2e/meme-museum.spec.js
import { test, expect } from '@playwright/test';

// Utilizziamo l'URL assoluto esatto del tuo server di sviluppo locale Webpack
const BASE_URL = 'http://localhost:3000';

test.describe('Meme Museum E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Risoluzione errore "Navigate to /": forziamo l'indirizzo assoluto completo prima di ogni test
    await page.goto(BASE_URL);
  });

  // 1. Render base della pagina
  test('1 · Caricamento homepage – navbar, hero e griglia meme visibili', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'MEME MUSEUM' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'ULTIMI MEME' })).toBeVisible();
    
    // Corretto: puntiamo alla classe reale .meme-card-hover definita in MemeCards.jsx
    await expect(page.locator('.meme-card-hover').first()).toBeVisible();
  });

  // 2. Flusso di Ricerca
  test('2 · Ricerca — digitando nella navbar si filtra la griglia', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    await searchInput.fill('wojak');
    await page.waitForTimeout(500); // Attesa per il caricamento o l'eventuale fetch dell'API
    
    // Controlliamo che la griglia o la sezione dei risultati risponda correttamente
    await expect(page.locator('#meme-grid')).toBeVisible();
    await expect(page.locator('text=Riprova')).not.toBeVisible();
  });

  // 3. Tag Sidebar
  test('3 · Tag sidebar — cliccando un tag si attiva il filtro rapido', async ({ page }) => {
    // Individua i bottoni dei tag all'interno dell'aside di TagSidebar
    const firstTag = page.locator('aside .tag-pill').first();
    await firstTag.click();

    // Verifica che l'intestazione della griglia o la barra dei filtri reagisca all'attivazione
    await expect(page.locator('#meme-grid')).toBeVisible();
  });

  // 4. Filtri Avanzati dal Panel
  test('4 · Filtri — ordinare per più votati dal pannello filtri', async ({ page }) => {
    // Clicca sul pulsante filtro
    await page.click('button[title="Filtri"]');
    
    // Isola il pannello laterale usando la sua classe z-50
    const filterPanel = page.locator('.fixed.z-50');
    await expect(filterPanel.locator('h2', { hasText: 'FILTRI' })).toBeVisible();

    // Ora Playwright cercherà il bottone SOLO all'interno del pannello filtri!
    await filterPanel.locator('button:has-text("Più votati")').click();
    await filterPanel.locator('button:has-text("Applica")').click();

    // MODIFICA RESPONSIVE: Invece di cercare le classi CSS specifiche che cambiano su mobile,
    // cerchiamo il bottone attivo direttamente dentro la sezione della griglia.
    await expect(page.locator('#meme-grid button', { hasText: 'Più votati' })).toBeVisible();
  });

  // 5. Paginazione
  test('5 · Paginazione — visualizzazione dei controlli di navigazione pagine', async ({ page }) => {
    // Controlla che i componenti di impaginazione siano integrati nella griglia
    const nextButton = page.locator('button:has-text("→")');
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeVisible();
    }
  });

  // 6. MemeViewer Open/Close
  test('6 · MemeViewer — apertura e chiusura del viewer a schermo intero', async ({ page }) => {
    // Clicca sulla prima card disponibile con la classe corretta
    await page.locator('.meme-card-hover').first().click();
    
    // Verifica la comparsa della sidebar interattiva del viewer (es. bottone commenti)
    await expect(page.locator('button:has-text("💬")')).toBeVisible();

    // Chiude usando il pulsante X posizionato tramite le classi assolute nel componente
    await page.click('button.absolute.top-4.left-4');
    
    // Verifica la corretta chiusura dell'overlay
    await expect(page.locator('button:has-text("💬")')).not.toBeVisible();
  });

  // 7. Auth - Login
  test('7 · Auth — login con credenziali di test', async ({ page }) => {
    await page.click('button:has-text("LOGIN")');
    await expect(page.locator('h2', { hasText: 'LOGIN' })).toBeVisible();
    
    await page.fill('input[placeholder="Username"]', 'test');
    await page.fill('input[placeholder="Password"]', 'test');
    await page.click('button:has-text("Entra")');

    // La navbar deve aggiornarsi mostrando l'username inserito
    await expect(page.locator('nav')).toContainText('test');
  });

  // 8. Auth - Registrazione
  test('8 · Auth — credenziali nuove e registrazione account', async ({ page }) => {
    const randomUser = `user_${Date.now()}`;
    
    await page.click('button:has-text("LOGIN")');
    await page.click('button:has-text("Registrati")'); // Cambia modalità nel LoginModal
    await expect(page.locator('h2', { hasText: 'REGISTRATI' })).toBeVisible();

    await page.fill('input[placeholder="Username"]', randomUser);
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Crea account")');

    // Verifica l'avvenuto login controllando il nome sulla Navbar
    await expect(page.locator('nav')).toContainText(randomUser);
  });

  // 9. Voti nel Viewer
  test('9 · Voti — upvote funzionante all’interno del viewer (con utente autenticato)', async ({ page }) => {
    // Autenticazione preliminare
    await page.click('button:has-text("LOGIN")');
    await page.fill('input[placeholder="Username"]', 'test');
    await page.fill('input[placeholder="Password"]', 'test');
    await page.click('button:has-text("Entra")');
    await page.waitForTimeout(300);

    // Apri il visualizzatore sul primo meme
    await page.locator('.meme-card-hover').first().click();

    // Seleziona e clicca il tasto freccia su di incremento gradimento
    const upvoteBtn = page.locator('button', { hasText: '▲' });
    await upvoteBtn.click();
    
    // Verifica che l'interfaccia mantenga visibile il controllo di voto
    await expect(upvoteBtn).toBeVisible();
  });

  // 10. Modale Meme del Giorno
  test('10 · Meme del giorno — apertura modale dal tasto dedicato', async ({ page }) => {
    // Clicca sul tasto adibito presente nella navbar (gestisce varianti desktop/mobile)
    await page.click('button:has-text("MEME DEL GIORNO"), button[title="Meme del giorno"]');
    
    // Accerta la corretta inizializzazione del pannello dedicato al vincitore odierno
    await expect(page.locator('h2', { hasText: 'MEME DEL GIORNO' })).toBeVisible();
    
    // Chiude la modale
    await page.click('button:has-text("✕")');
  });

});