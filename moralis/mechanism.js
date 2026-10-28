// ============================================================
// THE BALANCE — mechanism (headless). No DOM here.
// Built from Alger & Weibull (2013), Econometrica 81:2269–2302.
// Every number below is tagged with where it comes from.
// ============================================================

const CONFIG = {
  // ---- Fitness games, written as quadratic payoffs ----------------
  // pi(x,y) = c0 + c1 x + c2 y + c11 x^2 + c12 x y + c22 y^2, own strategy x in [0, m]
  games: {
    // Example 1: pi(x,y) = B(x+y) - C(x). Our choice of forms within its conditions:
    // B(s) = 3s - s^2/4, C(x) = x^2, m = 2  (B'>0, B''<0, C'(0)<B'(0), C'(m)>2B'(2m))
    publicGood: { name: 'Public good', verb: 'effort', m: 2,
      c0: 0, c1: 3, c2: 3, c11: -1.25, c12: -0.5, c22: -0.25 },
    // Section 4: hawk-dove A = [[(v-c)/2, v],[0, v/2]], x = prob. of hawk. v=4, c=6 our choice (0<v<c)
    hawkDove: { name: 'Hawk and dove', verb: 'hawkishness', m: 1, bimatrix: [[-1, 4], [0, 2]] },
    // eq. 20 / Fig. 1: prisoners' dilemma (T,R,P,S) = (7,5,3,2), x = prob. of cooperating
    pd: { name: "Prisoners' dilemma", verb: 'cooperation', m: 1, bimatrix: [[5, 2], [7, 3]] },
  },

  // ---- Societies (presets), played in order -------------------------
  // mode 'explore': test as often as needed until no newcomer beats you (our choice: no fixed attempts)
  // mode 'predict': one test; the player applies what they found (our choice: the prediction round)
  // chance: the paper's index of assortativity, stated to the player in words, never as a symbol
  societies: [
    { id: 'strangers', name: 'Strangers in a city', sigma: 0, game: 'publicGood', mode: 'explore',
      chance: 'practically never',
      story: 'Everyone deals with a stranger. A newcomer practically never meets another of its own kind.',
      source: 'Section 2.1: uniform random matching; chance zero' },
    { id: 'siblings', name: 'Siblings', sigma: 0.5, game: 'publicGood', mode: 'explore',
      chance: 'half the time',
      story: 'Children take their values from one parent, at random, and deal with their brothers and sisters. A newcomer\'s sibling shares its values half the time.',
      source: 'Section 5.1: siblings; chance one half' },
    { id: 'siblingsHD', name: 'Siblings, a different deal', sigma: 0.5, game: 'hawkDove', mode: 'explore',
      chance: 'half the time',
      story: 'The same families, so a newcomer\'s sibling still shares its values half the time. But now they quarrel over a resource instead of sharing a chore.',
      source: 'Sections 4 and 5.1: hawk–dove among siblings; chance one half' },
    { id: 'halfsib', name: 'Half-siblings', sigma: 0.25, game: 'hawkDove', mode: 'predict',
      chance: 'a quarter of the time',
      story: 'Same mother, different fathers. A newcomer\'s half-sibling shares its values a quarter of the time.',
      source: 'Footnote 24: half-siblings; chance one quarter' },
    { id: 'classmates', name: 'Classmates', sigma: 39 / 99 * 0.5, game: 'pd', mode: 'predict',
      chance: 'about one time in five',
      story: 'A new teacher changed the business ethics of some forty in a class of a hundred. Graduates go into business, half the time with a classmate, so a newcomer\'s partner shares its ethics about one time in five.',
      source: 'Section 5.2: (40 − 1)/(100 − 1) × 1/2 ≈ 0.20' },
  ],

  // ---- The gauntlet -------------------------------------------------
  mutantKappas: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], // our choice: homo moralis mutants on a grid
  leverStep: 0.05,         // our choice: resolution of the balance
  startBalance: 0.5,       // our choice: the balance starts in the middle, favouring neither end
  showAnswerAfter: 3,      // our choice: after this many failed tests in an explore round, offer to show the answer
  orderSeed: 1302269,      // our choice: seed for the order newcomers arrive in (outcomes do not depend on it)
  cloneTol: 1e-6,          // behaviour within this of the residents' counts as a behavioural clone (Section 3)
  winTol: 1e-9,            // a mutant invades if it out-earns residents by more than this (Definition 2)

  // ---- The race (divergence: stylised speed) -------------------------
  startShare: 0.06,        // our choice: newcomers' share when they arrive (rare, as in Definition 2)
  growthFrames: 34,        // our choice: frames over which a winning group spreads or dies out
  pauseMs: 240,            // our choice: pause between newcomers
  spreadShare: [0.45, 0.9],// our choice: share a winning group reaches on screen, scaled by its edge (stylised)
  edgeScale: 0.4,          // our choice: edge at which the on-screen spread saturates
};

