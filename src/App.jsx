import React, { useEffect, useState } from 'react';
import GameCanvas from './game/GameCanvas';
import { gameState } from './game/GameState';

const IconBox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const IconRotate = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline></svg>;
const IconReset = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline><line x1="5" y1="3" x2="19" y2="3"></line></svg>;
const IconFlip = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUnlock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
const IconPeek = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconForge = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>;
const IconSpawn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconWrench = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>;

const FALLBACK_CATALOG = [
  { id: 'preset_d6', name: 'Standard D6 Die', type: 'dice', diceSides: 6, scale: 1.2 },
  { id: 'preset_pouch', name: 'Leather Loot Pouch', type: 'pouch', scale: 1.5 },
  { id: 'preset_ace_spades', name: 'Ace of Spades', type: 'card', imageUrl: 'https://deckofcardsapi.com/static/img/AS.png', backUrl: 'https://deckofcardsapi.com/static/img/back.png', scale: 0.6 },
  { id: 'preset_king_hearts', name: 'King of Hearts', type: 'card', imageUrl: 'https://deckofcardsapi.com/static/img/KH.png', backUrl: 'https://deckofcardsapi.com/static/img/back.png', scale: 0.6 },
  { id: 'preset_queen_diamonds', name: 'Queen of Diamonds', type: 'card', imageUrl: 'https://deckofcardsapi.com/static/img/QD.png', backUrl: 'https://deckofcardsapi.com/static/img/back.png', scale: 0.6 },
  { id: 'preset_bunny', name: 'Bunny Token', type: 'token', imageUrl: 'https://pixijs.com/assets/bunny.png', scale: 4 },
];

const COLOR_OPTIONS = [
  { name: 'Amber', value: 0xF0A30A }, { name: 'Brown', value: 0x825A2C },
  { name: 'Cobalt', value: 0x0050EF }, { name: 'Crimson', value: 0xA20025 },
  { name: 'Cyan', value: 0x1BA1E2 }, { name: 'Magenta', value: 0xD80073 },
  { name: 'Lime', value: 0xA4C400 }, { name: 'Indigo', value: 0x6A00FF },
  { name: 'Green', value: 0x60A917 }, { name: 'Emerald', value: 0x008A00 },
  { name: 'Mauve', value: 0x76608A }, { name: 'Olive', value: 0x6D8764 },
  { name: 'Orange', value: 0xFA6800 }, { name: 'Pink', value: 0xF472D0 },
  { name: 'Red', value: 0xE51400 }, { name: 'Sienna', value: 0x7A3B3F },
  { name: 'Steel', value: 0x647687 }, { name: 'Teal', value: 0x00ABA9 },
  { name: 'Violet', value: 0xAA00FF }, { name: 'Yellow', value: 0xD8C100 }
];

const IMGBB_API_KEY = "PASTE_YOUR_KEY_HERE";

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height *= maxDim / width; width = maxDim; }
          else { width *= maxDim / height; height = maxDim; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85);
      };
    };
  });
};

