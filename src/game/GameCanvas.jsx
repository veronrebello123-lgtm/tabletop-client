import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { gameState } from './GameState';
import { OutlineFilter, GlowFilter } from 'pixi-filters';

const MIN_ZOOM_WIDTH = 500;

const getTokenHalfSize = (token) => {
  if (token.type === 'board') return 0;
  return (token.type === 'card' ? 70 : 40) * (token.scale || 1);
};

const generatedTextures = {};
const getFallbackTexture = (key, drawFn, width = 64, height = 64) => {
  if (generatedTextures[key]) return generatedTextures[key];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx);
  generatedTextures[key] = PIXI.Texture.from(canvas);
  return generatedTextures[key];
};

const cachedFilterSets = {};
const getSelectionFilterSet = (colorHex, isLocked) => {
  const key = `${colorHex}_${isLocked ? 'locked' : 'unlocked'}`;
  if (!cachedFilterSets[key]) {
    if (isLocked) {
      cachedFilterSets[key] = [new GlowFilter({ distance: 10, outerStrength: 1.5, color: colorHex })];
    } else {
      cachedFilterSets[key] = [
        new GlowFilter({ distance: 15, outerStrength: 2.5, color: colorHex }),
        new OutlineFilter(3, colorHex)
      ];
    }
  }
  return cachedFilterSets[key];
};

const drawDashedRect = (g, x, y, w, h, dash = 14, gap = 10) => {
  const drawEdge = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
    let curr = 0;
    while (curr < len) {
      const end = Math.min(curr + dash, len);
      g.moveTo(x1 + ux * curr, y1 + uy * curr);
      g.lineTo(x1 + ux * end, y1 + uy * end);
      curr += dash + gap;
    }
  };
  drawEdge(x, y, x + w, y); drawEdge(x + w, y, x + w, y + h);
  drawEdge(x + w, y + h, x, y + h); drawEdge(x, y + h, x, y);
};

