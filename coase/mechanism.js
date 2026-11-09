// Coase's Cows — the mechanism. The only copy: the HTML is generated from this file verbatim (build.py) and
// calibration.js runs it headless against Coase (1960), "The Problem of Social Cost", J. Law & Econ. 3:1–44.
// Runs unchanged in Node (module.exports) and in the browser (window.COASE).
(function (root) {
'use strict';

// ============================================================================================================
// CONFIG — every number the game uses, tagged with its source in the paper or its design rationale.
// ============================================================================================================
var CONFIG = {
  // --- Quarrel 1: the cows and the corn (sections III–IV) -------------------------------------------------
  MEAT: [5, 4, 1, -1],          // our choice: meat each steer brings, 1st to 4th; Coase gives none and says the
                                // unconstrained herd is 3 (p. 6), which this reproduces; a 4th steer never pays.
                                // 1 for the third, not 2, so that every bargain settles in whole dollars on screen
  CROP_LOSS: [1, 3, 6, 10],     // p. 2 table: annual crop loss, tons, for herds of 1 to 4 steers, at $1 a ton
                                // (marginal 1, 2, 3, 4: "crop loss per additional steer")
  FENCE: 9,                     // p. 2: "the annual cost of fencing the farmer's property is $9"
  CORN_Q1: 8,                   // our choice: the corn's net worth in quarrel 1, so both neighbours stay in business
  // --- Quarrel 2: the strip by the brook (section III) -----------------------------------------------------
  CORN_Q2: 2,                   // p. 3: crop worth $12, cultivation $10, "net gain... $2"; p. 4: the route to a brook
  // --- Quarrel 3: the lawyer (section V; footnote 4) -------------------------------------------------------
  LAWYER_FEE: 3,                // our choice: the cost of one deal (section V: discovering, negotiating, drawing up);
                                // more than the $2 a deal would gain in quarrel 3, so no deal is struck
  TURNIPS: 6,                   // our choice, after footnote 4: a crop the cows do not touch, worth less than the corn
  // --- Quarrel 4: the chimney (section V) ------------------------------------------------------------------
  WORKS_PROFIT: 20,             // our choice: what running the works brings; section V gives the setting, no figures
  WASHING: 15,                  // our choice: what the hundred households' clean washing and paint are worth between them
  SMOKE_LOSS: 15,               // our choice: what the smoke spoils of it: all of it
  FILTER: 5,                    // our choice: the "smoke preventing device" of section V, p. 9
  HOUSEHOLDS: 100,              // section V: "a vast number of people"; drawn as a row of houses
  // --- Quarrel 5: sparks (section VII, pp. 15–16) ----------------------------------------------------------
  TRAIN_VALUE: [150, 100],      // p. 15: one train $150 of services a year, two $250 (so the second adds $100)
  TRAIN_COST: [50, 50],         // p. 15: one train costs $50, two $100
  FAR_CROP: 200,                // our choice: the far fields' standing crop, so totals are absolute (Coase works in differences)
  FAR_BURN_PER_TRAIN: 60,       // p. 15: one train burns $60 of crops, two $120
  NEAR_CROP_NET: 10,            // p. 16: the strip would grow $160 but releases $150 of factors elsewhere: net $10
  NEAR_BURN_PER_TRAIN: 60,      // p. 16: under liability damage doubles to $120 a train, so the strip burns $60 a train
  // --- Quarrel 6: the orchard (section VII, p. 17: "by altering the figures...") --------------------------
  ORCHARD: 300,                 // our choice: the orchard's standing crop
  ORCHARD_BURN_PER_TRAIN: 200,  // our choice: sparks in an orchard, enough that no train pays for its burning
  // --- Bargaining (section IV, p. 4: the split "would depend on the shrewdness... as bargainers") ----------
  SURPLUS_SPLIT: 0.5,           // our choice: the surplus after the fee is split evenly
  // --- Scoring (the value of production, sections V–VIII: Coase's own criterion) --------------------------
  FATE_BANDS: [1, 0.9, 0.7]     // our choice: share of the possible for the four fates (all / most / about half / less)
};

// ============================================================================================================
// The six quarrels. A quarrel: a harmer A with activity levels and marginal profits; a sufferer B with plots
// (each a standalone net worth and a damage per unit of A's activity), optionally an alternative crop; a device
// (fence, filter) either side may buy that removes all damage; a cost of talking (0, a fee, or Infinity).
// ============================================================================================================
function quarrels() {
  var C = CONFIG;
  return [
    { id: 'corn', n: 1, title: 'the cows and the corn',
      a: { name: 'the rancher', thing: 'cow', things: 'cows', verb: 'keeps', marginal: C.MEAT },
      b: { name: 'the farmer', plots: [{ name: 'the corn', worth: C.CORN_Q1, burn: C.CROP_LOSS }] },
      device: { name: 'a fence', cost: C.FENCE }, talk: 0, kind: 'farm', scene: { level: 3, choices: ['main'] },
      rulings: ['the cows may roam', 'the corn is protected: the rancher pays for what the cows eat', 'no cows on this side of the brook'],
      signs: ['cows welcome', 'corn protected', 'no cows'],
      means: ['the rancher owes nothing for corn his cows eat. the farmer may offer him money to keep them away.',
              'the rancher owes the farmer the price of every ear his cows eat. he may offer the farmer money to plant less.',
              'the rancher may keep no cows here at all. no payment can change that.'],
      facts: [
        { icon: 'cows', text: 'each cow brings the rancher $5, then $4, then $1; a fourth would lose $1' },
        { icon: 'corn', text: 'the corn is worth $8. one cow eats $1 of it, two eat $3, three eat $6, four eat $10' },
        { icon: 'fence', text: 'a fence costs $9 a year. either of them could build it' },
        { icon: 'talk', text: 'they can talk over the brook for free' }] },
    { id: 'strip', n: 2, title: 'the strip by the brook',
      a: { name: 'the rancher', thing: 'cow', things: 'cows', verb: 'keeps', marginal: C.MEAT },
      b: { name: 'the farmer', plots: [{ name: 'the strip', worth: C.CORN_Q2, burn: C.CROP_LOSS }] },
      device: { name: 'a fence', cost: C.FENCE }, talk: 0, kind: 'farm', scene: { level: 3, choices: ['main'] },
      rulings: ['the cows may roam', 'the strip is protected: the rancher pays for what the cows eat', 'no cows on this side of the brook'],
      signs: ['cows welcome', 'strip protected', 'no cows'],
      means: ['the rancher owes nothing for corn his cows eat on the strip. the farmer may offer him money to keep them away.',
              'the rancher owes the farmer the price of every ear his cows eat on the strip. he may offer the farmer money to plant less.',
              'the rancher may keep no cows here at all. no payment can change that.'],
      facts: [
        { icon: 'cows', text: 'the same cows: $5, then $4, then $1, and a fourth would lose $1' },
        { icon: 'corn', text: 'the strip is where the cows go to drink. its corn is worth $2 once it is grown. one cow eats $1, two eat $3, three eat $6' },
        { icon: 'fence', text: 'a fence costs $9 a year' },
        { icon: 'talk', text: 'they can still talk for free' }] },
    { id: 'lawyer', n: 3, title: 'the lawyer',
      a: { name: 'the rancher', thing: 'cow', things: 'cows', verb: 'keeps', marginal: C.MEAT },
      b: { name: 'the farmer', plots: [{ name: 'the corn', worth: C.CORN_Q1, burn: C.CROP_LOSS,
           alt: { name: 'turnips', worth: C.TURNIPS } }] },
      device: { name: 'a fence', cost: C.FENCE }, talk: C.LAWYER_FEE, kind: 'farm', scene: { level: 3, choices: ['main'] },
      rulings: ['the cows may roam', 'the corn is protected: the rancher pays for what the cows eat', 'no cows on this side of the brook'],
      signs: ['cows welcome', 'corn protected', 'no cows'],
      means: ['the rancher owes nothing for corn his cows eat. the farmer may offer him money, through the lawyer, to keep them away.',
              'the rancher owes the farmer the price of every ear his cows eat. he may offer the farmer money, through the lawyer, to plant less.',
              'the rancher may keep no cows here at all. no payment can change that.'],
      facts: [
        { icon: 'cows', text: 'the same cows: $5, then $4, then $1, and a fourth would lose $1' },
        { icon: 'corn', text: 'corn is worth $8; one cow eats $1, two eat $3, three eat $6. the farmer could grow turnips instead: worth $6, and cows will not touch them' },
        { icon: 'fence', text: 'a fence costs $9 a year' },
        { icon: 'lawyer', text: 'the neighbours are not speaking. any deal now goes through a lawyer, who charges $3' }] },
    { id: 'smoke', n: 4, title: 'the chimney',
      a: { name: 'the works', thing: 'furnace', things: 'furnaces', verb: 'runs', marginal: [C.WORKS_PROFIT] },
      b: { name: 'the hundred houses', plots: [{ name: 'the washing and the paint', worth: C.WASHING, burn: [C.SMOKE_LOSS] }] },
      device: { name: 'a filter', cost: C.FILTER, onlyA: true }, talk: Infinity, kind: 'smoke', scene: { level: 1, choices: ['main'] },
      rulings: ['the works may smoke', 'the houses are protected: the works pays for what the smoke spoils', 'no smoke in this town'],
      signs: ['smoke allowed', 'houses protected', 'no smoke'],
      means: ['the works owes nothing for what its smoke spoils. the houses could offer it money, if a hundred of them could agree.',
              'the works owes the houses the price of everything its smoke spoils.',
              'the works may make no smoke in this town. no payment can change that.'],
      facts: [
        { icon: 'works', text: 'running the works brings $20' },
        { icon: 'houses', text: 'a hundred houses hang out $15 of washing and fresh paint between them. the smoke spoils all of it' },
        { icon: 'filter', text: 'a filter on the chimney costs $5 and stops the smoke. only the works can fit it' },
        { icon: 'crowd', text: 'a hundred households cannot agree on a deal with anyone. no deal is possible' }] },
    { id: 'sparks', n: 5, title: 'sparks',
      a: { name: 'the railway', thing: 'train', things: 'trains', verb: 'runs', marginal: [C.TRAIN_VALUE[0] - C.TRAIN_COST[0], C.TRAIN_VALUE[1] - C.TRAIN_COST[1]] },
      b: { name: 'the farms along the line', plots: [
            { name: 'the far fields', worth: C.FAR_CROP, burn: [C.FAR_BURN_PER_TRAIN, 2 * C.FAR_BURN_PER_TRAIN] },
            { name: 'the strip by the line', worth: C.NEAR_CROP_NET, burn: [C.NEAR_BURN_PER_TRAIN, 2 * C.NEAR_BURN_PER_TRAIN], near: true }] },
      device: null, talk: Infinity, kind: 'rail', scene: { level: 2, choices: ['main', 'none'] },
      rulings: ['the railway may spark', 'the farms are protected: the railway pays for what the sparks burn', 'no trains through this valley'],
      signs: ['trains may spark', 'farms protected', 'no trains'],
      means: ['the railway owes nothing for crops its sparks burn. the farms could offer it money, if a hundred of them could agree.',
              'the railway owes the farms the price of every crop its sparks burn.',
              'the railway may run no trains through this valley. no payment can change that.'],
      facts: [
        { icon: 'train', text: 'one train a day brings the railway $100 after its costs. a second brings $50 more' },
        { icon: 'fields', text: 'the far fields grow $200 of crops. each train burns $60 of them' },
        { icon: 'strip', text: 'the strip beside the line would grow $10 of net crops, and each train would burn $60 of it. the farmers plant it only if someone pays for the burning' },
        { icon: 'crowd', text: 'a hundred farms along the line. no deal is possible' }] },
    { id: 'orchard', n: 6, title: 'the orchard',
      a: { name: 'the railway', thing: 'train', things: 'trains', verb: 'runs', marginal: [C.TRAIN_VALUE[0] - C.TRAIN_COST[0], C.TRAIN_VALUE[1] - C.TRAIN_COST[1]] },
      b: { name: 'the orchards along the line', plots: [
            { name: 'the orchards', worth: C.ORCHARD, burn: [C.ORCHARD_BURN_PER_TRAIN, 2 * C.ORCHARD_BURN_PER_TRAIN] }] },
      device: null, talk: Infinity, kind: 'rail', scene: { level: 2, choices: ['main'] },
      rulings: ['the railway may spark', 'the orchards are protected: the railway pays for what the sparks burn', 'no trains through this valley'],
      signs: ['trains may spark', 'orchards protected', 'no trains'],
      means: ['the railway owes nothing for trees its sparks burn. the orchards could offer it money, if a hundred of them could agree.',
              'the railway owes the orchards the price of every tree its sparks burn.',
              'the railway may run no trains through this valley. no payment can change that.'],
      facts: [
        { icon: 'train', text: 'the same railway: $100 for one train a day, $50 more for a second' },
        { icon: 'orchard', text: 'the orchards along the line are worth $300. sparks burn $200 of them a train' },
        { icon: 'none', text: 'there is no strip to plant and no device to fit' },
        { icon: 'crowd', text: 'a hundred orchards. no deal is possible' }] }
  ];
}

// ============================================================================================================
// Arithmetic
// ============================================================================================================
function sum(arr, n) { var s = 0; for (var i = 0; i < n; i++) s += arr[i]; return s; }
function profitA(q, level) { return sum(q.a.marginal, level); }
function burn(plot, level) { return level === 0 ? 0 : plot.burn[level - 1]; }
function plotWorth(plot, choice) { return choice === 'alt' ? plot.alt.worth : choice === 'main' ? plot.worth : 0; }
function plotChoices(plot) { return plot.alt ? ['none', 'main', 'alt'] : ['none', 'main']; }
function plotBurn(plot, choice, level, device) { return (choice === 'main' && !device) ? burn(plot, level) : 0; }

// An arrangement: A's level, each plot's choice, whether the device is in place. Its worth to the valley:
// A's profit + sum of plot worths − damage − device cost.
function arrangementTotal(q, arr) {
  var t = profitA(q, arr.level) - (arr.device ? q.device.cost : 0);
  q.b.plots.forEach(function (p, i) { t += plotWorth(p, arr.choices[i]) - plotBurn(p, arr.choices[i], arr.level, arr.device); });
  return t;
}
function allArrangements(q) {
  var out = [];
  var levels = q.a.marginal.length;
  function rec(i, choices) {
    if (i === q.b.plots.length) {
      for (var l = 0; l <= levels; l++) {
        out.push({ level: l, choices: choices.slice(), device: false });
        if (q.device) out.push({ level: l, choices: choices.slice(), device: true });
      }
      return;
    }
    plotChoices(q.b.plots[i]).forEach(function (c) { choices.push(c); rec(i + 1, choices); choices.pop(); });
  }
  rec(0, []);
  return out;
}
function efficient(q) {
  var best = null, bt = -Infinity;
  allArrangements(q).forEach(function (arr) {
    var t = arrangementTotal(q, arr);
    if (t > bt + 1e-9) { bt = t; best = arr; }
  });
  return { arr: best, total: bt };
}
function damageTotal(q, arr) {
  var d = 0; q.b.plots.forEach(function (p, i) { d += plotBurn(p, arr.choices[i], arr.level, arr.device); }); return d;
}

// Status quo under a ruling, before any deal. r: 0 = A may carry on (not liable), 1 = A must pay (liable),
// 2 = banned (level 0 by decree). Each side's own best move given the law, A moving first and anticipating
// nothing but the law; B then choosing what to plant given A's level.
function statusQuo(q, r) {
  var arr;
  if (r === 2) {
    // with no activity, B plants whichever crop is worth most
    arr = { level: 0, choices: q.b.plots.map(function (p) { return bestChoiceFor(p, 0, false, false); }), device: false };
    return finish(q, arr, r, 0, false);
  }
  if (r === 1) {
    // liable: B is made whole, so B plants what is worth most standing (compensated for burning).
    var choices = q.b.plots.map(function (p) { return bestChoiceFor(p, 0, false, false); });
    // A chooses level and device to maximise own profit − damages (or − device).
    var best = null, bp = -Infinity;
    for (var l = 0; l <= q.a.marginal.length; l++) {
      var opts = [false]; if (q.device) opts.push(true);
      opts.forEach(function (dev) {
        var a = { level: l, choices: choices, device: dev };
        var p = profitA(q, l) - (dev ? q.device.cost : 0) - damageTotal(q, a);
        if (p > bp + 1e-9) { bp = p; best = a; }
      });
    }
    return finish(q, best, r, damageTotal(q, best), best.device);
  }
  // not liable: A ignores B and picks the most profitable level; B then plants, or fences, to suit.
  var lvl = 0, bpA = -Infinity;
  for (var L = 0; L <= q.a.marginal.length; L++) { var pa = profitA(q, L); if (pa > bpA + 1e-9) { bpA = pa; lvl = L; } }
  var canFenceB = q.device && !q.device.onlyA;
  var bestB = null, bv = -Infinity;
  [false].concat(canFenceB ? [true] : []).forEach(function (dev) {
    var ch = q.b.plots.map(function (p) { return bestChoiceFor(p, lvl, dev, false); });
    var v = -(dev ? q.device.cost : 0);
    q.b.plots.forEach(function (p, i) { v += plotWorth(p, ch[i]) - plotBurn(p, ch[i], lvl, dev); });
    if (v > bv + 1e-9) { bv = v; bestB = { level: lvl, choices: ch, device: dev }; }
  });
  return finish(q, bestB, r, 0, false);
}
// B's best crop on one plot given A's level and whether a device stands; 'compensated' means B keeps the worth whole.
function bestChoiceFor(plot, level, device, compensated) {
  var best = 'none', bv = 0;
  plotChoices(plot).forEach(function (c) {
    if (c === 'none') return;
    var v = plotWorth(plot, c) - (compensated ? 0 : plotBurn(plot, c, level, device));
    if (v > bv + 1e-9) { bv = v; best = c; }
  });
  return best;
}
// Under liability B is compensated, so the planting rule is bestChoiceFor(plot, 0, false, false): worth standing.
function finish(q, arr, r, damagesPaid, deviceByA) {
  var total = arrangementTotal(q, arr);
  var payA = profitA(q, arr.level) - (arr.device && (deviceByA || r === 1) ? q.device.cost : 0) - damagesPaid;
  var payB = total - payA;
  return { arr: arr, total: total, payA: payA, payB: payB, damagesPaid: damagesPaid, deviceByA: !!(arr.device && (deviceByA || r === 1)) };
}

// The whole outcome of a ruling: status quo, then a deal if talking is cheap enough. Returns payoffs, the final
// arrangement, the transfer (positive: A pays B), the fee, and the beats.
function outcome(q, r) {
  var sq = statusQuo(q, r);
  var eff = efficient(q);
  var res = { ruling: r, sign: q.signs[r], statusQuo: sq, efficient: eff, deal: null, final: sq.arr, total: sq.total,
              payA: sq.payA, payB: sq.payB, fee: 0, transfer: 0 };
  var gain = eff.total - sq.total;
  if (r !== 2 && gain > 1e-9 && isFinite(q.talk) && gain > q.talk + 1e-9) {
    // move to the efficient arrangement; who loses by the move is compensated, the rest split.
    var fin = finishDeal(q, eff.arr, r);
    var surplus = gain - q.talk;
    var lossA = sq.payA - fin.payA, lossB = sq.payB - fin.payB; // positive = that side loses by the move before transfer
    var half = surplus * CONFIG.SURPLUS_SPLIT, transfer;
    if (lossA > 0) transfer = -(lossA + half);  // B pays A: A's loss plus half the surplus
    else transfer = lossB + half;               // A pays B
    // fee: paid out of the surplus; charge it to the payer side of the transfer for accounting (it is a valley cost either way)
    res.deal = { surplus: surplus, transfer: transfer, fee: q.talk, from: transfer > 0 ? 'A' : 'B' };
    res.final = eff.arr; res.total = eff.total - q.talk; res.fee = q.talk; res.transfer = transfer;
    // split the fee evenly too, so each side's net gain is half the surplus
    res.payA = fin.payA - transfer - q.talk / 2;
    res.payB = fin.payB + transfer - q.talk / 2;
  }
  res.damage = damageTotal(q, res.final);
  res.beats = beats(q, r, res);
  return res;
}
// Payoffs under an arrangement before any deal transfer: damages flow by the liability rule.
function finishDeal(q, arr, r) {
  var dmg = damageTotal(q, arr);
  var damagesPaid = r === 1 ? dmg : 0;
  var total = arrangementTotal(q, arr);
  var devCostA = arr.device ? (r === 1 || (q.device && q.device.onlyA) ? q.device.cost : 0) : 0;
  var payA = profitA(q, arr.level) - devCostA - damagesPaid;
  return { payA: payA, payB: total - payA };
}

// The best any ruling could get, and the efficient ideal.
function bestRuling(q) {
  var outs = [0, 1, 2].map(function (r) { return outcome(q, r); });
  var best = 0; outs.forEach(function (o, i) { if (o.total > outs[best].total + 1e-9) best = i; });
  return { outcomes: outs, best: best, bestTotal: outs[best].total, ideal: efficient(q).total };
}

// ============================================================================================================
// Words: the beats, in the game's voice, lowercase, each with the picture's state.
// ============================================================================================================
function dollars(x) { var v = Math.round(x); return (v < 0 ? '−$' : '$') + Math.abs(v); }
function count(n, one, many) { return n === 0 ? 'no ' + many : n === 1 ? 'one ' + one : (n === 2 ? 'two ' : n === 3 ? 'three ' : n === 4 ? 'four ' : n + ' ') + many; }
function plotLabel(q, i, choice) {
  var p = q.b.plots[i];
  if (choice === 'alt') return p.alt.name;
  return p.name;
}
function state(level, choices, device, coins, fresh) { return { level: level, choices: choices.slice(), device: !!device, coins: coins || 0, fresh: !!fresh }; }
// fresh: the picture shows the scene as it stands, nothing yet eaten or burnt, because nobody has acted on the sign

function beats(q, r, res) {
  var out = [], sq = res.statusQuo, A = q.a.name, B = q.b.name, kind = q.kind;
  var sqChoices = sq.arr.choices, fin = res.final;
  function push(text, st) { out.push({ text: text, state: st }); }
  push('the sign goes up: ' + q.signs[r] + '.', state(q.scene.level, q.scene.choices, false, 0, true));
  if (r === 2) {
    push(A + ' must stop. ' + (kind === 'farm' ? 'the cows go.' : kind === 'rail' ? 'no trains run.' : 'the works shuts.'), state(0, sq.arr.choices, false));
    push(plantLine(q, sq.arr.choices, 0, false, r), state(0, sq.arr.choices, false));
    push(tallyLine(res), state(0, sq.arr.choices, false, res.transfer));
    return out;
  }
  if (r === 1) {
    // B plants first (made whole), then A counts.
    push(plantLine(q, sqChoices, null, false, r), state(q.scene.level, sqChoices, false, 0, true));
    push(countLineLiable(q, sq), state(sq.arr.level, sqChoices, sq.arr.device));
    if (sq.damagesPaid > 0) push(A + ' pays ' + B + ' ' + dollars(sq.damagesPaid) + ' for the damage.', state(sq.arr.level, sqChoices, sq.arr.device, -sq.damagesPaid));
  } else {
    push(countLineFree(q, sq), state(sq.arr.level, q.scene.choices, false));
    push(plantLine(q, sqChoices, sq.arr.level, sq.arr.device, r), state(sq.arr.level, sqChoices, sq.arr.device));
  }
  if (res.deal) {
    out = out.concat(dealLines(q, r, res));
  } else if (isFinite(q.talk) && q.talk > 0 && res.efficient.total > sq.total + 1e-9) {
    push('a deal would make the valley ' + dollars(res.efficient.total - sq.total) + ' better off, but the lawyer charges ' + dollars(q.talk) + '. nobody calls him.', state(fin.level, fin.choices, fin.device));
  } else if (!isFinite(q.talk) && res.efficient.total > sq.total + 1e-9) {
    if (kind === 'rail') push('a hundred farms and one railway: there is no deal anyone could strike.', state(fin.level, fin.choices, fin.device));
  }
  push(tallyLine(res), state(fin.level, fin.choices, fin.device, res.transfer));
  return out;
}
function countLineFree(q, sq) {
  var l = sq.arr.level, A = q.a.name;
  if (q.kind === 'farm') return A + ' owes nothing for corn. he keeps ' + count(l, 'cow', 'cows') + ', the most that pay, and they wander where they like.';
  if (q.kind === 'rail') return A + ' owes nothing for sparks. it runs ' + count(l, 'train', 'trains') + ' a day, the most that pay.';
  return A + ' owes nothing for smoke. it runs, and fits no filter.';
}
function countLineLiable(q, sq) {
  var l = sq.arr.level, A = q.a.name;
  if (q.kind === 'farm') {
    if (sq.arr.device) return A + ' counts: every cow would cost him corn money, so he builds the fence for ' + dollars(q.device.cost) + ' and keeps ' + count(l, 'cow', 'cows') + '.';
    var nxt = l < q.a.marginal.length ? q.a.marginal[l] : null, p0 = q.b.plots[0];
    var eats = nxt === null ? 0 : burn(p0, l + 1) - burn(p0, l);
    if (nxt === null || sqChoicesNone(sq)) return A + ' counts, and keeps ' + count(l, 'cow', 'cows') + '.';
    return A + ' counts: ' + ['a first', 'a second', 'a third', 'a fourth'][l] + ' cow would bring ' + dollars(nxt) + ' and eat ' + dollars(eats) + ' of corn. he keeps ' + count(l, 'cow', 'cows') + '.';
  }
  if (q.kind === 'rail') {
    if (l === 0) return A + ' counts: one train would bring $100 and owe ' + dollars(damageAt(q, 1, sq.arr.choices)) + ' for burning. no trains run.';
    return A + ' counts and runs ' + count(l, 'train', 'trains') + ' a day.';
  }
  if (sq.arr.device) return A + ' counts: paying for the smoke costs more than a filter. it fits the filter for ' + dollars(q.device.cost) + ' and runs.';
  return l === 0 ? A + ' counts: the smoke would cost more than the works brings. it shuts.' : A + ' pays for the smoke and runs.';
}
function sqChoicesNone(sq) { return sq.arr.choices.every(function (c) { return c === 'none'; }); }
function damageAt(q, level, choices) { var d = 0; q.b.plots.forEach(function (p, i) { d += plotBurn(p, choices[i], level, false); }); return d; }
function plantLine(q, choices, level, device, r) {
  var B = q.b.name;
  if (q.kind === 'smoke') {
    if (r === 2) return 'the hundred houses hang out their washing, and it dries white.';
    if (r === 1) return 'the hundred houses hang out their washing: whatever the smoke spoils, the works will pay for.';
    return choices[0] === 'none' ? 'the hundred houses look at the chimney and give up on white washing: $15 of it, spoilt. no house can fit a filter on someone else\'s chimney, and a hundred houses cannot club together to pay for one.' : 'the hundred houses hang out their washing and hope.';
  }
  if (q.kind === 'rail') {
    var near = q.b.plots.length > 1;
    if (r === 2) return near ? 'the farms plant everything, strip and all.' : 'the orchards stand.';
    if (r === 1) return near ? 'the farms plant the far fields and the strip by the line too: it pays either way, since the railway will pay for the burning.' : 'the orchards stand: whatever burns, the railway will pay for.';
    if (near) return choices[1] === 'none' ? 'the farms plant the far fields and leave the strip by the line bare: $10 of crops are not worth $' + (level * q.b.plots[1].burn[0]) + ' of burning.' : 'the farms plant the far fields and the strip.';
    return choices[0] === 'none' ? 'the orchards would burn for more than they are worth. the growers give up and the trees come down.' : 'the orchards stand and burn a little.';
  }
  // farm
  var c = choices[0], p = q.b.plots[0];
  if (r === 2) return B + ' plants ' + (c === 'alt' ? 'turnips' : p.name) + ', and nothing eats it.';
  if (r === 1) return B + ' plants ' + (c === 'alt' ? 'turnips' : p.name) + ': whatever the cows eat, the rancher will pay for.';
  if (device) return B + ' builds the fence himself for ' + dollars(q.device.cost) + ' and plants ' + (c === 'alt' ? 'turnips' : p.name) + '.';
  if (c === 'none') return B + ' looks at ' + dollars(p.worth) + ' of corn and ' + dollars(burn(p, level)) + ' of cows eating it, and does not plant. the strip stays grass.';
  if (c === 'alt') return B + ' looks at the cows, and plants turnips instead of corn: ' + dollars(p.alt.worth) + ', and nothing eats them.';
  return B + ' plants ' + p.name + ' anyway: ' + dollars(p.worth) + ' of it, less ' + dollars(burn(p, level)) + ' eaten, still beats nothing.';
}
function dealLines(q, r, res) {
  var out = [], d = res.deal, fin = res.final, sq = res.statusQuo.arr, A = q.a.name, B = q.b.name;
  function push(text, st) { out.push({ text: text, state: st }); }
  var amount = Math.abs(d.transfer);
  var payer = d.transfer > 0 ? A : B, payee = d.transfer > 0 ? B : A;
  var what;
  if (q.kind === 'farm') {
    if (fin.level < sq.level) what = 'to keep ' + count(sq.level - fin.level, 'cow', 'cows') + ' at home';
    else if (fin.choices[0] === 'none' && sq.choices[0] !== 'none') what = 'to leave the strip unplanted';
    else if (fin.choices[0] === 'alt' && sq.choices[0] !== 'alt') what = 'to grow turnips instead';
    else if (fin.device && !sq.device) what = 'towards a fence';
    else what = 'to change his ways';
  } else what = 'to change its ways';
  var fee = q.talk > 0 ? ' the lawyer takes ' + dollars(q.talk) + '.' : '';
  push(payer + ' offers ' + payee + ' ' + dollars(amount) + ' ' + what + '.' + (q.kind === 'farm' ? ' ' + reasonLine(q, r, res) : ''), { level: sq.level, choices: sq.choices.slice(), device: sq.device, coins: 0, offer: true });
  push(payee + ' says yes.' + fee, state(fin.level, fin.choices, fin.device, d.transfer));
  return out;
}
function reasonLine(q, r, res) {
  var fin = res.final, sq = res.statusQuo.arr;
  if (fin.level < sq.level) { var k = sq.level, p0 = q.b.plots[0]; return 'the ' + ['', 'first', 'second', 'third', 'fourth'][k] + ' cow brings ' + dollars(q.a.marginal[k - 1]) + ' and eats ' + dollars(burn(p0, k) - burn(p0, k - 1)) + ' of corn.'; }
  if (fin.choices[0] === 'none') return 'the corn there is worth ' + dollars(q.b.plots[0].worth) + ' to the farmer, and a cow kept at home would cost the rancher more than that.';
  if (fin.choices[0] === 'alt') return 'turnips are worth ' + dollars(q.b.plots[0].alt.worth) + ' and the corn, after the cows, less.';
  return '';
}
function tallyLine(res) {
  return 'the valley is worth ' + dollars(res.total) + '.';
}

// What each ruling would have done, in one line, for the ghost lines and the verdict.
function summary(q, r) {
  var o = outcome(q, r), f = o.final, A = q.a.name, B = q.b.name;
  var s;
  if (q.kind === 'farm') {
    s = count(f.level, 'cow', 'cows') + ', ' + (f.choices[0] === 'none' ? 'the strip bare' : f.choices[0] === 'alt' ? 'turnips' : 'corn') + (f.device ? ', a fence' : '');
  } else if (q.kind === 'rail') {
    s = count(f.level, 'train', 'trains') + (q.b.plots.length > 1 ? (f.choices[1] === 'none' ? ', the strip bare' : ', the strip planted') : (f.choices[0] === 'none' ? ', the orchards gone' : ', the orchards standing'));
  } else {
    s = f.level === 0 ? 'the works shut' : (f.device ? 'the works running with a filter' : 'the works running, smoke and all');
  }
  if (o.deal) s += '; ' + (o.transfer > 0 ? A + ' pays ' + B : B + ' pays ' + A) + ' ' + dollars(Math.abs(o.transfer)) + (o.fee ? ' and the lawyer ' + dollars(o.fee) : '');
  else if (o.statusQuo.damagesPaid > 0) s += '; ' + A + ' pays ' + B + ' ' + dollars(o.statusQuo.damagesPaid);
  return { text: s, total: o.total };
}

// One line for the verdict, in the player's own terms.
function didLine(q, r) {
  var o = outcome(q, r), f = o.final;
  var head = ['you let ' + q.a.name + ' carry on', 'you made ' + q.a.name + ' pay', 'you banned ' + (q.kind === 'farm' ? 'the cows' : q.kind === 'rail' ? 'the trains' : 'the smoke')][r];
  return head + ': ' + summary(q, r).text + '.';
}

// ============================================================================================================
// A run: six quarrels, the player's rulings, the score.
// ============================================================================================================
function newGame() { return { rulings: [], done: false }; }
function rule(game, r) {
  var qs = quarrels(), i = game.rulings.length;
  if (i >= qs.length || game.done) return null;
  var q = qs[i], br = bestRuling(q);
  var o = br.outcomes[r];
  game.rulings.push(r);
  if (game.rulings.length === qs.length) game.done = true;
  return { quarrel: q, ruling: r, outcome: o, best: br.best, bestTotal: br.bestTotal, ideal: br.ideal,
           others: [0, 1, 2].filter(function (x) { return x !== r; }).map(function (x) { return { r: x, ruling: q.rulings[x], sign: q.signs[x], summary: summary(q, x) }; }),
           result: resultLines(q, r, o, br) };
}
function resultLines(q, r, o, br) {
  var lines = [];
  var gap = br.bestTotal - o.total;
  if (gap < 1e-9) lines.push('that is the most any ruling could get.');
  else lines.push('the most any ruling could get was ' + dollars(br.bestTotal) + '. yours fell ' + dollars(gap) + ' short.');
  if (br.ideal > br.bestTotal + 1e-9) lines.push('if everyone in the valley could sit at one table for free, it would be worth ' + dollars(br.ideal) + '. no ruling gets that.');
  // the paper's line for this quarrel
  var paper = {
    corn: r === 2 ? 'the other two rulings would both have ended with two cows and $14: one with the rancher paying for corn, one with the farmer paying for a cow to stay home.' :
          (r === 0 ? 'had the corn been protected, the rancher would have kept two cows himself and paid for the corn they ate. same herd, money the other way.' : 'had the cows been let roam, the farmer would have paid the rancher to send one home. same herd, money the other way.'),
    strip: r === 2 ? 'the other two rulings would both have left the strip bare and three cows drinking: one with nobody paying, one with the rancher paying the farmer to give it up.' :
           (r === 0 ? 'had the strip been protected, the farmer would have planted it and then taken the rancher\'s money to give it up. same bare strip, and the farmer a little richer.' : 'the court protected the strip, and the strip is grass anyway: the rancher bought it off him. had the cows been let roam, the farmer would simply not have planted, and kept nothing.'),
    lawyer: 'now the ruling matters: a deal costs money, so whoever holds the right keeps it. the farmer could switch to turnips by himself; the rancher could only have paid him to, through the lawyer.',
    smoke: 'a hundred houses cannot club together for a filter. the works can fit one. the ruling that puts the cost on the one who can fix it cheaply gets the filter fitted.',
    sparks: 'make the railway pay, and the farmers plant the strip that burns, because it pays either way; then no train pays for its sparks. let it spark, and two trains run and the strip stays bare. one train would be best, and no ruling gets it.',
    orchard: 'the same railway, different figures: here the sparks cost more than the trains bring, and making the railway pay is right. there is no rule of thumb. you count the valley every time.'
  }[q.id];
  lines.push(paper);
  return lines;
}
function verdict(game) {
  var qs = quarrels(), mine = 0, possible = 0, did = [], shares = 0;
  game.rulings.forEach(function (r, i) {
    var br = bestRuling(qs[i]); mine += br.outcomes[r].total; possible += br.bestTotal;
    shares += br.bestTotal > 0 ? br.outcomes[r].total / br.bestTotal : 1;
    did.push({ title: qs[i].title, sign: qs[i].signs[r], line: didLine(qs[i], r), total: br.outcomes[r].total, best: br.bestTotal });
  });
  // valley by valley: each quarrel counts equally, so the railway's big dollars do not swamp the farm
  var share = game.rulings.length ? shares / game.rulings.length : 0, b = CONFIG.FATE_BANDS;
  var shareWords = share >= 1 - 1e-9 ? 'all' : share >= 0.95 ? 'nearly all' : share >= 0.85 ? 'about nine tenths' : share >= 0.75 ? 'about four fifths' :
                   share >= 0.65 ? 'about two thirds' : share >= 0.55 ? 'about three fifths' : share >= 0.45 ? 'about half' : 'less than half';
  var fate = share >= b[0] - 1e-9 ? 'the valley paints your face on the signpost.' :
             share >= b[1] ? 'the farmer and the rancher both send you a card. so does the railway.' :
             share >= b[2] ? 'the valley is doing all right, and nobody is sure whose fault that is.' : 'the cows have asked for a new judge.';
  return {
    mine: mine, possible: possible, share: share, fate: fate, did: did,
    didText: 'your six valleys came to ' + dollars(mine) + ' of the ' + dollars(possible) + ' they could be: valley by valley, ' + shareWords + ' of what was possible.',
    paper: 'when neighbours can talk for free, a ruling changes who pays whom and nothing else. when they cannot, the ruling decides what the valley is worth, and the ruling that feels fair, make the one who did the harm pay, can leave everyone poorer.',
    means: 'there is no culprit to find. there are two neighbours, and the question is which harm is the smaller. the right ruling counts the whole valley.'
  };
}

var API = { CONFIG: CONFIG, quarrels: quarrels, outcome: outcome, efficient: efficient, statusQuo: statusQuo, bestRuling: bestRuling,
            summary: summary, newGame: newGame, rule: rule, verdict: verdict, dollars: dollars, arrangementTotal: arrangementTotal, allArrangements: allArrangements };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.COASE = API;
})(typeof window !== 'undefined' ? window : this);