// ---------- games ----------------------------------------------------
function gameCoefs(g) {
  if (!g.bimatrix) return g;
  // pi(x,y) = (x,1-x) A (y,1-y)'
  const [[a11, a12], [a21, a22]] = g.bimatrix;
  return { ...g, c0: a22, c1: a12 - a22, c2: a21 - a22, c11: 0, c12: a11 - a12 - a21 + a22, c22: 0 };
}
function pi(g, x, y) { return g.c0 + g.c1 * x + g.c2 * y + g.c11 * x * x + g.c12 * x * y + g.c22 * y * y; }

// Best reply of homo moralis (eq. 7) when the opponents' strategies average zbar.
// Expected utility = (1-k) pi(x, zbar) + k pi(x, x): linear in opponents' strategy, so only zbar matters.
function bestReply(g, k, zbar) {
  const a = (1 - k) * g.c11 + k * (g.c11 + g.c12 + g.c22);
  const b = (1 - k) * (g.c1 + g.c12 * zbar) + k * (g.c1 + g.c2);
  const f = x => a * x * x + b * x;
  const cands = [0, g.m];
  if (a < 0) { const v = -b / (2 * a); if (v > 0 && v < g.m) cands.push(v); }
  let best = cands[0];
  for (const c of cands) if (f(c) > f(best) + 1e-12) best = c;
  return best;
}

