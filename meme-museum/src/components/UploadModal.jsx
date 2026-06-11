import React, { useState, useRef } from 'react';

export default function UploadModal({ onClose, onSuccess }) {
  const [imagePreview, setImagePreview] = useState('');
  const [srcBase64, setSrcBase64] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const API_URL = 'http://localhost:4000';

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Il file selezionato deve essere un'immagine (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("L'immagine è troppo pesante. Il limite massimo consentito è di 4MB.");
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setSrcBase64(reader.result);
    };
    reader.onerror = () => {
      setError("Errore durante la lettura del file immagine.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    if (!srcBase64) return setError("Seleziona o trascina un file immagine prima di pubblicare.");
    if (!tagsInput.trim()) return setError("Inserisci almeno un tag per classificare il meme.");

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#+/, ''))
      .filter(t => t.length > 0);

    if (tagsArray.length === 0) return setError("Inserisci almeno un tag valido (es: chad, based).");

    setLoading(true);
    try {
      const token = localStorage.getItem('mm_token');
      
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error("Autenticazione mancante. Chiudi la finestra, fai il login e riprova.");
      }

      const res = await fetch(`${API_URL}/api/memes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          src: srcBase64,
          description: description.trim(),
          tags: tagsArray
        })
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Sessione scaduta o non valida! Fai il logout dal menu in alto e accedi di nuovo.");
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Risposta non-JSON dal server:", textResponse);
        throw new Error("Il backend ha restituito un errore imprevisto. Controlla il terminale di Node!");
      }

      if (!res.ok) {
        const data = await res.json();
        console.error("Errore dal server:", data);
        throw new Error(data.error || data.message || `Errore generico server (Status: ${res.status})`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Errore catturato nel frontend:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Sfondo super leggero per la GPU senza blur */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 5, 5, 0.96)' }}
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-7 flex flex-col gap-5 animate-fade-up max-h-[95dvh] overflow-y-auto"
        style={{ background: '#161616', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-3xl text-white tracking-wide">CARICA UN MEME</h2>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        {error && (
          <div className="text-xs font-mono text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2 animate-fade-up">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono text-[#888] uppercase mb-1.5 block tracking-widest">File Immagine *</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
            
            {imagePreview ? (
              <div 
                className="relative w-full rounded-xl overflow-hidden border border-[#333] bg-[#111] cursor-pointer group"
                style={{ aspectRatio: '16/10' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-mono text-xs text-white">
                  🔄 Clicca per cambiare file
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-[#333] hover:border-[#7c5cbf] bg-[#1a1a1a]/40 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
                style={{ aspectRatio: '16/10' }}
              >
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[#444] group-hover:text-[#7c5cbf] transition-colors" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-mono text-[#aaa] group-hover:text-white transition-colors">Seleziona un file immagine</p>
                  <p className="text-[11px] font-mono text-[#444] mt-1">PNG, JPG, WEBP o GIF fino a 4MB</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-mono text-[#888] uppercase mb-1.5 block tracking-widest">Descrizione</label>
            <textarea
              placeholder="Aggiungi una descrizione epica..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#888] uppercase mb-1.5 block tracking-widest">Tag Personalizzati *</label>
            <input
              type="text"
              placeholder="Es: chad, based, cursed (separati da virgola)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
            />
            <span className="text-[12px] font-mono text-[#444] mt-1.5 block">
              💡 Digita i tag liberamente separandoli con una virgola.
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !srcBase64 || !tagsInput.trim()}
          className="w-full py-3 mt-2 rounded-xl font-mono font-bold text-sm text-white tracking-widest uppercase transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{ background: '#7c5cbf' }}
        >
          {loading ? 'SALVATAGGIO NELL\'ARCHIVIO...' : 'PUBBLICA MEME'}
        </button>
      </div>
    </div>
  );
}