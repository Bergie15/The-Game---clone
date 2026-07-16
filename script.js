(() => {
  'use strict';

  const HAND_SIZE_BY_PLAYERS = { 1: 8, 2: 8, 3: 7, 4: 6, 5: 6 };

  /** @type {{
   *  players: {name: string, hand: number[]}[],
   *  currentPlayerIndex: number,
   *  deck: number[],
   *  piles: {asc1: number, asc2: number, desc1: number, desc2: number},
   *  handLimit: number,
   *  cardsPlayedThisTurn: number,
   *  minPlaysRequired: number,
   *  turnHistory: {pileKey: string, prevValue: number, card: number, wasBackTen: boolean}[],
   *  selectedCard: number|null,
   * }} */
  let state = null;

  const el = (id) => document.getElementById(id);

  const screens = {
    setup: el('screen-setup'),
    rules: el('screen-rules'),
    pass: el('screen-pass'),
    game: el('screen-game'),
    over: el('screen-over'),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ---------- Setup screen ----------

  const playerCountSelect = el('player-count');
  const playerNamesContainer = el('player-names');

  function renderPlayerNameInputs() {
    const count = parseInt(playerCountSelect.value, 10);
    playerNamesContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      label.textContent = `Player ${i + 1} name`;
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Player ${i + 1}`;
      input.maxLength = 20;
      input.id = `name-input-${i}`;
      field.appendChild(label);
      field.appendChild(input);
      playerNamesContainer.appendChild(field);
    }
  }

  playerCountSelect.addEventListener('change', renderPlayerNameInputs);
  renderPlayerNameInputs();

  el('btn-rules').addEventListener('click', () => showScreen('rules'));
  el('btn-rules-back').addEventListener('click', () => showScreen('setup'));

  el('btn-start').addEventListener('click', () => {
    const count = parseInt(playerCountSelect.value, 10);
    const players = [];
    for (let i = 0; i < count; i++) {
      const input = el(`name-input-${i}`);
      const name = (input && input.value.trim()) || `Player ${i + 1}`;
      players.push({ name, hand: [] });
    }
    startGame(players);
  });

  // ---------- Game setup ----------

  function shuffledDeck() {
    const deck = [];
    for (let n = 2; n <= 99; n++) deck.push(n);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function startGame(players) {
    const handLimit = HAND_SIZE_BY_PLAYERS[players.length] || 6;
    const deck = shuffledDeck();

    players.forEach((p) => {
      p.hand = deck.splice(0, handLimit);
    });

    state = {
      players,
      currentPlayerIndex: 0,
      deck,
      piles: { asc1: 1, asc2: 1, desc1: 100, desc2: 100 },
      handLimit,
      cardsPlayedThisTurn: 0,
      minPlaysRequired: deck.length > 0 ? 2 : 1,
      turnHistory: [],
      selectedCard: null,
    };

    beginTurn();
  }

  // ---------- Turn flow ----------

  function beginTurn() {
    state.cardsPlayedThisTurn = 0;
    state.turnHistory = [];
    state.selectedCard = null;
    state.minPlaysRequired = state.deck.length > 0 ? 2 : 1;

    const player = state.players[state.currentPlayerIndex];

    if (!hasAnyLegalMove(player.hand, state.piles)) {
      endGame(false, `${player.name} has no legal move available.`);
      return;
    }

    if (state.players.length > 1) {
      el('pass-player-name').textContent = player.name;
      showScreen('pass');
    } else {
      showScreen('game');
      renderGame();
    }
  }

  el('btn-ready').addEventListener('click', () => {
    showScreen('game');
    renderGame();
  });

  function isLegalPlay(card, pileKey, piles) {
    const value = piles[pileKey];
    const ascending = pileKey === 'asc1' || pileKey === 'asc2';
    if (ascending) {
      return card > value || card === value - 10;
    }
    return card < value || card === value + 10;
  }

  function isBackTen(card, pileKey, piles) {
    const value = piles[pileKey];
    const ascending = pileKey === 'asc1' || pileKey === 'asc2';
    return ascending ? card === value - 10 : card === value + 10;
  }

  function legalPilesFor(card, piles) {
    return Object.keys(piles).filter((k) => isLegalPlay(card, k, piles));
  }

  function hasAnyLegalMove(hand, piles) {
    return hand.some((card) => legalPilesFor(card, piles).length > 0);
  }

  function playCard(card, pileKey) {
    const player = state.players[state.currentPlayerIndex];
    const idx = player.hand.indexOf(card);
    if (idx === -1) return;
    if (!isLegalPlay(card, pileKey, state.piles)) return;

    const prevValue = state.piles[pileKey];
    const wasBackTen = isBackTen(card, pileKey, state.piles);

    player.hand.splice(idx, 1);
    state.piles[pileKey] = card;
    state.cardsPlayedThisTurn += 1;
    state.turnHistory.push({ pileKey, prevValue, card, wasBackTen });
    state.selectedCard = null;

    renderGame();

    // If player still hasn't met the minimum and has no more legal moves, it's a loss.
    if (state.cardsPlayedThisTurn < state.minPlaysRequired && !hasAnyLegalMove(player.hand, state.piles)) {
      endGame(false, `${player.name} could not play the required minimum of ${state.minPlaysRequired} card(s).`);
    }
  }

  function undoLastPlay() {
    const last = state.turnHistory.pop();
    if (!last) return;
    const player = state.players[state.currentPlayerIndex];
    state.piles[last.pileKey] = last.prevValue;
    player.hand.push(last.card);
    player.hand.sort((a, b) => a - b);
    state.cardsPlayedThisTurn -= 1;
    state.selectedCard = null;
    renderGame();
  }

  function endTurn() {
    const player = state.players[state.currentPlayerIndex];

    // Draw back up to hand limit.
    while (player.hand.length < state.handLimit && state.deck.length > 0) {
      player.hand.push(state.deck.shift());
    }
    player.hand.sort((a, b) => a - b);

    const totalCardsRemaining =
      state.deck.length + state.players.reduce((sum, p) => sum + p.hand.length, 0);

    if (totalCardsRemaining === 0) {
      endGame(true, 'All 98 cards were played. Victory!');
      return;
    }

    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    beginTurn();
  }

  function concede() {
    endGame(false, 'You gave up.');
  }

  function endGame(won, message) {
    const playedCount = 98 - (state.deck.length + state.players.reduce((s, p) => s + p.hand.length, 0));
    el('over-title').textContent = won ? 'You Win!' : 'Game Over';
    el('over-title').style.color = won ? 'var(--success)' : 'var(--danger)';
    el('over-message').textContent = message;
    el('over-played').textContent = `${playedCount}/98`;
    showScreen('over');
  }

  el('btn-concede').addEventListener('click', () => {
    if (confirm('Give up and end the game now?')) concede();
  });

  el('btn-undo').addEventListener('click', undoLastPlay);
  el('btn-end-turn').addEventListener('click', endTurn);
  el('btn-play-again').addEventListener('click', () => showScreen('setup'));

  // ---------- Rendering ----------

  const pileMeta = {
    asc1: { label: 'Ascending', dir: 'up', arrow: '↑' },
    asc2: { label: 'Ascending', dir: 'up', arrow: '↑' },
    desc1: { label: 'Descending', dir: 'down', arrow: '↓' },
    desc2: { label: 'Descending', dir: 'down', arrow: '↓' },
  };

  function renderGame() {
    const player = state.players[state.currentPlayerIndex];

    el('deck-count').textContent = state.deck.length;
    const playedCount = 98 - (state.deck.length + state.players.reduce((s, p) => s + p.hand.length, 0));
    el('played-count').textContent = playedCount;
    el('current-player-label').textContent = state.players.length > 1 ? player.name : 'You';

    const remaining = Math.max(0, state.minPlaysRequired - state.cardsPlayedThisTurn);
    el('turn-message').innerHTML = remaining > 0
      ? `Play at least <strong>${remaining}</strong> more card(s) this turn.`
      : `Minimum met — play more or <strong>End Turn</strong>.`;

    el('btn-undo').disabled = state.turnHistory.length === 0;
    el('btn-end-turn').disabled = state.cardsPlayedThisTurn < state.minPlaysRequired;

    renderPiles();
    renderHand();
  }

  function renderPiles() {
    const container = el('piles');
    container.innerHTML = '';

    Object.entries(state.piles).forEach(([key, value]) => {
      const meta = pileMeta[key];
      const pileEl = document.createElement('div');
      pileEl.className = 'pile';

      const selected = state.selectedCard;
      let legal = false;
      let backTen = false;
      if (selected !== null) {
        legal = isLegalPlay(selected, key, state.piles);
        backTen = legal && isBackTen(selected, key, state.piles);
      }
      if (legal) {
        pileEl.classList.add('playable');
        if (backTen) pileEl.classList.add('back-ten');
      }

      pileEl.innerHTML = `
        <div class="pile-dir ${meta.dir}">${meta.label}</div>
        <div class="pile-value">${value}<span class="pile-arrow">${meta.arrow}</span></div>
        <div class="pile-hint">${backTen ? 'Back 10!' : ''}</div>
      `;

      pileEl.addEventListener('click', () => {
        if (state.selectedCard === null) return;
        if (!isLegalPlay(state.selectedCard, key, state.piles)) return;
        playCard(state.selectedCard, key);
      });

      container.appendChild(pileEl);
    });
  }

  function renderHand() {
    const container = el('hand');
    container.innerHTML = '';
    const player = state.players[state.currentPlayerIndex];
    const sorted = [...player.hand].sort((a, b) => a - b);

    sorted.forEach((card) => {
      const cardEl = document.createElement('div');
      const legalPiles = legalPilesFor(card, state.piles);
      const playable = legalPiles.length > 0;
      cardEl.className = `card ${playable ? 'playable' : 'unplayable'}`;
      if (state.selectedCard === card) cardEl.classList.add('selected');
      cardEl.textContent = card;

      cardEl.addEventListener('click', () => {
        if (!playable) return;

        if (state.selectedCard === card) {
          // Second click on same card: auto-play if only one legal pile, else deselect.
          if (legalPiles.length === 1) {
            playCard(card, legalPiles[0]);
          } else {
            state.selectedCard = null;
            renderGame();
          }
          return;
        }

        state.selectedCard = card;
        renderGame();
      });

      container.appendChild(cardEl);
    });
  }
})();