const getActiveTexture = (tokenData, zones = {}) => {
  let isMasked = false;
  if (tokenData.type === 'card') {
    Object.values(zones).forEach(z => {
      if (z.ownerId !== gameState.sessionId && 
          tokenData.x >= z.x && tokenData.x <= z.x + z.width &&
          tokenData.y >= z.y && tokenData.y <= z.y + z.height) {
        isMasked = true;
      }
    });
  }

  if (tokenData.type === 'card' && (tokenData.isFaceDown || isMasked)) {
    if (tokenData.backUrl) return PIXI.Texture.from(tokenData.backUrl);
    return getFallbackTexture('default_card_back', (ctx) => {
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 4; ctx.strokeRect(4, 4, 56, 56);
    });
  }

  if (tokenData.type === 'dice') {
    const val = tokenData.diceValue || 1;
    if (tokenData.imageUrl) {
      const sliceKey = `${tokenData.imageUrl}_dice_${val}`;
      if (generatedTextures[sliceKey]) return generatedTextures[sliceKey];
      const baseTex = PIXI.BaseTexture.from(tokenData.imageUrl);
      if (baseTex.valid) {
        const cols = tokenData.cols || 3;
        const rows = tokenData.rows || 2;
        const frameW = Math.floor(baseTex.width / cols);
        const frameH = Math.floor(baseTex.height / rows);
        const idx = (val - 1) % (cols * rows);
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const rect = new PIXI.Rectangle(col * frameW, row * frameH, frameW, frameH);
        generatedTextures[sliceKey] = new PIXI.Texture(baseTex, rect);
        return generatedTextures[sliceKey];
      } else {
        baseTex.once('loaded', () => gameState.notify());
        return PIXI.Texture.WHITE;
      }
    }
    return getFallbackTexture(`dice_${val}`, (ctx) => {
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 60, 60);
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(val), 32, 34);
    });
  }

  if (tokenData.type === 'pouch' && !tokenData.imageUrl) {
    return getFallbackTexture('default_pouch', (ctx) => {
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(32, 36, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b45309'; ctx.fillRect(20, 10, 24, 10);
    });
  }

  if (tokenData.type === 'card' && tokenData.deckMode === 'sheet' && tokenData.sheetUrl) {
    const sliceKey = `${tokenData.sheetUrl}_${tokenData.cols}x${tokenData.rows}_${tokenData.cardIndex}`;
    if (generatedTextures[sliceKey]) return generatedTextures[sliceKey];
    const baseTex = PIXI.BaseTexture.from(tokenData.sheetUrl);
    if (baseTex.valid) {
      const cols = tokenData.cols || 10; const rows = tokenData.rows || 5;
      const frameW = Math.floor(baseTex.width / cols), frameH = Math.floor(baseTex.height / rows);
      const col = (tokenData.cardIndex || 0) % cols, row = Math.floor((tokenData.cardIndex || 0) / cols);
      const rect = new PIXI.Rectangle(col * frameW, row * frameH, frameW, frameH);
      generatedTextures[sliceKey] = new PIXI.Texture(baseTex, rect);
      return generatedTextures[sliceKey];
    } else {
      baseTex.once('loaded', () => gameState.notify());
      return PIXI.Texture.WHITE;
    }
  }

  if (!tokenData.imageUrl) {
    return getFallbackTexture('default_token_fallback', (ctx) => {
      ctx.fillStyle = '#475569'; ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 4; ctx.strokeRect(4, 4, 56, 56);
    });
  }

  return PIXI.Texture.from(tokenData.imageUrl);
};

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const spritesRef = useRef({}); 
  const badgesRef = useRef({});
  const dashedBordersRef = useRef({});
  const matsRef = useRef({}); 
  const cursorsRef = useRef({});

  useEffect(() => {
    const app = new PIXI.Application({
      backgroundColor: 0x0f172a,
      resizeTo: window,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    canvasRef.current.appendChild(app.view);

    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 5000,
      worldHeight: 5000,
      events: app.renderer.events,
    });
    
    app.stage.eventMode = 'static';
    app.stage.hitArea = new PIXI.Rectangle(-100000, -100000, 200000, 200000);
    app.stage.addChild(viewport);
    
    viewport
      .drag({ mouseButtons: 'all', pressDrag: true })
      .pinch()
      .wheel()
      .decelerate()
      .clampZoom({ minWidth: MIN_ZOOM_WIDTH, maxWidth: 6000 });
    
    viewport.resize(window.innerWidth, window.innerHeight);
    viewport.fitWidth(3500); 
    viewport.moveCenter(2500, 2500);

    let lastInputWasTouch = false;
    let lastMousePos = { x: 2500, y: 2500 };
    let lastMouseScreenPos = { x: 0, y: 0 };

    const handleNativePointerDown = (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        lastInputWasTouch = true;
      } else if (e.pointerType === 'mouse') {
        lastInputWasTouch = false;
        if (e.button === 0) viewport.plugins.pause('drag');
      }
    };

    const handleNativePointerUp = (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) viewport.plugins.resume('drag');
    };

    const handleNativePointerMove = (e) => {
      if (e.pointerType === 'mouse') {
        const worldPos = viewport.toWorld({ x: e.clientX, y: e.clientY });
        lastMousePos = { x: worldPos.x, y: worldPos.y };
        lastMouseScreenPos = { x: e.clientX, y: e.clientY };
        lastInputWasTouch = false;
      } else if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        lastInputWasTouch = true;
      }
    };

    window.addEventListener('pointerdown', handleNativePointerDown, { capture: true });
    window.addEventListener('pointerup', handleNativePointerUp, { capture: true });
    window.addEventListener('pointercancel', handleNativePointerUp, { capture: true });
    window.addEventListener('pointermove', handleNativePointerMove, { capture: true });

    window.__getViewportCenter = () => ({ x: viewport.center.x, y: viewport.center.y });

    const table = new PIXI.Graphics();
    table.name = 'table'; 
    table.beginFill(0x334155);
    table.drawRect(0, 0, 5000, 5000);
    table.endFill();
    table.lineStyle(2, 0x475569, 0.45);
    for (let i = 0; i <= 5000; i += 100) {
      table.moveTo(i, 0); table.lineTo(i, 5000);
      table.moveTo(0, i); table.lineTo(5000, i);
    }
    table.lineStyle(8, 0x64748b, 0.8);
    table.drawRect(0, 0, 5000, 5000);
    table.eventMode = 'static';
    viewport.addChildAt(table, 0);

    const zonesContainer = new PIXI.Container();
    viewport.addChild(zonesContainer);

    const cursorsContainer = new PIXI.Container();
    cursorsContainer.zIndex = 999990;
    viewport.addChild(cursorsContainer);

    const placementMat = new PIXI.Container();
    placementMat.visible = false;
    placementMat.zIndex = 999999;
    placementMat.eventMode = 'none';
    viewport.addChild(placementMat);

    const pmFill = new PIXI.Graphics();
    placementMat.addChild(pmFill);

    let lastPlacementValid = null;
    window.__getMatPlacementPos = () => ({
      x: Math.max(0, Math.min(5000 - 800, viewport.center.x - 400)),
      y: Math.max(0, Math.min(5000 - 450, viewport.center.y - 225)),
    });

    const hudContainer = new PIXI.Container();
    hudContainer.zIndex = 9999999;
    hudContainer.eventMode = 'none';
    app.stage.addChild(hudContainer);

    const tooltipContainer = new PIXI.Container();
    tooltipContainer.zIndex = 9999999;
    tooltipContainer.visible = false;
    const tooltipBg = new PIXI.Graphics();
    const tooltipText = new PIXI.Text('', { fontFamily: 'sans-serif', fontSize: 14, fill: 0xffffff, fontWeight: 'bold' });
    tooltipText.x = 10; tooltipText.y = 6;
    tooltipContainer.addChild(tooltipBg, tooltipText);
    app.stage.addChild(tooltipContainer);

    const vaporizerZone = new PIXI.Container();
    vaporizerZone.visible = false;
    hudContainer.addChild(vaporizerZone);

    const vapHeight = 160;
    const vapTex = getFallbackTexture('vap_grad_v2', (ctx) => {
      const grd = ctx.createLinearGradient(0, 0, 0, 128);
      grd.addColorStop(0, "rgba(239, 68, 68, 0)");
      grd.addColorStop(0.45, "rgba(239, 68, 68, 0.45)");
      grd.addColorStop(1, "rgba(220, 38, 38, 0.95)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 16, 128);
    }, 16, 128);

    const vapBg = new PIXI.Sprite(vapTex);
    vapBg.height = vapHeight;
    vaporizerZone.addChild(vapBg);

    const layoutVaporizer = () => {
      const sw = window.innerWidth;
      const sh = window.innerHeight; 
      viewport.resize(sw, sh);
      vaporizerZone.x = 0;
      vaporizerZone.y = sh - vapHeight;
      vapBg.width = sw;
      vapBg.height = vapHeight;
    };
    layoutVaporizer();
    window.addEventListener('resize', layoutVaporizer);

    const marquee = new PIXI.Graphics();
    marquee.zIndex = 999998;
    viewport.addChild(marquee);
    
    let marqueeStart = null;
    let isMarqueeMode = false;
    let lastTableTapTime = 0;
    let lastTableTapScreenPos = { x: 0, y: 0 };
    let lastCursorSync = 0;
    let vapTimer = null;

    table.on('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (window.__isPlacingMat) return;

      if (gameState.inspectorMode?.active) {
        const pos = viewport.toWorld(e.global);
        gameState.applyInspectorClick(pos.x, pos.y);
        return; 
      }

      const nativeEvent = e.nativeEvent;
      if (nativeEvent?.touches && nativeEvent.touches.length > 1) {
        isMarqueeMode = false;
        marqueeStart = null;
        marquee.clear();
        return;
      }

      gameState.clearSelection();
      gameState.clearZoneSelection();

      if (e.pointerType === 'mouse') {
        viewport.plugins.pause('drag');
        isMarqueeMode = true;
        marqueeStart = viewport.toWorld(e.global);
      } else {
        const now = Date.now();
        const distFromLastTap = Math.hypot(e.global.x - lastTableTapScreenPos.x, e.global.y - lastTableTapScreenPos.y);

        if (now - lastTableTapTime < 320 && distFromLastTap < 45) {
          viewport.plugins.pause('drag');
          isMarqueeMode = true;
          marqueeStart = viewport.toWorld(e.global);
          lastTableTapTime = 0;
        } else {
          lastTableTapTime = now;
          lastTableTapScreenPos = { x: e.global.x, y: e.global.y };
        }
      }
    });

    table.on('globalpointermove', (e) => {
      const nativeEvent = e.nativeEvent;
      if (nativeEvent?.touches && nativeEvent.touches.length > 1) {
        if (isMarqueeMode) {
          isMarqueeMode = false;
          marqueeStart = null;
          marquee.clear();
          viewport.plugins.resume('drag');
        }
        return;
      }

      if (isMarqueeMode && marqueeStart) {
        const current = viewport.toWorld(e.global);
        const myColor = gameState.getMyColor();
        marquee.clear();
        marquee.lineStyle(3, myColor, 1);
        marquee.beginFill(myColor, 0.2);
        marquee.drawRect(
          Math.min(marqueeStart.x, current.x),
          Math.min(marqueeStart.y, current.y),
          Math.abs(current.x - marqueeStart.x),
          Math.abs(current.y - marqueeStart.y)
        );
        marquee.endFill();
      }
    });

    const finishMarquee = (e) => {
      if (isMarqueeMode && marqueeStart) {
        const current = e?.global ? viewport.toWorld(e.global) : marqueeStart;
        gameState.selectTokensInBounds(
          Math.min(marqueeStart.x, current.x),
          Math.min(marqueeStart.y, current.y),
          Math.max(marqueeStart.x, current.x),
          Math.max(marqueeStart.y, current.y)
        );
        marquee.clear();
        marqueeStart = null;
        isMarqueeMode = false;
      }
      viewport.plugins.resume('drag');
    };
    
    table.on('pointerup', finishMarquee);
    table.on('pointerupoutside', finishMarquee);
    table.on('pointercancel', finishMarquee);

    viewport.sortableChildren = true;

    const activeThrows = {};
    gameState.onRemoteThrow((data) => {
      const t = gameState.tokens[data.id];
      if (t) { t.x = data.x; t.y = data.y; t.diceValue = data.finalDiceValue; }
      activeThrows[data.id] = {
        vx: data.vx, vy: data.vy, spin: data.spin,
        finalDiceValue: data.finalDiceValue, isOwner: false, elapsed: 0
      };
      gameState.markPhysicsActive(data.id, true);
    });

    const physicsTicker = new PIXI.Ticker();
    physicsTicker.add(() => {
      const now = Date.now();

      if (now - lastCursorSync > 100) {
        const targetX = lastInputWasTouch ? viewport.center.x : lastMousePos.x;
        const targetY = lastInputWasTouch ? viewport.center.y : lastMousePos.y;
        gameState.updateCursor(targetX, targetY);
        lastCursorSync = now;
      }

      if (gameState.hoveredTokenId && gameState.selectedTokenIds.length === 0 && !gameState.inspectorMode?.active) {
        const token = gameState.tokens[gameState.hoveredTokenId];
        if (token && token.label && !token.isFaceDown) {
          tooltipText.text = token.label;
          tooltipBg.clear();
          tooltipBg.beginFill(0x0f172a, 0.9);
          tooltipBg.lineStyle(1, 0x475569, 1);
          tooltipBg.drawRoundedRect(0, 0, tooltipText.width + 20, tooltipText.height + 12, 6);
          tooltipBg.endFill();
          tooltipContainer.visible = true;
          tooltipContainer.x = lastMouseScreenPos.x + 18;
          tooltipContainer.y = lastMouseScreenPos.y + 18;
        } else {
           tooltipContainer.visible = false;
        }
      } else {
        tooltipContainer.visible = false;
      }

      Object.values(cursorsRef.current).forEach(cur => {
        if (cur.targetX !== undefined && cur.targetY !== undefined) {
          cur.x += (cur.targetX - cur.x) * 0.3;
          cur.y += (cur.targetY - cur.y) * 0.3;
        }
      });

      if (window.__isPlacingMat) {
        placementMat.visible = true;
        const targetX = Math.max(0, Math.min(5000 - 800, viewport.center.x - 400));
        const targetY = Math.max(0, Math.min(5000 - 450, viewport.center.y - 225));
        placementMat.x = targetX;
        placementMat.y = targetY;

        const isClear = gameState.isAreaClearForMat(targetX, targetY, 800, 450);
        if (lastPlacementValid !== isClear) {
          lastPlacementValid = isClear;
          if (window.__onMatPlacementValidChange) window.__onMatPlacementValidChange(isClear);
        }

        const color = isClear ? 0x22c55e : 0xef4444;
        pmFill.clear();
        pmFill.beginFill(color, 0.28);
        pmFill.lineStyle(5, color, 0.95);
        pmFill.drawRoundedRect(0, 0, 800, 450, 20);
        pmFill.endFill();
      } else if (placementMat.visible) {
        placementMat.visible = false;
        lastPlacementValid = null;
      }

      const thrownIds = Object.keys(activeThrows);
      if (thrownIds.length === 0) return;

      const dt = Math.min(physicsTicker.deltaMS, 50) / 16.667;
      let needsUpdate = false;

      thrownIds.forEach(id => {
        const token = gameState.tokens[id];
        const phys = activeThrows[id];
        if (!token || !phys || token.isLocked) {
          delete activeThrows[id];
          gameState.markPhysicsActive(id, false);
          return;
        }

        const tSize = getTokenHalfSize(token);
        token.x = Math.max(tSize, Math.min(5000 - tSize, token.x + phys.vx * dt));
        token.y = Math.max(tSize, Math.min(5000 - tSize, token.y + phys.vy * dt));

        const friction = Math.pow(0.84, dt);
        phys.vx *= friction;
        phys.vy *= friction;
        phys.elapsed += physicsTicker.deltaMS;

        const speed = Math.hypot(phys.vx, phys.vy);
        token.rotation = (token.rotation || 0) + speed * phys.spin * dt;

        if (token.type === 'dice' && speed > 2.0 && Math.floor(phys.elapsed / 60) % 2 === 0) {
          token.diceValue = ((Math.floor(phys.elapsed / 60)) % (token.diceSides || 6)) + 1;
        }

        if (speed < 0.5) {
          if (token.type === 'dice' && phys.finalDiceValue) token.diceValue = phys.finalDiceValue;
          if (phys.isOwner) {
            gameState.syncTokenFinalState(id);
            gameState.checkAndReleaseIfDroppedInOpponentMat();
          }
          delete activeThrows[id];
          gameState.markPhysicsActive(id, false);
        }
        needsUpdate = true;
      });
      if (needsUpdate) gameState.notify();
    });
    physicsTicker.start();

    const unsubscribe = gameState.subscribe((tokens, selectedTokenIds, zones = {}, selectedZoneId = null, players = {}) => {
      
      Object.values(players).forEach(p => {
        if (p.id === gameState.sessionId || !p.isPlaying || !p.isConnected) {
          if (cursorsRef.current[p.id]) {
            cursorsRef.current[p.id].destroy({ children: true });
            delete cursorsRef.current[p.id];
          }
          return;
        }
        
        let cur = cursorsRef.current[p.id];
        if (!cur) {
          cur = new PIXI.Container();
          const arrow = new PIXI.Graphics();
          arrow.beginFill(p.color || 0xffffff);
          arrow.lineStyle(2, 0xffffff, 1);
          arrow.moveTo(0, 0); arrow.lineTo(15, 20); arrow.lineTo(7, 20); arrow.lineTo(0, 30); arrow.closePath();
          arrow.endFill();
          const label = new PIXI.Text(p.name || 'Guest', { fontFamily: 'sans-serif', fontSize: 14, fill: 0xffffff, stroke: 0x0f172a, strokeThickness: 3, fontWeight: 'bold' });
          label.x = 16; label.y = 16;
          cur.addChild(arrow, label);
          cur.x = p.cursorX || 2500;
          cur.y = p.cursorY || 2500;
          cursorsContainer.addChild(cur);
          cursorsRef.current[p.id] = cur;
        }
        cur.targetX = p.cursorX;
        cur.targetY = p.cursorY;
      });

      Object.keys(matsRef.current).forEach(id => {
        if (!zones[id]) {
          matsRef.current[id].destroy({ children: true });
          delete matsRef.current[id];
        }
      });

      Object.values(zones).forEach(zone => {
        let matContainer = matsRef.current[zone.id];
        if (!matContainer) {
          matContainer = new PIXI.Container();
          const bgFill = new PIXI.Graphics(); bgFill.name = 'bgFill'; matContainer.addChild(bgFill);
          const hitArea = new PIXI.Graphics(); hitArea.name = 'hitArea'; hitArea.eventMode = 'dynamic'; matContainer.addChild(hitArea);
          const bgBorder = new PIXI.Graphics(); bgBorder.name = 'bgBorder'; matContainer.addChild(bgBorder);
          const label = new PIXI.Text('', { fontFamily: 'sans-serif', fontSize: 22, fontWeight: 'bold' });
          label.name = 'label'; label.eventMode = 'dynamic'; matContainer.addChild(label);

          let isDraggingMat = false;
          let lastPointerWorld = null;
          let startZonePos = null;
          let syncedZonePos = null;
          let lastNetworkSync = 0;
          let capturedTokenIds = new Set();

          const startMatInteraction = (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            if (window.__isPlacingMat) return;
            e.stopPropagation();
            viewport.plugins.pause('drag');
            gameState.selectZone(zone.id);

            if (!gameState.canMoveZone(zone.id)) return;
            const currentZone = gameState.zones[zone.id];
            if (!currentZone || currentZone.isLocked) return;

            isDraggingMat = true;
            gameState.activeDraggingZoneId = zone.id;
            lastPointerWorld = viewport.toWorld(e.global);
            startZonePos = { x: currentZone.x, y: currentZone.y };
            syncedZonePos = { x: currentZone.x, y: currentZone.y };

            capturedTokenIds = new Set();
            Object.values(gameState.tokens).forEach(t => {
              if (
                t.type !== 'board' &&
                t.x >= currentZone.x && t.x <= currentZone.x + currentZone.width &&
                t.y >= currentZone.y && t.y <= currentZone.y + currentZone.height
              ) {
                capturedTokenIds.add(t.id);
                gameState.activeDraggedTokens.add(t.id);
              }
            });
          };

          const onMatMove = (e) => {
            if (!isDraggingMat || !lastPointerWorld) return;
            const currentZone = gameState.zones[zone.id];
            if (!currentZone) return;

            const currentWorld = viewport.toWorld(e.global);
            const rawDx = currentWorld.x - lastPointerWorld.x;
            const rawDy = currentWorld.y - lastPointerWorld.y;
            lastPointerWorld = currentWorld;

            const nextX = Math.max(0, Math.min(5000 - currentZone.width, currentZone.x + rawDx));
            const nextY = Math.max(0, Math.min(5000 - currentZone.height, currentZone.y + rawDy));
            const stepDx = nextX - currentZone.x;
            const stepDy = nextY - currentZone.y;

            currentZone.x = nextX;
            currentZone.y = nextY;

            capturedTokenIds.forEach(tid => {
              const t = gameState.tokens[tid];
              if (t) {
                const pad = getTokenHalfSize(t);
                t.x = Math.max(pad, Math.min(5000 - pad, t.x + stepDx));
                t.y = Math.max(pad, Math.min(5000 - pad, t.y + stepDy));
              }
            });

            const isClear = gameState.isAreaClearForMat(
              currentZone.x,
              currentZone.y,
              currentZone.width,
              currentZone.height,
              currentZone.id,
              capturedTokenIds
            );
            matContainer.__isInvalidPos = !isClear;

            const now = performance.now();
            if (isClear && now - lastNetworkSync > 40) {
              const netDx = currentZone.x - syncedZonePos.x;
              const netDy = currentZone.y - syncedZonePos.y;
              if (Math.abs(netDx) > 0.5 || Math.abs(netDy) > 0.5) {
                gameState.moveZone(zone.id, netDx, netDy, capturedTokenIds);
                syncedZonePos = { x: currentZone.x, y: currentZone.y };
                lastNetworkSync = now;
              }
            }

            if (!currentZone.isLocked && gameState.isHost()) {
              const distFromBottom = window.innerHeight - e.global.y;
              if (distFromBottom < vapHeight) {
                vaporizerZone.visible = true;
                vaporizerZone.alpha = Math.min(1, (vapHeight - distFromBottom) / (vapHeight * 0.75));
              } else {
                vaporizerZone.visible = false;
              }
            }

            gameState.notify();
          };

          const onMatDragEnd = (e) => {
            viewport.plugins.resume('drag');
            if (!isDraggingMat) return;
            isDraggingMat = false;
            gameState.activeDraggingZoneId = null;
            capturedTokenIds.forEach(tid => gameState.activeDraggedTokens.delete(tid));
            vaporizerZone.visible = false;

            const currentZone = gameState.zones[zone.id];
            if (!currentZone) return;

            const pointerY = e?.global ? e.global.y : 0;

            if (gameState.isHost() && pointerY > window.innerHeight - 90 && !currentZone.isLocked) {
              const revertDx = startZonePos.x - currentZone.x;
              const revertDy = startZonePos.y - currentZone.y;
              currentZone.x = startZonePos.x;
              currentZone.y = startZonePos.y;
              capturedTokenIds.forEach(tid => {
                const t = gameState.tokens[tid];
                if (t) { t.x += revertDx; t.y += revertDy; }
              });
              const netRevertDx = startZonePos.x - syncedZonePos.x;
              const netRevertDy = startZonePos.y - syncedZonePos.y;
              if (Math.abs(netRevertDx) > 0.5 || Math.abs(netRevertDy) > 0.5) {
                gameState.moveZone(zone.id, netRevertDx, netRevertDy, capturedTokenIds);
              }
              matContainer.__isInvalidPos = false;
              gameState.notify();
              gameState.requestDelete('zone', zone.id);
            } else {
              const isClear = gameState.isAreaClearForMat(
                currentZone.x,
                currentZone.y,
                currentZone.width,
                currentZone.height,
                currentZone.id,
                capturedTokenIds
              );

              if (isClear) {
                const finalDx = currentZone.x - syncedZonePos.x;
                const finalDy = currentZone.y - syncedZonePos.y;
                if (Math.abs(finalDx) > 0.1 || Math.abs(finalDy) > 0.1) {
                  gameState.moveZone(zone.id, finalDx, finalDy, capturedTokenIds);
                }
              } else {
                const revertDx = startZonePos.x - currentZone.x;
                const revertDy = startZonePos.y - currentZone.y;
                currentZone.x = startZonePos.x;
                currentZone.y = startZonePos.y;
                capturedTokenIds.forEach(tid => {
                  const t = gameState.tokens[tid];
                  if (t) { t.x += revertDx; t.y += revertDy; }
                });
                const netRevertDx = startZonePos.x - syncedZonePos.x;
                const netRevertDy = startZonePos.y - syncedZonePos.y;
                if (Math.abs(netRevertDx) > 0.1 || Math.abs(netRevertDy) > 0.1) {
                  gameState.moveZone(zone.id, netRevertDx, netRevertDy, capturedTokenIds);
                }
              }
              matContainer.__isInvalidPos = false;
              gameState.notify();
            }

            lastPointerWorld = null;
            startZonePos = null;
            syncedZonePos = null;
            capturedTokenIds.clear();
          };

          hitArea.on('pointerdown', startMatInteraction); label.on('pointerdown', startMatInteraction);
          hitArea.on('globalpointermove', onMatMove); label.on('globalpointermove', onMatMove);
          hitArea.on('pointerup', onMatDragEnd); hitArea.on('pointerupoutside', onMatDragEnd); hitArea.on('pointercancel', onMatDragEnd);
          label.on('pointerup', onMatDragEnd); label.on('pointerupoutside', onMatDragEnd); label.on('pointercancel', onMatDragEnd);
          zonesContainer.addChild(matContainer);
          matsRef.current[zone.id] = matContainer;
        }

        const isSelected = selectedZoneId === zone.id;
        const matOwner = players[zone.ownerId];
        const isAbandoned = !matOwner;
        const isAway = isAbandoned || !matOwner.isConnected;
        const isInvalid = Boolean(matContainer.__isInvalidPos);
        const isHidden = Boolean(zone.isHidden);
        const isOpponent = zone.ownerId !== gameState.sessionId;

        const activeColor = isInvalid ? 0xef4444 : zone.color;
        const borderColor = isInvalid
          ? 0xef4444
          : (zone.isLocked ? 0xf59e0b : (isSelected ? 0xffffff : zone.color));

        const bgFill = matContainer.getChildByName('bgFill');
        bgFill.clear();
        bgFill.beginFill(activeColor, isInvalid ? 0.35 : (isHidden && isOpponent ? 0.95 : (isAway ? 0.06 : 0.18)));
        bgFill.drawRoundedRect(0, 0, zone.width, zone.height, 18);
        bgFill.endFill();

        const bgBorder = matContainer.getChildByName('bgBorder');
        bgBorder.clear();
        bgBorder.lineStyle(
          isSelected || isInvalid ? 6 : (isHidden && !isOpponent ? 4 : 3),
          isAway && !isInvalid ? 0x94a3b8 : borderColor,
          isAway && !isInvalid ? 0.5 : (isHidden && !isOpponent ? 1 : 0.9)
        );
        bgBorder.drawRoundedRect(0, 0, zone.width, zone.height, 18);

        const hitArea = matContainer.getChildByName('hitArea');
        hitArea.clear();
        hitArea.lineStyle(24, 0xffffff, 0.001);
        hitArea.drawRoundedRect(0, 0, zone.width, zone.height, 18);
        hitArea.cursor = gameState.canMoveZone(zone.id) ? 'grab' : 'pointer';

        const labelTxt = matContainer.getChildByName('label');
        let labelSuffix = '';
        if (zone.isLocked) labelSuffix += ' (Locked)';
        if (isHidden) labelSuffix += ' 👁️‍🗨️(Private)';
        if (isAbandoned) labelSuffix += ' (Abandoned)';
        else if (isAway) labelSuffix += ' (Away)';
        
        labelTxt.text = zone.label + labelSuffix;
        labelTxt.style.fill = isInvalid ? 0xef4444 : (isAway ? 0x94a3b8 : (isHidden && isOpponent ? 0x64748b : zone.color));
        labelTxt.cursor = gameState.canMoveZone(zone.id) ? 'grab' : 'pointer';
        labelTxt.x = 20;
        labelTxt.y = 16;

        matContainer.x = zone.x;
        matContainer.y = zone.y;
      });

      Object.keys(spritesRef.current).forEach((id) => {
        if (!tokens[id]) {
          spritesRef.current[id].destroy();
          delete spritesRef.current[id];
          if (badgesRef.current[id]) {
            badgesRef.current[id].destroy({ children: true });
            delete badgesRef.current[id];
          }
          if (dashedBordersRef.current[id]) {
            dashedBordersRef.current[id].destroy();
            delete dashedBordersRef.current[id];
          }
        }
      });

      const tokenList = Object.values(tokens);
      
      const stackBadgeCounts = {};
      const visited = new Set();
      tokenList.forEach(t1 => {
        if (visited.has(t1.id) || t1.type === 'board' || t1.type === 'pouch') return;
        const cluster = tokenList.filter(t2 => t2.type !== 'board' && t2.type !== 'pouch' && Math.hypot(t1.x - t2.x, t1.y - t2.y) < 20);
        cluster.forEach(c => visited.add(c.id));
        if (cluster.length > 1) {
          stackBadgeCounts[cluster.reduce((prev, curr) => ((curr.zIndex || 0) > (prev.zIndex || 0) ? curr : prev)).id] = cluster.length;
        }
      });

      tokenList.forEach((tokenData) => {
        let sprite = spritesRef.current[tokenData.id];
        let isInsideHiddenOpponentZone = false;
        
        Object.values(zones).forEach(z => {
          if (z.isHidden && z.ownerId !== gameState.sessionId &&
              tokenData.x >= z.x && tokenData.x <= z.x + z.width &&
              tokenData.y >= z.y && tokenData.y <= z.y + z.height) {
            isInsideHiddenOpponentZone = true;
          }
        });

        if (!sprite) {
          sprite = new PIXI.Sprite(getActiveTexture(tokenData, zones));
          sprite.anchor.set(0.5);
          sprite.eventMode = 'dynamic';
          sprite.cursor = 'pointer';

          let isDragging = false, lastPos = null, lastTapTime = 0, holdTimer = null, totalDragDistance = 0, drawnFromPouch = false;
          let velSamples = [], lastDirX = 0, shakeCount = 0, lastShakeTime = 0;
          let currentVapMode = 'selection';

          sprite.on('pointerover', () => {
            if (tokenData.label && !tokenData.isFaceDown && !isInsideHiddenOpponentZone) {
               gameState.hoveredTokenId = tokenData.id;
            }
          });
          
          sprite.on('pointerout', () => {
            if (gameState.hoveredTokenId === tokenData.id) gameState.hoveredTokenId = null;
          });

          sprite.on('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            if (window.__isPlacingMat || gameState.inspectorMode?.active) return;

            const currentToken = gameState.tokens[tokenData.id];
            if (!currentToken || !gameState.canInteractWithToken(tokenData.id)) return;
            e.stopPropagation();

            viewport.plugins.pause('drag');

            const now = Date.now();
            if (now - lastTapTime < 300) {
              if (tokenData.type === 'card') {
                if (!gameState.selectedTokenIds.includes(tokenData.id)) gameState.selectToken(tokenData.id);
                gameState.flipSelected();
              }
              lastTapTime = 0;
              if (holdTimer) clearTimeout(holdTimer);
              return;
            }
            lastTapTime = now;

            if (!gameState.selectedTokenIds.includes(tokenData.id)) {
              if (!gameState.selectToken(tokenData.id)) return;
            }

            isDragging = true;
            gameState.setDraggingSelected(true);
            drawnFromPouch = false;
            totalDragDistance = 0;
            velSamples = [];
            shakeCount = 0;
            currentVapMode = 'selection';
            lastPos = viewport.toWorld(e.global);

            holdTimer = setTimeout(() => {
              if (totalDragDistance < 15 && gameState.selectedTokenIds.length > 1) {
                gameState.stackSelected(gameState.tokens[tokenData.id]?.x, gameState.tokens[tokenData.id]?.y);
              }
            }, 500);
          });

          sprite.on('globalpointermove', (e) => {
            if (!isDragging || !lastPos) return;
            const currentToken = gameState.tokens[tokenData.id];
            if (!currentToken) return;

            const newPos = viewport.toWorld(e.global);
            const dx = newPos.x - lastPos.x, dy = newPos.y - lastPos.y;
            totalDragDistance += Math.abs(dx) + Math.abs(dy);

            if (currentToken.type === 'pouch' && currentToken.isLocked) {
              if (!drawnFromPouch && totalDragDistance > 15 && currentToken.contents?.length > 0) {
                drawnFromPouch = true;
                gameState.drawFromPouch(currentToken.id, newPos.x, newPos.y);
              } else if (drawnFromPouch) {
                gameState.setDraggingSelected(true);
                gameState.moveSelected(dx, dy);
              }
              lastPos = newPos;
              return;
            }

            if (currentToken.isLocked) return;

            const now = performance.now();
            velSamples.push({ x: newPos.x, y: newPos.y, t: now });
            while (velSamples.length > 0 && now - velSamples[0].t > 100) velSamples.shift();

            if (gameState.isHost()) {
              const distFromBottom = window.innerHeight - e.global.y;
              if (distFromBottom < vapHeight) {
                vaporizerZone.visible = true;
                vaporizerZone.alpha = Math.min(1, (vapHeight - distFromBottom) / (vapHeight * 0.75));
                if (distFromBottom < 85) {
                  if (!vapTimer && currentVapMode !== 'matching') {
                    vapTimer = setTimeout(() => {
                      currentVapMode = 'matching';
                    }, 800);
                  }
                } else {
                  currentVapMode = 'selection';
                  if (vapTimer) { clearTimeout(vapTimer); vapTimer = null; }
                }
              } else {
                vaporizerZone.visible = false;
                currentVapMode = 'selection';
                if (vapTimer) { clearTimeout(vapTimer); vapTimer = null; }
              }
            }

            if (Math.abs(dx) > 8) {
              const dirX = Math.sign(dx);
              if (lastDirX !== 0 && dirX !== lastDirX) {
                const shakeNow = Date.now();
                if (shakeNow - lastShakeTime < 350) {
                  if (++shakeCount >= 3) { gameState.shuffleSelected(); shakeCount = 0; }
                } else shakeCount = 1;
                lastShakeTime = shakeNow;
              }
              lastDirX = dirX;
            }
            gameState.moveSelected(dx, dy);
            lastPos = newPos;
          });

          const onDragEnd = (e) => {
            viewport.plugins.resume('drag');
            if (!isDragging) return;
            isDragging = false;
            gameState.setDraggingSelected(false);
            vaporizerZone.visible = false;
            if (vapTimer) { clearTimeout(vapTimer); vapTimer = null; }
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }

            const pointerY = e?.global ? e.global.y : 0;
            if (lastPos && gameState.isHost() && pointerY > window.innerHeight - 90 && !gameState.tokens[tokenData.id]?.isLocked) {
              gameState.requestDelete(currentVapMode);
              lastPos = null;
              return;
            }

            if (lastPos && totalDragDistance > 10) {
              const absorbed = gameState.tryAbsorbSelectedIntoPouch(lastPos.x, lastPos.y);
              if (!absorbed) {
                const now = performance.now();
                while (velSamples.length > 0 && now - velSamples[0].t > 100) velSamples.shift();
                
                let didThrow = false;
                if (velSamples.length >= 2) {
                  const first = velSamples[0], last = velSamples[velSamples.length - 1];
                  const dtMs = Math.max(16, last.t - first.t);
                  const vxFrame = ((last.x - first.x) / dtMs) * 16.667;
                  const vyFrame = ((last.y - first.y) / dtMs) * 16.667;
                  const rawSpeed = Math.hypot(vxFrame, vyFrame);

                  if (rawSpeed > 14) {
                    didThrow = true;
                    const scale = Math.min(1, 65 / rawSpeed) * 0.78;
                    gameState.selectedTokenIds.forEach(selId => {
                      const t = gameState.tokens[selId];
                      if (t && !t.isLocked) {
                        const startVx = vxFrame * scale, startVy = vyFrame * scale;
                        const spin = (Math.random() > 0.5 ? 1 : -1) * 0.9;
                        const dVal = t.type === 'dice' ? Math.floor(Math.random() * (t.diceSides || 6)) + 1 : t.diceValue;

                        gameState.broadcastThrow(selId, t.x, t.y, startVx, startVy, spin, dVal);
                        gameState.markPhysicsActive(selId, true);
                        activeThrows[selId] = { vx: startVx, vy: startVy, spin, finalDiceValue: dVal, isOwner: true, elapsed: 0 };
                      }
                    });
                  }
                }

                if (!didThrow) {
                  gameState.syncSelectedFinalStates();
                  gameState.checkAndReleaseIfDroppedInOpponentMat();
                }
              }
            }
            lastPos = null;
          };

          sprite.on('pointerup', onDragEnd);
          sprite.on('pointerupoutside', onDragEnd);
          sprite.on('pointercancel', onDragEnd);
          viewport.addChild(sprite);
          spritesRef.current[tokenData.id] = sprite;
        }

        const isRestricted = gameState.isTokenInOpponentMat(tokenData) || (tokenData.selectedById && tokenData.selectedById !== gameState.sessionId);
        
        sprite.renderable = !isInsideHiddenOpponentZone;
        sprite.cursor = isRestricted || isInsideHiddenOpponentZone ? 'not-allowed' : 'pointer';

        sprite.texture = getActiveTexture(tokenData, zones);
        sprite.rotation = (tokenData.rotation || 0) * (Math.PI / 180);
        sprite.scale.set(tokenData.scale || 4);
        
        const tierOffset = tokenData.layerTier === -1 ? -100000 : (tokenData.layerTier === 1 ? 100000 : 0);
        sprite.zIndex = tierOffset + (tokenData.zIndex || 0);

        const isInspected = gameState.inspectorMode?.active && gameState.inspectorMode?.tokenId === tokenData.id;
        
        if (isInspected) {
            sprite.alpha = 0.6;
            sprite.eventMode = 'none'; 
            sprite.x = lastMousePos.x;
            sprite.y = lastMousePos.y;
        } else {
            sprite.alpha = 1;
            sprite.x = tokenData.x;
            sprite.y = tokenData.y;
            
            if (tokenData.layerTier === -1 && !tokenData.selectedById) {
                sprite.eventMode = 'none'; 
            } else {
                sprite.eventMode = isInsideHiddenOpponentZone ? 'none' : 'dynamic';
            }
        }
        
        let dashedBorder = dashedBordersRef.current[tokenData.id];

        if (tokenData.selectedById && sprite.renderable && !isInspected) {
          const pColor = players[tokenData.selectedById]?.color || 0x22c55e;
          const targetFilters = getSelectionFilterSet(pColor, tokenData.isLocked);
          if (sprite.filters !== targetFilters) {
            sprite.filters = targetFilters;
          }

          if (tokenData.isLocked) {
            if (!dashedBorder) {
              dashedBorder = new PIXI.Graphics();
              viewport.addChild(dashedBorder);
              dashedBordersRef.current[tokenData.id] = dashedBorder;
            }
            const w = sprite.width || 64, h = sprite.height || 64;
            dashedBorder.clear();
            dashedBorder.lineStyle(4, pColor, 1);
            drawDashedRect(dashedBorder, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 14, 10);
            dashedBorder.x = tokenData.x;
            dashedBorder.y = tokenData.y;
            dashedBorder.rotation = sprite.rotation;
            dashedBorder.zIndex = (tokenData.zIndex || 0) + 0.4 + tierOffset;
          } else if (dashedBorder) {
            dashedBorder.destroy();
            delete dashedBordersRef.current[tokenData.id];
          }
        } else {
          if (sprite.filters && sprite.filters.length > 0) {
            sprite.filters = [];
          }
          if (dashedBorder) {
            dashedBorder.destroy();
            delete dashedBordersRef.current[tokenData.id];
          }
        }

        const countToShow = tokenData.type === 'pouch' ? (tokenData.contents?.length || 0) : (stackBadgeCounts[tokenData.id] || 0);
        let badge = badgesRef.current[tokenData.id];
        if (countToShow > 0 && sprite.renderable && !isInspected) {
          if (!badge) {
            badge = new PIXI.Container();
            badge.eventMode = 'none';
            const bg = new PIXI.Graphics();
            const txt = new PIXI.Text('', { fontFamily: 'sans-serif', fontSize: 28, fontWeight: 'bold', fill: 0xffffff });
            txt.anchor.set(0.5);
            badge.addChild(bg);
            badge.addChild(txt);
            viewport.addChild(badge);
            badgesRef.current[tokenData.id] = badge;
          }
          const bg = badge.children[0], txt = badge.children[1];
          txt.text = String(countToShow);
          bg.clear();
          bg.beginFill(tokenData.type === 'pouch' ? 0xd97706 : 0x2563eb);
          bg.lineStyle(3, 0xffffff, 1);
          bg.drawRoundedRect(-26, -20, 52, 40, 14);
          bg.endFill();
          const offset = (sprite.width || 120) * 0.38;
          badge.x = tokenData.x + offset;
          badge.y = tokenData.y - offset;
          badge.zIndex = (tokenData.zIndex || 0) + 0.5 + tierOffset;
        } else if (badge) {
          badge.destroy({ children: true });
          delete badgesRef.current[tokenData.id];
        }
      });
    });

    return () => {
      window.removeEventListener('resize', layoutVaporizer);
      window.removeEventListener('pointerdown', handleNativePointerDown, { capture: true });
      window.removeEventListener('pointerup', handleNativePointerUp, { capture: true });
      window.removeEventListener('pointercancel', handleNativePointerUp, { capture: true });
      window.removeEventListener('pointermove', handleNativePointerMove, { capture: true });
      unsubscribe();
      physicsTicker.destroy();
      app.destroy(true, { children: true });
      
      spritesRef.current = {};
      badgesRef.current = {};
      dashedBordersRef.current = {};
      matsRef.current = {};
      cursorsRef.current = {};
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100dvh', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
};

export default GameCanvas;