import { Client } from "colyseus.js";

class GameStateManager {
  constructor() {
    this.client = null;
    this.room = null;
    this.sessionId = null;
    this.isConnecting = false;

    this.tokens = {};                 
    this.zones = {};                  
    this.players = {};
    this.selectedZoneId = null;       
    this.selectedTokenIds = [];       
    this.highestZIndex = 0;           
    
    this.activePhysicsTokens = new Set(); 
    this.activeDraggedTokens = new Set();
    this.activeDraggingZoneId = null;
    this.selectionLockUntil = 0;

    this.physicsReleaseTimeouts = {};
    this.dragReleaseTimeouts = {};

    this.listeners = [];              
    this.deleteRequestListeners = []; 
    this.throwListeners = [];

    this.inspectorMode = { active: false, tokenId: null, stampMode: false };
    this.hoveredTokenId = null;

    this._garbageCollectTokens();

    if (!sessionStorage.getItem('tabletop_tab_id')) {
      sessionStorage.setItem('tabletop_tab_id', Math.random().toString(36).substring(2, 10));
    }
    this.tabId = sessionStorage.getItem('tabletop_tab_id');
    this.storageKey = `tabletop_reconnect_token_${this.tabId}`;
  }

  getTokenHalfSize(token) {
    if (token.type === 'board') return 0;
    return (token.type === 'card' ? 70 : 40) * (token.scale || 1);
  }