// Fixed point x = BR(h(x)) on [0,m] by scanning for a sign change, then bisection.
function fixedPoint(F, m) {
  const N = 400; let prev = F(0) - 0;
  if (Math.abs(prev) < 1e-12) return 0;
  for (let i = 1; i <= N; i++) {
    const x = m * i / N, d = F(x) - x;
    if (Math.abs(d) < 1e-12) return x;
    if ((d > 0) !== (prev > 0)) {
      let lo = m * (i - 1) / N, hi = x;
      for (let j = 0; j < 60; j++) { const mid = (lo + hi) / 2, dm = F(mid) - mid; if ((dm > 0) === (prev > 0)) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    prev = d;
  }
  return F(m); // corner
}

// Residents' behaviour in the limit ε→0: x* in argmax u_k(x, x*)   (eq. 13, first line)
function residentBehaviour(g, k) { return fixedPoint(x => bestReply(g, k, x), g.m); }

// Rare mutant's behaviour: y* in argmax (1-σ) u_t(y, x*) + σ u_t(y, y*)   (eq. 13, second line)
function mutantBehaviour(g, kt, sigma, xs) { return fixedPoint(y => bestReply(g, kt, (1 - sigma) * xs + sigma * y), g.m); }

// One test: resident κ against mutant κ in a society. Fitness from eqs. 11–12 at ε → 0.
function duel(g, kR, kM, sigma) {
  const x = residentBehaviour(g, kR);
  const y = mutantBehaviour(g, kM, sigma, x);
  const piR = pi(g, x, x);
  const piM = (1 - sigma) * pi(g, y, x) + sigma * pi(g, y, y);
  const clone = Math.abs(y - x) < CONFIG.cloneTol;
  const edge = clone ? 0 : piM - piR;
  return { x, y, piR, piM, edge, clone, invades: edge > CONFIG.winTol };
}

function society(i) { const s = CONFIG.societies[i]; return { ...s, g: gameCoefs(CONFIG.games[s.game]) }; }

function gauntlet(si, kR) {
  const s = society(si);
  return CONFIG.mutantKappas.map(kM => ({ kM, ...duel(s.g, kR, kM, s.sigma) }));
}

// Fitness at finite ε (eqs. 11–12 with φ(ε)=σ), used only by the fidelity check.
function payoffsAtEps(g, x, y, sigma, eps) {
  const PR = (1 - eps + eps * sigma) * pi(g, x, x) + eps * (1 - sigma) * pi(g, x, y);
  const PM = (1 - eps) * (1 - sigma) * pi(g, y, x) + (eps + (1 - eps) * sigma) * pi(g, y, y);
  return { PR, PM };
}

// ---------- tests, scoring and the verdict (all outcome rules live here) ----------

// The order newcomers arrive in: a seeded shuffle. Only the order varies; outcomes do not.
function arrivalOrder(si, testNo) {
  const rnd = mulberry32(CONFIG.orderSeed + 1000 * si + testNo);
  const idx = CONFIG.mutantKappas.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

// One test of a resident balance against the whole gauntlet: the yardstick is how many newcomers beat it.
function runTest(si, k, testNo) {
  const res = gauntlet(si, k), order = arrivalOrder(si, testNo);
  const beaten = res.filter(d => d.invades);
  return {
    k, testNo, order, res,
    beatenBy: beaten.length,
    moreMoral: beaten.filter(d => d.kM > k).length,
    lessMoral: beaten.filter(d => d.kM < k).length,
    blended: res.filter(d => d.clone && Math.abs(d.kM - k) > 1e-9).length,
    held: beaten.length === 0,
  };
}

// The share a newcomer group reaches on screen (stylised; only the direction is the model's).
function displayShare(d) {
  if (!d.invades) return d.clone ? CONFIG.startShare : 0;
  const [lo, hi] = CONFIG.spreadShare;
  return lo + (hi - lo) * Math.min(1, Math.sqrt(d.edge / CONFIG.edgeScale));
}

// A society's round: explore rounds end when a test holds (or the player asks for the answer);
// predict rounds end after one test.
function roundOver(si, tests, askedAnswer) {
  const s = CONFIG.societies[si], last = tests[tests.length - 1];
  if (!last) return false;
  return s.mode === 'predict' || last.held || !!askedAnswer;
}
function canAskAnswer(si, tests) {
  return CONFIG.societies[si].mode === 'explore' && tests.length >= CONFIG.showAnswerAfter && !tests[tests.length - 1].held;
}
function roundVerdict(si, tests, askedAnswer) {
  const s = CONFIG.societies[si], last = tests[tests.length - 1];
  return { id: s.id, mode: s.mode, sigma: s.sigma, finalK: last.k, held: last.held, tests: tests.length, askedAnswer: !!askedAnswer,
           foundOn: last.held ? tests.length : null };
}
function sessionVerdict(rounds) {
  const ex = rounds.filter(r => r.mode === 'explore'), pr = rounds.filter(r => r.mode === 'predict');
  return {
    explored: ex.length, found: ex.filter(r => r.held && !r.askedAnswer).length, testsToFind: ex.map(r => r.held ? r.tests : null),
    predicted: pr.length, predictedRight: pr.filter(r => r.held).length,
    tooMoral: rounds.filter(r => !r.held && r.finalK > r.sigma).length,
    tooSelfish: rounds.filter(r => !r.held && r.finalK < r.sigma).length,
  };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

if (typeof module !== 'undefined') module.exports = { CONFIG, gameCoefs, pi, bestReply, residentBehaviour, mutantBehaviour, duel, society, gauntlet, payoffsAtEps, mulberry32, arrivalOrder, runTest, displayShare, roundOver, canAskAnswer, roundVerdict, sessionVerdict };