function App() {
  const [isLobbyConnecting, setIsLobbyConnecting] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState(null);
  const [takenColors, setTakenColors] = useState([]);
  const [otherActivePlayers, setOtherActivePlayers] = useState([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [isPlacingMat, setIsPlacingMat] = useState(false);
  const [isMatSpotValid, setIsMatSpotValid] = useState(true);

  const [hasSelection, setHasSelection] = useState(false);
  const [canFlip, setHasFlip] = useState(false); 
  const [isSelectedLocked, setIsSelectedLocked] = useState(false); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState('selection'); 
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [singleSelectedCard, setSingleSelectedCard] = useState(null);
  const [peekImage, setPeekImage] = useState(null);
  
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [isSelectedZoneLocked, setIsSelectedZoneLocked] = useState(false);
  const [canLockSelectedZone, setCanLockSelectedZone] = useState(false);
  const [isSelectedZoneHidden, setIsSelectedZoneHidden] = useState(false);
  const [isSelectedZoneMine, setIsSelectedZoneMine] = useState(false);
  
  const [selectedTokensList, setSelectedTokensList] = useState([]);
  const [inspectorMode, setInspectorMode] = useState({ active: false });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSuccessorId, setSelectedSuccessorId] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [presetCatalog, setPresetCatalog] = useState(FALLBACK_CATALOG);
  const [customCatalog, setCustomCatalog] = useState([]);
  
  const [showForge, setShowForge] = useState(false);
  const [forgeName, setForgeName] = useState('');
  const [forgeType, setForgeType] = useState('token');
  const [forgeImageUrl, setForgeImageUrl] = useState('');
  const [forgeFile, setForgeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [forgeBackUrl, setForgeBackUrl] = useState('');
  const [forgeScale, setForgeScale] = useState(1);
  const [forgeDeckMode, setForgeDeckMode] = useState('folder'); 
  const [forgeCardCount, setForgeCardCount] = useState('');
  const [forgeCols, setForgeCols] = useState(10);
  const [forgeRows, setForgeRows] = useState(5);
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(Boolean(hasCoarsePointer || (hasTouchEvents && window.innerWidth <= 1024)));
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      gameState.disconnectAbruptly();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    window.__isPlacingMat = isPlacingMat;
    window.__onMatPlacementValidChange = (valid) => setIsMatSpotValid(valid);
  }, [isPlacingMat]);

  useEffect(() => {
    const saved = localStorage.getItem('tabletop_custom_catalog');
    if (saved) {
      try {
        setCustomCatalog(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom catalog.", e);
      }
    }
  }, []);

  const connectToRoom = () => {
    setIsLobbyConnecting(true);
    gameState.silentConnect().then(() => {
      setIsLobbyConnecting(false);
    }).catch(err => {
      console.error(err);
      alert('Could not connect to the tabletop server. Ensure tabletop-server is running.');
    });
  };

  useEffect(() => {
    connectToRoom();

    const unsubscribe = gameState.subscribe((tokens, selectedTokenIds, zones, activeZoneId, players, currentInspector) => {
      const hostStatus = gameState.isHost();
      setIsHost(hostStatus);
      if (!hostStatus) setIsDrawerOpen(false);
      
      if (currentInspector) setInspectorMode(currentInspector);

      setHasSelection(selectedTokenIds.length > 0 || activeZoneId !== null);
      setSelectedZoneId(activeZoneId);
      
      if (activeZoneId && zones[activeZoneId]) {
        setIsSelectedZoneLocked(zones[activeZoneId].isLocked);
        setIsSelectedZoneHidden(zones[activeZoneId].isHidden);
        setIsSelectedZoneMine(zones[activeZoneId].ownerId === gameState.sessionId);
      } else {
        setIsSelectedZoneLocked(false);
        setIsSelectedZoneHidden(false);
        setIsSelectedZoneMine(false);
      }
      setCanLockSelectedZone(activeZoneId ? gameState.canToggleZoneLock(activeZoneId) : false);

      setSelectedTokensList(selectedTokenIds.map(id => tokens[id]).filter(Boolean));
      const hasCardSelected = selectedTokenIds.some(id => tokens[id]?.type === 'card');
      const anyLocked = selectedTokenIds.some(id => tokens[id]?.isLocked);
      setHasFlip(hasCardSelected);
      setIsSelectedLocked(anyLocked);
      
      if (selectedTokenIds.length === 1 && tokens[selectedTokenIds[0]]?.type === 'card') {
        const c = tokens[selectedTokenIds[0]];
        if (!gameState.isTokenInOpponentMat(c)) {
          setSingleSelectedCard({ ...c, imageUrl: c.deckMode === 'sheet' ? c.sheetUrl : c.imageUrl });
        } else setSingleSelectedCard(null);
      } else setSingleSelectedCard(null);

      if (players) {
        const me = players[gameState.sessionId];
        if (me) {
          setIsPlaying(me.isPlaying);
          if (me.isPlaying && !me.hasPlacedMat) {
            setIsPlacingMat(true);
          } else if (me.hasPlacedMat) {
            setIsPlacingMat(false);
          }
          if (me.color) setPlayerColor(me.color);
        } else {
          setIsPlaying(false);
        }

        const currentTaken = Object.values(players)
          .filter(p => p.id !== gameState.sessionId)
          .map(p => p.color);
        setTakenColors(currentTaken);

        const activeOthers = Object.values(players).filter(
          p => p.id !== gameState.sessionId && p.isPlaying && p.isConnected
        );
        setOtherActivePlayers(activeOthers);
      }
    });

    gameState.onDeleteRequest((mode, zoneId) => {
      setDeleteMode(mode);
      setZoneToDelete(zoneId);
      setShowDeleteConfirm(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/assets/catalog.json')
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => { 
        if (Array.isArray(data) && data.length > 0) {
          setPresetCatalog(data);
          data.forEach(item => {
            if (item.imageUrl) new Image().src = item.imageUrl;
            if (item.backUrl) new Image().src = item.backUrl;
          });
        }
      })
      .catch(() => {});
  }, []);

  const combinedCatalog = [...presetCatalog, ...customCatalog];
  const filteredCatalog = activeCategory === 'all'
    ? combinedCatalog
    : combinedCatalog.filter(item => item.type === activeCategory);

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    gameState.joinGame(playerName.trim());
    setIsPlacingMat(true);
  };

  const handleColorSelect = (hex) => {
    if (!takenColors.includes(hex)) {
      gameState.reserveColor(hex);
    }
  };

  const getSafeSpawnPos = () => {
    const center = window.__getViewportCenter ? window.__getViewportCenter() : { x: 2500, y: 2500 };

    for (let attempt = 0; attempt < 50; attempt++) {
      const radiusSpread = attempt < 10 ? 90 : 90 + attempt * 18;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radiusSpread;
      const candidateX = Math.max(120, Math.min(4880, center.x + Math.cos(angle) * dist));
      const candidateY = Math.max(120, Math.min(4880, center.y + Math.sin(angle) * dist));

      if (!gameState.isPointInAnyMat(candidateX, candidateY, 55)) {
        return { x: candidateX, y: candidateY };
      }
    }

    return {
      x: Math.max(120, Math.min(4880, center.x + (Math.random() * 140 - 70))),
      y: Math.max(120, Math.min(4880, center.y + (Math.random() * 140 - 70))),
    };
  };

  const handleCreateCustomItem = async (e) => {
    e.preventDefault();
    if (!forgeName.trim() || !isHost) return;
    setIsUploading(true);
    let finalImageUrl = forgeImageUrl.trim();

    try {
      if (forgeFile) {
        if (forgeFile.size > 32 * 1024 * 1024) {
          alert("File is too large. Please select an image under 32MB.");
          setIsUploading(false);
          return;
        }

        const apiKey = import.meta.env.VITE_IMGBB_API_KEY || IMGBB_API_KEY;
        if (!apiKey || apiKey === "PASTE_YOUR_KEY_HERE") {
          alert("Missing VITE_IMGBB_API_KEY in the .env file.");
          setIsUploading(false);
          return;
        }

        let uploadBlob = forgeFile;
        if (forgeFile.type !== 'image/gif' && forgeDeckMode !== 'sheet') {
          uploadBlob = await compressImage(forgeFile);
        }

        const formData = new FormData();
        formData.append('image', uploadBlob, 'token.webp');
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        
        const json = await res.json();
        if (json.success) {
          finalImageUrl = json.data.url;
        } else {
          alert("Failed to upload image. Please check your network or API key.");
          setIsUploading(false);
          return;
        }
      }

      const catalogItem = {
        id: `custom_${Date.now()}`,
        name: forgeName.trim(), type: forgeType, imageUrl: finalImageUrl,
        backUrl: (forgeType === 'card' || forgeType === 'deck') ? forgeBackUrl.trim() : '',
        scale: Number(forgeScale) || 1, diceSides: 6, deckMode: forgeDeckMode,
        cardCount: Number(forgeCardCount) || 52, cols: Number(forgeCols) || 10, rows: Number(forgeRows) || 5,
        isCustom: true
      };
      
      const { x, y } = getSafeSpawnPos();
      gameState.spawnToken({ ...catalogItem, x, y });

      if (saveToLibrary) {
        const updatedCatalog = [...customCatalog, catalogItem];
        setCustomCatalog(updatedCatalog);
        localStorage.setItem('tabletop_custom_catalog', JSON.stringify(updatedCatalog));
      }
      
      setForgeName(''); setForgeImageUrl(''); setForgeBackUrl(''); setForgeFile(null); setShowForge(false);
      setSaveToLibrary(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSpawnPreset = (item) => {
    if (!isHost) return;
    const { x, y } = getSafeSpawnPos();
    gameState.spawnToken({ ...item, x, y });
  };

  const handleDeleteCustomItem = (e, id) => {
    e.stopPropagation();
    const updatedCatalog = customCatalog.filter(item => item.id !== id);
    setCustomCatalog(updatedCatalog);
    localStorage.setItem('tabletop_custom_catalog', JSON.stringify(updatedCatalog));
  };

  const handleConfirmMatPlacement = () => {
    const pos = window.__getMatPlacementPos ? window.__getMatPlacementPos() : { x: 2100, y: 2275 };
    const placed = gameState.addZone(pos.x, pos.y, 'landscape');
    if (placed) setIsPlacingMat(false);
  };

  const handleQuitGame = async () => {
    const targetId = isHost && selectedSuccessorId ? selectedSuccessorId : null;
    setIsSettingsOpen(false);
    setIsDrawerOpen(false);
    setIsPlacingMat(false);
    await gameState.quitGame(targetId);
    connectToRoom();
  };

  let helperText = isTouchDevice 
    ? "Use one finger to pan and pinch to zoom. Tap a piece to select it, or double-tap and drag on the table to draw a selection box." 
    : "Use the middle mouse button to pan and scroll to zoom. Left-click a piece to select it, or left-click and drag on the table to draw a selection box.";
    
  if (isPlacingMat) {
    helperText = "Pan the table to position your mat. The outline turns green when the spot is clear and red when it is blocked.";
  } else if (hasSelection) {
    if (selectedZoneId) {
      helperText = "Grab the mat by its title text to move it along with its contents. Use the menu buttons to lock it or hide it from others.";
    } else if (selectedTokensList.length > 0) {
      const types = selectedTokensList.map(t => t?.type);
      const hostAppend = isHost ? " Drag items to the bottom of your screen to vaporize them." : "";
      
      if (types.includes('card')) {
        helperText = "Drag to move the selected cards or double-tap to flip them. Shake them rapidly back and forth to shuffle the pile. Press and hold on any selected card to stack all selected items together." + hostAppend;
      } else if (types.includes('pouch')) {
        helperText = "Drop items over a locked pouch to store them inside. Drag outward from a locked pouch to draw a random item." + hostAppend;
      } else {
        helperText = "Drag to move the selected pieces. Shake them rapidly back and forth to roll the dice or shuffle the stack. Press and hold on any selected piece to stack all selected items together." + hostAppend;
      }
    }
  }

  const helperStyle = isTouchDevice 
    ? { position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', left: '50%', transform: 'translateX(-50%)', marginTop: '0px' }
    : { position: 'absolute', bottom: 30, left: 30 };

  if (!isPlaying) {
    return (
      <div style={{ width: '100vw', height: '100dvh', minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleJoinGame} style={{ backgroundColor: '#1e293b', padding: '36px', borderRadius: '16px', border: '2px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', width: '380px', maxWidth: '90vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ margin: 0, color: '#f8fafc', textAlign: 'center' }}>Tabletop Sandbox</h2>
          
          {isLobbyConnecting ? (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>Connecting to Server...</div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Your Name</label>
                <input type="text" placeholder="e.g. Alex" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>Choose a Color</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', justifyItems: 'center' }}>
                  {COLOR_OPTIONS.map((col) => {
                    const isTaken = takenColors.includes(col.value);
                    const isSelected = playerColor === col.value;
                    return (
                      <div
                        key={col.value}
                        onClick={() => handleColorSelect(col.value)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          backgroundColor: `#${col.value.toString(16).padStart(6, '0')}`,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                          boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.7)' : 'none',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          opacity: isTaken ? 0.2 : 1,
                          transition: 'all 0.15s ease'
                        }}
                        title={isTaken ? `${col.name} (Locked)` : col.name}
                      />
                    );
                  })}
                </div>
              </div>
              <button type="submit" style={{ padding: '14px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Join Table</button>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', minHeight: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {isHost && (
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          disabled={isPlacingMat || inspectorMode.active}
          style={{
            position: 'absolute', top: 20, left: isDrawerOpen ? 340 : 20, zIndex: 30,
            padding: '10px', cursor: (isPlacingMat || inspectorMode.active) ? 'not-allowed' : 'pointer',
            backgroundColor: '#1e293b', color: '#f8fafc', border: '2px solid #475569',
            borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
            transition: 'left 0.25s ease', opacity: (isPlacingMat || inspectorMode.active) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Asset Library"
        >
          <IconBox />
        </button>
      )}

      <button
        onClick={() => setIsSettingsOpen(true)}
        disabled={inspectorMode.active}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 30,
          padding: '10px 14px', cursor: inspectorMode.active ? 'not-allowed' : 'pointer',
          backgroundColor: '#1e293b', color: '#f8fafc', border: '2px solid #475569',
          borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: '10px',
          opacity: inspectorMode.active ? 0.5 : 1
        }}
        title="Settings"
      >
        <span style={{
          width: '12px', height: '12px', borderRadius: '50%',
          backgroundColor: playerColor ? `#${playerColor.toString(16).padStart(6, '0')}` : '#22c55e',
          display: 'inline-block'
        }} />
        <IconMenu />
      </button>

      <div style={{ 
        ...helperStyle, 
        color: '#e2e8f0', 
        fontSize: '11.5px', 
        letterSpacing: '0.5px', 
        textShadow: '0 1px 2px #000, 0 2px 8px #000',
        pointerEvents: 'none', 
        zIndex: 40, 
        whiteSpace: 'nowrap',
        opacity: inspectorMode.active ? 0 : 1
      }}>
        {helperText}
      </div>

      {isHost && (
        <div style={{ position: 'absolute', top: 0, left: isDrawerOpen ? 0 : -330, width: '320px', height: '100dvh', minHeight: '100vh', backgroundColor: '#0f172a', borderRight: '2px solid #334155', zIndex: 25, color: '#f8fafc', display: 'flex', flexDirection: 'column', transition: 'left 0.25s ease', boxShadow: isDrawerOpen ? '8px 0 20px rgba(0,0,0,0.6)' : 'none', boxSizing: 'border-box', padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Item Library</h3>
            <button onClick={() => setShowForge(!showForge)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: showForge ? '#64748b' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px' }}>
              {showForge ? 'Cancel' : <><IconForge /> Forge Item</>}
            </button>
          </div>

          {showForge && (
            <form onSubmit={handleCreateCustomItem} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #3b82f6' }}>
              <input type="text" placeholder="Item Name" value={forgeName} onChange={(e) => setForgeName(e.target.value)} style={inputStyle} required />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={forgeType} onChange={(e) => { const t = e.target.value; setForgeType(t); setForgeScale(t === 'card' ? 0.6 : (t === 'token' ? 2 : 1)); }} style={{ ...inputStyle, flex: 1 }}>
                  <option value="token">Token</option><option value="card">Card (2-Sided)</option><option value="deck">Card Deck (Bulk)</option><option value="dice">Dice (D6)</option><option value="pouch">Loot Pouch</option><option value="board">Game Board</option>
                </select>
                <input type="number" step="0.1" min="0.1" max="10" title="Scale" value={forgeScale} onChange={(e) => setForgeScale(e.target.value)} style={{ ...inputStyle, width: '65px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload Image (Overrides URL)</span>
                <input type="file" accept="image/*" onChange={(e) => setForgeFile(e.target.files[0])} style={{ fontSize: '12px', color: '#f8fafc' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>- or -</div>
              <input type="text" placeholder="Image URL or /assets/file.webp" value={forgeImageUrl} onChange={(e) => setForgeImageUrl(e.target.value)} style={inputStyle} disabled={!!forgeFile} />

              {(forgeType === 'card' || forgeType === 'deck') && <input type="text" placeholder="Card Back URL" value={forgeBackUrl} onChange={(e) => setForgeBackUrl(e.target.value)} style={inputStyle} />}
              
              {forgeType === 'deck' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <label style={{ cursor: 'pointer' }}><input type="radio" checked={forgeDeckMode === 'folder'} onChange={() => setForgeDeckMode('folder')} /> Folder ({'{n}'})</label>
                    <label style={{ cursor: 'pointer' }}><input type="radio" checked={forgeDeckMode === 'sheet'} onChange={() => setForgeDeckMode('sheet')} /> Sprite Sheet</label>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Cards:</span>
                    <input type="number" min="1" value={forgeCardCount} onChange={(e) => setForgeCardCount(e.target.value)} style={{ ...inputStyle, width: '70px' }} required />
                  </div>
                  {forgeDeckMode === 'sheet' && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Grid:</span>
                      <input type="number" min="1" value={forgeCols} onChange={(e) => setForgeCols(e.target.value)} style={{ ...inputStyle, width: '45px' }} />
                      <span>x</span>
                      <input type="number" min="1" value={forgeRows} onChange={(e) => setForgeRows(e.target.value)} style={{ ...inputStyle, width: '45px' }} />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <input type="checkbox" id="saveLib" checked={saveToLibrary} onChange={(e) => setSaveToLibrary(e.target.checked)} />
                <label htmlFor="saveLib" style={{ fontSize: '12px', color: '#f8fafc', cursor: 'pointer' }}>Save to My Library</label>
              </div>

              <button type="submit" disabled={isUploading} style={{ padding: '8px', backgroundColor: isUploading ? '#64748b' : '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isUploading ? 'wait' : 'pointer' }}>
                {isUploading ? 'Uploading...' : 'Spawn Item'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {['all', 'card', 'token', 'dice', 'pouch', 'board'].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '14px', cursor: 'pointer', border: 'none', textTransform: 'capitalize', fontWeight: 'bold', backgroundColor: activeCategory === cat ? '#3b82f6' : '#1e293b', color: activeCategory === cat ? '#fff' : '#94a3b8' }}>{cat}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredCatalog.map(item => (
              <div key={item.id} onClick={() => handleSpawnPreset(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{item.type} {item.isCustom && '(Custom)'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.isCustom && (
                    <button onClick={(e) => handleDeleteCustomItem(e, item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete from Library">
                      <IconTrash />
                    </button>
                  )}
                  <span style={{ color: '#3b82f6' }} title="Spawn"><IconSpawn /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPlacingMat && (
        <button 
          onClick={handleConfirmMatPlacement}
          disabled={!isMatSpotValid}
          style={{
            position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
            zIndex: 40, padding: '14px 28px', fontSize: '16px', fontWeight: 'bold',
            backgroundColor: isMatSpotValid ? '#22c55e' : '#64748b',
            color: '#fff', border: 'none', borderRadius: '12px',
            cursor: isMatSpotValid ? 'pointer' : 'not-allowed',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'
          }}
        >
          Confirm Placement
        </button>
      )}

      {hasSelection && !isPlacingMat && !inspectorMode.active && (
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '8px', backgroundColor: '#334155', padding: '8px 12px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
          {selectedZoneId ? (
            <>
              {isSelectedZoneMine && (
                <button style={{ ...iconBtnStyle, backgroundColor: isSelectedZoneHidden ? '#8b5cf6' : '#f1f5f9', color: isSelectedZoneHidden ? '#fff' : '#0f172a' }} onClick={() => gameState.toggleZoneVisibility(selectedZoneId)} title={isSelectedZoneHidden ? 'Reveal Mat to Others' : 'Hide Mat from Others'}>
                  {isSelectedZoneHidden ? <IconEyeOff /> : <IconEye />}
                </button>
              )}
              {canLockSelectedZone && (
                <button style={{ ...iconBtnStyle, backgroundColor: isSelectedZoneLocked ? '#f59e0b' : '#f1f5f9', color: isSelectedZoneLocked ? '#fff' : '#0f172a' }} onClick={() => gameState.toggleZoneLock(selectedZoneId)} title={isSelectedZoneLocked ? 'Unlock Mat' : 'Lock Mat'}>
                  {isSelectedZoneLocked ? <IconUnlock /> : <IconLock />}
                </button>
              )}
            </>
          ) : (
            <>
              {!isSelectedLocked && (
                <>
                  <button style={iconBtnStyle} onClick={() => gameState.rotateSelected(90)} title="Rotate 90°"><IconRotate /></button>
                  {canFlip && <button style={iconBtnStyle} onClick={() => gameState.flipSelected()} title="Flip Card"><IconFlip /></button>}
                  {singleSelectedCard && <button style={{ ...iconBtnStyle, backgroundColor: '#8b5cf6', color: '#fff' }} onClick={() => setPeekImage(singleSelectedCard.imageUrl)} title="Peek"><IconPeek /></button>}
                  <button style={iconBtnStyle} onClick={() => gameState.resetSelectedRotation()} title="Reset Rotation"><IconReset /></button>
                </>
              )}
              <button style={{ ...iconBtnStyle, backgroundColor: isSelectedLocked ? '#f59e0b' : '#f1f5f9', color: isSelectedLocked ? '#fff' : '#0f172a' }} onClick={() => gameState.toggleLockSelected()} title={isSelectedLocked ? 'Unlock' : 'Lock'}>
                {isSelectedLocked ? <IconUnlock /> : <IconLock />}
              </button>
              {isHost && selectedTokensList.length === 1 && (
                <button style={{ ...iconBtnStyle, marginLeft: '10px', backgroundColor: '#3b82f6', color: '#fff' }} onClick={() => gameState.startInspector(selectedTokensList[0].id)} title="Inspector Mode">
                  <IconWrench />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {inspectorMode?.active && (
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', border: '2px solid #3b82f6', borderRadius: '12px', padding: '16px', display: 'flex', gap: '20px', alignItems: 'center', zIndex: 100, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.8)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Scale</label>
            <input type="number" step="0.1" min="0.1" max="20" 
              value={gameState.tokens[inspectorMode.tokenId]?.scale || 1} 
              onChange={(e) => gameState.updateInspectorMeta(Number(e.target.value), gameState.tokens[inspectorMode.tokenId].layerTier, gameState.tokens[inspectorMode.tokenId].label)} 
              style={{ ...inputStyle, width: '60px' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Layer Tier</label>
            <select 
              value={gameState.tokens[inspectorMode.tokenId]?.layerTier || 0} 
              onChange={(e) => gameState.updateInspectorMeta(gameState.tokens[inspectorMode.tokenId].scale, Number(e.target.value), gameState.tokens[inspectorMode.tokenId].label)} 
              style={inputStyle}
            >
              <option value="-1">Background (Map)</option>
              <option value="0">Normal (Tokens)</option>
              <option value="1">Foreground (UI)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Hover Label</label>
            <input type="text" placeholder="e.g. 50 Gold" 
              value={gameState.tokens[inspectorMode.tokenId]?.label || ""} 
              onChange={(e) => gameState.updateInspectorMeta(gameState.tokens[inspectorMode.tokenId].scale, gameState.tokens[inspectorMode.tokenId].layerTier, e.target.value)} 
              style={{ ...inputStyle, width: '120px' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderLeft: '1px solid #334155', paddingLeft: '16px' }}>
            <input type="checkbox" id="stampMode" checked={inspectorMode.stampMode} onChange={(e) => gameState.setStampMode(e.target.checked)} />
            <label htmlFor="stampMode" style={{ fontSize: '12px', color: '#f8fafc', cursor: 'pointer', fontWeight: 'bold' }}>Stamp Mode</label>
          </div>

          <button onClick={() => gameState.cancelInspector()} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }}>
            Done
          </button>
        </div>
      )}

      {isSettingsOpen && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh', minHeight: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 90, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '16px', padding: '28px', width: '360px', maxWidth: '90vw', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Table Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '10px' }}>Change Your Color</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', justifyItems: 'center', backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px' }}>
                {COLOR_OPTIONS.map((col) => {
                  const isTaken = takenColors.includes(col.value);
                  const isSelected = playerColor === col.value;
                  return (
                    <div
                      key={col.value}
                      onClick={() => handleColorSelect(col.value)}
                      style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        backgroundColor: `#${col.value.toString(16).padStart(6, '0')}`,
                        cursor: isTaken ? 'not-allowed' : 'pointer',
                        border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                        boxShadow: isSelected ? '0 0 10px rgba(255,255,255,0.7)' : 'none',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        opacity: isTaken ? 0.15 : 1
                      }}
                      title={isTaken ? `${col.name} (Locked)` : col.name}
                    />
                  );
                })}
              </div>
            </div>

            {isHost && (
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b' }}>Game Master Controls</div>
                {otherActivePlayers.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>No active players to transfer Host to.</div>
                ) : (
                  <>
                    <select
                      value={selectedSuccessorId}
                      onChange={(e) => setSelectedSuccessorId(e.target.value)}
                      style={{ ...inputStyle, width: '100%' }}
                    >
                      <option value="">-- Select Next Game Master --</option>
                      {otherActivePlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {selectedSuccessorId && (
                      <button
                        onClick={() => {
                          gameState.transferHost(selectedSuccessorId);
                          setSelectedSuccessorId('');
                        }}
                        style={{ padding: '8px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Transfer Host
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleQuitGame}
              style={{ padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
            >
              Quit Game
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && isHost && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 80, backgroundColor: '#1e293b', border: '2px solid #334155', padding: '20px 30px', borderRadius: '12px', color: '#fff', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.8)' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>
            {deleteMode === 'matching' ? 'Vaporize ALL matching items on board?' : (deleteMode === 'zone' ? 'Vaporize this Player Mat?' : 'Vaporize selected piece(s)?')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button style={{...btnStyle, backgroundColor: '#64748b', color: '#fff'}} onClick={() => { setShowDeleteConfirm(false); setZoneToDelete(null); }}>Cancel</button>
            <button style={{...btnStyle, backgroundColor: '#ef4444', color: '#fff'}} onClick={() => { deleteMode === 'matching' ? gameState.deleteMatching() : (deleteMode === 'zone' ? gameState.deleteZone(zoneToDelete) : gameState.deleteSelected()); setShowDeleteConfirm(false); setZoneToDelete(null); }}>Vaporize</button>
          </div>
        </div>
      )}

      {peekImage && (
        <div onClick={() => setPeekImage(null)} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh', backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
          <img src={peekImage} alt="Card Peek" style={{ maxHeight: '75dvh', maxWidth: '80vw', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }} />
          <span style={{ color: '#94a3b8', marginTop: '16px', fontSize: '14px', fontWeight: 'bold' }}>Click anywhere to close</span>
        </div>
      )}

      <GameCanvas />
    </div>
  );
}

const inputStyle = { padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', outline: 'none' };
const iconBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', cursor: 'pointer', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#0f172a' };
const btnStyle = { padding: '8px 16px', fontSize: '14px', cursor: 'pointer', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 'bold' };

export default App;