  _garbageCollectTokens() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tabletop_reconnect_token_')) {
          const timestamp = localStorage.getItem(`${key}_timestamp`);
          if (timestamp && Date.now() - parseInt(timestamp, 10) > 86400000) {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_timestamp`);
          }
        }
      }
    } catch (e) {}
  }

  async _attemptConnection(endpointUrl) {
    const client = new Client(endpointUrl);
    const savedToken = localStorage.getItem(this.storageKey);

    if (savedToken) {
      try {
        const room = await client.reconnect(savedToken);
        return { client, room };
      } catch (e) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(`${this.storageKey}_timestamp`);
      }
    }

    const room = await client.joinOrCreate("tabletop_room");
    return { client, room };
  }

  async silentConnect() {
    if (this.isConnecting || this.room) return;
    this.isConnecting = true;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const endpointUrl = isLocal 
      ? 'ws://localhost:2567' 
      : 'wss://tabletop-server-il7d.onrender.com/';

    try {
      const res = await this._attemptConnection(endpointUrl);
      this.client = res.client;
      this.room = res.room;

      this.sessionId = this.room.sessionId;
      localStorage.setItem(this.storageKey, this.room.reconnectionToken);
      localStorage.setItem(`${this.storageKey}_timestamp`, Date.now().toString());

      this.room.onStateChange((state) => {
        const nextZones = {};
        if (state.zones) {
          state.zones.forEach((zone, key) => {
            const isLocalDragging = this.activeDraggingZoneId === key;
            const oldZone = this.zones[key];
            nextZones[key] = {
              id: zone.id,
              ownerId: zone.ownerId,
              x: isLocalDragging && oldZone ? oldZone.x : zone.x,
              y: isLocalDragging && oldZone ? oldZone.y : zone.y,
              width: zone.width,
              height: zone.height,
              orientation: zone.orientation,
              color: zone.color,
              label: zone.label,
              isLocked: zone.isLocked,
              isHidden: zone.isHidden,
            };
          });
        }
        this.zones = nextZones;
        if (this.selectedZoneId && !this.zones[this.selectedZoneId]) this.selectedZoneId = null;

        const nextPlayers = {};
        if (state.players) {
          state.players.forEach((player, key) => {
            nextPlayers[key] = {
              id: player.id, name: player.name, color: player.color,
              isHost: player.isHost, hasPlacedMat: player.hasPlacedMat,
              isPlaying: player.isPlaying, isConnected: player.isConnected,
              cursorX: player.cursorX, cursorY: player.cursorY
            };
          });
        }
        this.players = nextPlayers;

        const nextTokens = {};
        const serverSelected = [];
        const isSelectionLocked = performance.now() < this.selectionLockUntil || this.activeDraggedTokens.size > 0;

        if (state.tokens) {
          state.tokens.forEach((token, key) => {
            const isLocalControlled = this.activePhysicsTokens.has(key) || this.activeDraggedTokens.has(key) || (this.inspectorMode.active && this.inspectorMode.tokenId === key);
            const oldToken = this.tokens[key];

            const effectiveSelectedBy = (isSelectionLocked && this.selectedTokenIds.includes(key))
              ? this.sessionId
              : token.selectedById;

            nextTokens[key] = {
              id: token.id, type: token.type, name: token.name,
              x: isLocalControlled && oldToken ? oldToken.x : token.x,
              y: isLocalControlled && oldToken ? oldToken.y : token.y,
              rotation: isLocalControlled && oldToken ? oldToken.rotation : token.rotation,
              scale: token.scale, zIndex: token.zIndex, isLocked: token.isLocked,
              imageUrl: token.imageUrl, backUrl: token.backUrl, isFaceDown: token.isFaceDown,
              deckMode: token.deckMode, sheetUrl: token.sheetUrl, cols: token.cols,
              rows: token.rows, cardIndex: token.cardIndex,
              diceValue: isLocalControlled && oldToken ? oldToken.diceValue : token.diceValue,
              diceSides: token.diceSides, label: token.label, layerTier: token.layerTier,
              selectedById: effectiveSelectedBy,
              contents: token.contents ? Array.from(token.contents) : []
            };

            if (effectiveSelectedBy === this.sessionId) {
              serverSelected.push(key);
            }
          });
        }
        this.tokens = nextTokens;
        if (isSelectionLocked) {
          this.selectedTokenIds = this.selectedTokenIds.filter(id => Boolean(this.tokens[id]));
        } else {
          this.selectedTokenIds = serverSelected;
        }
        this.notify();
      });

      this.room.onMessage("onThrow", (data) => {
        if (data.senderId === this.sessionId) return;
        this.throwListeners.forEach(listener => listener(data));
      });
      this.notify();
      
    } catch (err) {
      console.error("Connection failed:", err);
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  disconnectAbruptly() {
    if (this.room && this.room.connection) {
      this.room.connection.close();
    }
  }

  updateCursor(x, y) {
    if (!this.room) return;
    this.room.send("updateCursor", { x, y });
  }

  reserveColor(hex) {
    if (!this.room) return;
    this.room.send("reserveColor", { color: hex });
  }

  joinGame(name) {
    if (!this.room) return;
    this.room.send("joinGame", { name });
  }

  transferHost(targetId) {
    if (!this.room || !this.isHost()) return;
    this.room.send("transferHost", { targetId });
  }

  async quitGame(targetHostId = null) {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(`${this.storageKey}_timestamp`);
    if (this.room) {
      this.room.send("quitGame", { targetHostId });
      try {
        await this.room.leave(true);
      } catch (e) {}
    }
    this.room = null;
    this.sessionId = null;
    this.tokens = {};
    this.zones = {};
    this.players = {};
    this.selectedTokenIds = [];
    this.selectedZoneId = null;
    this.inspectorMode = { active: false, tokenId: null, stampMode: false };
    this.hoveredTokenId = null;
    this.notify();
  }

  isHost() { return Boolean(this.players[this.sessionId]?.isHost); }
  getMyColor() { return this.players[this.sessionId]?.color ?? 0x22c55e; }

  canMoveZone(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone || zone.isLocked) return false;
    if (zone.ownerId === this.sessionId) return true;
    const owner = this.players[zone.ownerId];
    return this.isHost() && (!owner || !owner.isConnected);
  }

  canToggleZoneLock(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone) return false;
    if (zone.ownerId === this.sessionId) return true;
    const owner = this.players[zone.ownerId];
    return this.isHost() && (!owner || !owner.isConnected);
  }

  isTokenInOpponentMat(token) {
    if (!token || token.type === 'board' || token.layerTier === -1) return false;
    return Object.values(this.zones).some(z => 
      z.ownerId !== this.sessionId &&
      token.x >= z.x && token.x <= z.x + z.width &&
      token.y >= z.y && token.y <= z.y + z.height
    );
  }

  isPointInAnyMat(x, y, padding = 40) {
    return Object.values(this.zones).some(z =>
      x >= z.x - padding && x <= z.x + z.width + padding &&
      y >= z.y - padding && y <= z.y + z.height + padding
    );
  }

  canInteractWithToken(id) {
    const token = this.tokens[id];
    if (!token) return false;
    if (token.layerTier === -1 && !this.inspectorMode.active) return false;
    if (this.isTokenInOpponentMat(token)) return false;
    if (token.selectedById && token.selectedById !== this.sessionId) return false;
    return true;
  }
  
  selectToken(id) {
    if (!this.canInteractWithToken(id)) return false;
    this.selectionLockUntil = performance.now() + 450;
    Object.values(this.tokens).forEach(t => { if (t.selectedById === this.sessionId) t.selectedById = ""; });
    this.tokens[id].selectedById = this.sessionId;
    this.selectedTokenIds = [id];
    this.selectedZoneId = null;
    if (this.room) this.room.send("selectTokens", { ids: [id], exclusive: true });
    this.notify();
    return true;
  }

  clearSelection() {
    if (this.selectedTokenIds.length === 0) return;
    this.selectionLockUntil = 0;
    this.activeDraggedTokens.clear();
    this.selectedTokenIds.forEach(id => {
      if (this.tokens[id] && this.tokens[id].selectedById === this.sessionId) this.tokens[id].selectedById = "";
    });
    this.selectedTokenIds = [];
    if (this.room) this.room.send("clearSelection");
    this.notify(); 
  }

  selectTokensInBounds(minX, minY, maxX, maxY) {
    const selected = [];
    Object.values(this.tokens).forEach(token => {
      if (!token.isLocked && this.canInteractWithToken(token.id) &&
          token.x >= minX && token.x <= maxX && token.y >= minY && token.y <= maxY) {
        selected.push(token.id);
      }
    });
    if (selected.length > 0) {
      this.selectionLockUntil = performance.now() + 450;
      Object.values(this.tokens).forEach(t => { if (t.selectedById === this.sessionId) t.selectedById = ""; });
      selected.forEach(id => { if (this.tokens[id]) this.tokens[id].selectedById = this.sessionId; });
      this.selectedTokenIds = selected;
      if (this.room) this.room.send("selectTokens", { ids: selected, exclusive: true });
      this.notify();
    }
  }

  setDraggingSelected(isDragging) {
    if (isDragging) {
      this.selectedTokenIds.forEach(id => {
        this.activeDraggedTokens.add(id);
        if (this.dragReleaseTimeouts[id]) {
          clearTimeout(this.dragReleaseTimeouts[id]);
          delete this.dragReleaseTimeouts[id];
        }
      });
    } else {
      Array.from(this.activeDraggedTokens).forEach(id => {
        this.dragReleaseTimeouts[id] = setTimeout(() => {
          this.activeDraggedTokens.delete(id);
          delete this.dragReleaseTimeouts[id];
        }, 500);
      });
    }
  }

  moveSelected(dx, dy) {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    const movableIds = [];
    this.selectedTokenIds.forEach(id => {
      const t = this.tokens[id];
      if (t && !t.isLocked && (!t.selectedById || t.selectedById === this.sessionId)) {
        const tSize = this.getTokenHalfSize(t);
        t.x = Math.max(tSize, Math.min(5000 - tSize, t.x + dx));
        t.y = Math.max(tSize, Math.min(5000 - tSize, t.y + dy));
        movableIds.push(id);
      }
    });
    if (movableIds.length > 0) {
      this.room.send("moveTokens", { ids: movableIds, dx, dy });
      this.notify();
    }
  }

  syncSelectedFinalStates() {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.selectedTokenIds.forEach(id => {
      if (this.tokens[id] && !this.tokens[id].isLocked) {
        this.syncTokenFinalState(id);
      }
    });
  }

  checkAndReleaseIfDroppedInOpponentMat() {
    const idsToRelease = this.selectedTokenIds.filter(id => this.isTokenInOpponentMat(this.tokens[id]));
    if (idsToRelease.length > 0) this.clearSelection();
  }

  markPhysicsActive(id, isActive) {
    if (isActive) {
      this.activePhysicsTokens.add(id);
      if (this.physicsReleaseTimeouts[id]) {
        clearTimeout(this.physicsReleaseTimeouts[id]);
        delete this.physicsReleaseTimeouts[id];
      }
    } else {
      this.physicsReleaseTimeouts[id] = setTimeout(() => {
        this.activePhysicsTokens.delete(id);
        delete this.physicsReleaseTimeouts[id];
      }, 500);
    }
  }

  broadcastThrow(id, x, y, vx, vy, spin, finalDiceValue) {
    if (!this.room) return;
    this.room.send("throwTokens", { id, x, y, vx, vy, spin, finalDiceValue });
  }

  syncTokenFinalState(id) {
    if (!this.room || !this.tokens[id]) return;
    const token = this.tokens[id];
    this.room.send("syncTokenState", { id: id, x: token.x, y: token.y, rotation: token.rotation, diceValue: token.diceValue });
  }
  
  onRemoteThrow(listener) { this.throwListeners.push(listener); }

  flipSelected() {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.room.send("flipCard", { ids: this.selectedTokenIds });
  }
  
  rotateSelected(degrees) {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.room.send("rotateTokens", { ids: this.selectedTokenIds, degrees });
  }

  resetSelectedRotation() {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.room.send("rotateTokens", { ids: this.selectedTokenIds, degrees: 0, absolute: true });
  }

  toggleLockSelected() {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.room.send("toggleLock", { ids: this.selectedTokenIds });
  }

  deleteSelected() {
    if (!this.room || !this.isHost() || this.selectedTokenIds.length === 0) return;
    this.room.send("deleteTokens", { ids: this.selectedTokenIds });
    this.selectedTokenIds = [];
    this.notify();
  }

  requestDelete(mode = 'selection', zoneId = null) {
    if (!this.isHost()) return;
    this.deleteRequestListeners.forEach(listener => listener(mode, zoneId));
  }

  onDeleteRequest(listener) { this.deleteRequestListeners.push(listener); }

  deleteMatching() {
    if (!this.room || !this.isHost() || this.selectedTokenIds.length === 0) return;
    const refToken = this.tokens[this.selectedTokenIds[0]];
    if (!refToken) return;
    const matchUrl = refToken.imageUrl || refToken.sheetUrl;
    const matchingIds = Object.values(this.tokens)
      .filter(t => (t.imageUrl === matchUrl && matchUrl !== "") || (t.sheetUrl === matchUrl && matchUrl !== "") || (t.type === refToken.type && t.name === refToken.name))
      .map(t => t.id);

    this.room.send("deleteTokens", { ids: matchingIds });
    this.selectedTokenIds = [];
    this.notify();
  }

  stackSelected(targetX, targetY) {
    if (!this.room || this.selectedTokenIds.length === 0) return;
    this.selectedTokenIds.forEach(id => {
      const token = this.tokens[id];
      if (token && !token.isLocked) {
        token.x = targetX; token.y = targetY;
        this.room.send("syncTokenState", { id, x: targetX, y: targetY, rotation: token.rotation, diceValue: token.diceValue });
      }
    });
    this.notify();
  }

  shuffleSelected() {
    if (!this.room) return;
    
    const shuffled = [...this.selectedTokenIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.room.send("bringToFront", { ids: shuffled });
    const diceIds = this.selectedTokenIds.filter(id => this.tokens[id]?.type === 'dice');
    if (diceIds.length > 0) this.room.send("cycleDice", { ids: diceIds });
  }

  tryAbsorbSelectedIntoPouch(dropX, dropY) {
    if (!this.room || this.selectedTokenIds.length === 0) return false;
    const targetPouch = Object.values(this.tokens).find(t => 
      t.type === 'pouch' && t.isLocked && !this.selectedTokenIds.includes(t.id) && Math.hypot(t.x - dropX, t.y - dropY) < 75
    );
    if (!targetPouch) return false;
    const absorbableIds = this.selectedTokenIds.filter(id => {
      const t = this.tokens[id]; return t && !t.isLocked && t.type !== 'board' && t.type !== 'pouch';
    });
    if (absorbableIds.length === 0) return false;
    this.room.send("absorbIntoPouch", { pouchId: targetPouch.id, tokenIds: absorbableIds });
    this.selectedTokenIds = []; this.notify();
    return true;
  }

  drawFromPouch(pouchId, spawnX, spawnY) {
    if (!this.room) return;
    this.selectionLockUntil = performance.now() + 450;
    this.room.send("drawFromPouch", { pouchId, x: spawnX, y: spawnY });
  }
  
  spawnToken(config) {
    if (!this.room || !this.isHost()) return;
    const options = typeof config === 'string' ? { imageUrl: config, type: 'token' } : config;
    if (options.type === 'deck') this.room.send("spawnDeck", options);
    else this.room.send("spawnToken", options);
  }

  // Inspector Mode Logic
  startInspector(tokenId) {
    if (!this.isHost() || !this.tokens[tokenId]) return;
    this.inspectorMode = { active: true, tokenId, stampMode: false };
    this.clearSelection();
    this.notify();
  }

  updateInspectorMeta(scale, layerTier, label) {
    if (!this.inspectorMode.active) return;
    const id = this.inspectorMode.tokenId;
    if (this.tokens[id]) {
      this.tokens[id].scale = scale;
      this.tokens[id].layerTier = layerTier;
      this.tokens[id].label = label;
      this.room.send("updateTokenMeta", { id, scale, layerTier, label });
      this.notify();
    }
  }

  setStampMode(isStamp) {
    this.inspectorMode.stampMode = isStamp;
    this.notify();
  }

  cancelInspector() {
    this.inspectorMode = { active: false, tokenId: null, stampMode: false };
    this.notify();
  }

  applyInspectorClick(x, y) {
    if (!this.inspectorMode.active) return;
    const id = this.inspectorMode.tokenId;
    const token = this.tokens[id];
    if (!token) return;

    let inOpponentMat = false;
    Object.values(this.zones).forEach(z => {
      if (z.ownerId !== this.sessionId && x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height) {
        inOpponentMat = true;
      }
    });

    if (inOpponentMat) return;

    if (this.inspectorMode.stampMode) {
      this.spawnToken({
        type: token.type, name: token.name, scale: token.scale,
        imageUrl: token.imageUrl, backUrl: token.backUrl, deckMode: token.deckMode,
        sheetUrl: token.sheetUrl, cols: token.cols, rows: token.rows, cardIndex: token.cardIndex,
        diceSides: token.diceSides, label: token.label, layerTier: token.layerTier,
        x: x, y: y
      });
    } else {
      token.x = x; token.y = y;
      this.room.send("syncTokenState", { id, x, y, rotation: token.rotation, diceValue: token.diceValue });
      this.cancelInspector();
    }
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.tokens, this.selectedTokenIds, this.zones, this.selectedZoneId, this.players, this.inspectorMode);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.tokens, this.selectedTokenIds, this.zones, this.selectedZoneId, this.players, this.inspectorMode));
  }

  static MAT_BASE_WIDTH = 800;
  static MAT_BASE_HEIGHT = 450;

  isAreaClearForMat(x, y, width, height, excludeZoneId = null, ignoredTokenIds = null) {
    if (x < 0 || y < 0 || x + width > 5000 || y + height > 5000) return false;
    const matLeft = x, matRight = x + width, matTop = y, matBottom = y + height;

    const collidesWithToken = Object.values(this.tokens).some(token => {
      if (token.type === 'board' || token.layerTier === -1) return false;
      if (ignoredTokenIds && ignoredTokenIds.has(token.id)) return false;
      if (excludeZoneId && this.zones[excludeZoneId]) {
        const z = this.zones[excludeZoneId];
        if (token.x >= z.x && token.x <= z.x + z.width && token.y >= z.y && token.y <= z.y + z.height) return false; 
      }
      const halfSize = this.getTokenHalfSize(token);
      return matLeft < token.x + halfSize && matRight > token.x - halfSize &&
             matTop < token.y + halfSize && matBottom > token.y - halfSize;
    });
    if (collidesWithToken) return false;

    const collidesWithZone = Object.values(this.zones).some(otherZone => {
      if (otherZone.id === excludeZoneId) return false;
      return matLeft < otherZone.x + otherZone.width && matRight > otherZone.x &&
             matTop < otherZone.y + otherZone.height && matBottom > otherZone.y;
    });
    return !collidesWithZone;
  }

  addZone(x, y, orientation = 'landscape') {
    if (!this.room) return false;
    const width = orientation === 'landscape' ? GameStateManager.MAT_BASE_WIDTH : GameStateManager.MAT_BASE_HEIGHT;
    const height = orientation === 'landscape' ? GameStateManager.MAT_BASE_HEIGHT : GameStateManager.MAT_BASE_WIDTH;
    const clampedX = Math.max(0, Math.min(5000 - width, x));
    const clampedY = Math.max(0, Math.min(5000 - height, y));
    if (!this.isAreaClearForMat(clampedX, clampedY, width, height)) return false;
    this.room.send("placeMat", { x: clampedX, y: clampedY, orientation });
    return true;
  }

  selectZone(id) {
    this.selectedZoneId = id;
    this.clearSelection(); 
    this.notify();
  }

  clearZoneSelection() {
    if (this.selectedZoneId) {
      this.selectedZoneId = null;
      this.notify();
    }
  }

  toggleZoneLock(zoneId) {
    if (!this.room || !this.canToggleZoneLock(zoneId)) return;
    this.room.send("toggleZoneLock", { id: zoneId });
  }

  toggleZoneVisibility(zoneId) {
    if (!this.room) return;
    this.room.send("toggleZoneVisibility", { id: zoneId });
  }

  moveZone(zoneId, dx, dy, capturedTokenIds = new Set()) {
    if (!this.room || (dx === 0 && dy === 0)) return;
    this.room.send("moveMat", { id: zoneId, dx, dy, tokenIds: Array.from(capturedTokenIds) });
  }

  deleteZone(zoneId) {
    if (!this.room || !this.isHost()) return;
    this.room.send("deleteZone", { id: zoneId });
  }
}

export const gameState = new GameStateManager();