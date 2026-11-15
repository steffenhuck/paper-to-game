// Coase's Cows — the mechanism. The only copy: the HTML is generated from this file verbatim (build.py) and
// calibration.js runs it headless against Coase (1960), "The Problem of Social Cost", J. Law & Econ. 3:1–44.
// Runs unchanged in Node (module.exports) and in the browser (window.COASE).
(function (root) {
'use strict';

// ============================================================================================================
// CONFIG — every number the game uses, tagged with its source in the paper or its design rationale.
// ============================================================================================================
var CONFIG = {
  // --- Quarrel 1: the cows and the corn (sections III–IV), ruled twice, as the paper rules it twice ----------
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
  // --- Quarrel 4: the chimney (section V, p. 9; section II: the sufferer can also step out of the way) -----
  WORKS_PROFIT: 20,             // our choice: what running the works brings; section V gives the setting, no figures
  WASHING: 15,                  // our choice: what the hundred households' white washing is worth between them
  SMOKE_LOSS: 15,               // our choice: what the smoke spoils of it: all of it
  FILTER: 12,                   // our choice: the "smoke preventing device" of section V, p. 9; dearer than the horses
  HORSES: 5,                    // our choice: a clothes horse indoors in each house, a few cents each, $5 across the
                                // town: the sufferers' own cheap way out of the smoke (p. 9: "...or whether the
                                // occupants should move"), which needs no agreement among them
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
  // --- Scoring: quarrels in which the player's ruling got the most any ruling could (the first quarrel by its
  //     first year). Dollars are shown but do not score: the far fields' $200 would let the fair instinct
  //     look nearly right at $578 of $600 while missing half the quarrels.
  FATE_FOUND: [6, 5, 3]         // our choice: found of six for the four fates (all / all but one / three or four / fewer)
};

// ============================================================================================================
// The six quarrels. A quarrel: a harmer A with activity levels and marginal profits; a sufferer B with plots
// (each a standalone net worth and a damage per unit of A's activity), optionally an alternative crop; a device
// either side may buy that removes all damage (deviceA: the harmer's, deviceB: the sufferer's; the fence is one
// fence either could build); a cost of talking (0, a fee, or Infinity).
// ============================================================================================================
function quarrels() {
  var C = CONFIG;
  var fence = { name: 'a fence', cost: C.FENCE };
  return [
    { id: 'corn', n: 1, title: 'the cows and the corn', twice: true,
      a: { name: 'the rancher', thing: 'cow', things: 'cows', verb: 'keeps', marginal: C.MEAT },
      b: { name: 'the farmer', plots: [{ name: 'the corn', worth: C.CORN_Q1, burn: C.CROP_LOSS }] },
      deviceA: fence, deviceB: fence, talk: 0, kind: 'farm', scene: { level: 3, choices: ['main'] },
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
      deviceA: fence, deviceB: fence, talk: 0, kind: 'farm', scene: { level: 3, choices: ['main'] },
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
      deviceA: fence, deviceB: fence, talk: C.LAWYER_FEE, kind: 'farm', scene: { level: 3, choices: ['main'] },
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
      b: { name: 'the hundred houses', plots: [{ name: 'the washing', worth: C.WASHING, burn: [C.SMOKE_LOSS] }] },
      deviceA: { name: 'a filter', cost: C.FILTER }, deviceB: { name: 'clothes horses', cost: C.HORSES },
      talk: Infinity, kind: 'smoke', scene: { level: 1, choices: ['main'] },
      rulings: ['the works may smoke', 'the houses are protected: the works pays for what the smoke spoils', 'no smoke in this town'],
      signs: ['smoke allowed', 'houses protected', 'no smoke'],
      means: ['the works owes nothing for what its smoke spoils. the houses could offer it money, if a hundred of them could agree.',
              'the works owes the houses the price of everything its smoke spoils.',
              'the works may make no smoke in this town. no payment can change that.'],
      facts: [
        { icon: 'works', text: 'running the works brings $20' },
        { icon: 'houses', text: 'a hundred houses hang out $15 of white washing between them. the smoke turns all of it grey' },
        { icon: 'fixes', text: 'two things keep the washing white. a filter on the chimney: $12, and only the works can fit it. or a clothes horse indoors in every house: a few cents each, $5 across the town' },
        { icon: 'crowd', text: 'a hundred households cannot agree on a deal with anyone. no deal is possible' }] },
    { id: 'sparks', n: 5, title: 'sparks',
      a: { name: 'the railway', thing: 'train', things: 'trains', verb: 'runs', marginal: [C.TRAIN_VALUE[0] - C.TRAIN_COST[0], C.TRAIN_VALUE[1] - C.TRAIN_COST[1]] },
      b: { name: 'the farms along the line', plots: [
            { name: 'the far fields', worth: C.FAR_CROP, burn: [C.FAR_BURN_PER_TRAIN, 2 * C.FAR_BURN_PER_TRAIN] },
            { name: 'the strip by the line', worth: C.NEAR_CROP_NET, burn: [C.NEAR_BURN_PER_TRAIN, 2 * C.NEAR_BURN_PER_TRAIN], near: true }] },
      deviceA: null, deviceB: null, talk: Infinity, kind: 'rail', scene: { level: 2, choices: ['main', 'none'] },
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
      deviceA: null, deviceB: null, talk: Infinity, kind: 'rail', scene: { level: 2, choices: ['main'] },
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
// Arithmetic. An arrangement: A's level, each plot's choice, and device: null, 'A' (the harmer's) or 'B' (the
// sufferer's). Either device removes all damage; its cost falls on the side that owns it.
// ============================================================================================================
function sum(arr, n) { var s = 0; for (var i = 0; i < n; i++) s += arr[i]; return s; }
function profitA(q, level) { return sum(q.a.marginal, level); }
function burn(plot, level) { return level === 0 ? 0 : plot.burn[level - 1]; }
function plotWorth(plot, choice) { return choice === 'alt' ? plot.alt.worth : choice === 'main' ? plot.worth : 0; }
function plotChoices(plot) { return plot.alt ? ['none', 'main', 'alt'] : ['none', 'main']; }
function plotBurn(plot, choice, level, device) { return (choice === 'main' && !device) ? burn(plot, level) : 0; }
function deviceCost(q, device) { return device === 'A' ? q.deviceA.cost : device === 'B' ? q.deviceB.cost : 0; }
function deviceOptions(q) { var o = [null]; if (q.deviceA) o.push('A'); if (q.deviceB) o.push('B'); return o; }

// Its worth to the valley: A's profit + sum of plot worths − damage − device cost.
function arrangementTotal(q, arr) {
  var t = profitA(q, arr.level) - deviceCost(q, arr.device);
  q.b.plots.forEach(function (p, i) { t += plotWorth(p, arr.choices[i]) - plotBurn(p, arr.choices[i], arr.level, arr.device); });
  return t;
}
function allArrangements(q) {
  var out = [];
  var levels = q.a.marginal.length;
  function rec(i, choices) {
    if (i === q.b.plots.length) {
      for (var l = 0; l <= levels; l++) deviceOptions(q).forEach(function (d) { out.push({ level: l, choices: choices.slice(), device: d }); });
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
// nothing but the law; B then choosing what to plant, and whether to buy its own device, given A's level.
function statusQuo(q, r) {
  var arr;
  if (r === 2) {
    // with no activity, B plants whichever crop is worth most
    arr = { level: 0, choices: q.b.plots.map(function (p) { return bestChoiceFor(p, 0, null); }), device: null };
    return finish(q, arr, r, 0);
  }
  if (r === 1) {
    // liable: B is made whole, so B plants what is worth most standing and buys nothing.
    var choices = q.b.plots.map(function (p) { return bestChoiceFor(p, 0, null); });
    // A chooses level and its own device to maximise own profit − damages (or − device).
    var best = null, bp = -Infinity;
    for (var l = 0; l <= q.a.marginal.length; l++) {
      [null].concat(q.deviceA ? ['A'] : []).forEach(function (dev) {
        var a = { level: l, choices: choices, device: dev };
        var p = profitA(q, l) - deviceCost(q, dev) - damageTotal(q, a);
        if (p > bp + 1e-9) { bp = p; best = a; }
      });
    }
    return finish(q, best, r, damageTotal(q, best));
  }
  // not liable: A ignores B and picks the most profitable level; B then plants, or buys its own device, to suit.
  var lvl = 0, bpA = -Infinity;
  for (var L = 0; L <= q.a.marginal.length; L++) { var pa = profitA(q, L); if (pa > bpA + 1e-9) { bpA = pa; lvl = L; } }
  var bestB = null, bv = -Infinity;
  [null].concat(q.deviceB ? ['B'] : []).forEach(function (dev) {
    var ch = q.b.plots.map(function (p) { return bestChoiceFor(p, lvl, dev); });
    var v = -deviceCost(q, dev);
    q.b.plots.forEach(function (p, i) { v += plotWorth(p, ch[i]) - plotBurn(p, ch[i], lvl, dev); });
    if (v > bv + 1e-9) { bv = v; bestB = { level: lvl, choices: ch, device: dev }; }
  });
  return finish(q, bestB, r, 0);
}
// B's best crop on one plot given A's level and whether a device stands.
function bestChoiceFor(plot, level, device) {
  var best = 'none', bv = 0;
  plotChoices(plot).forEach(function (c) {
    if (c === 'none') return;
    var v = plotWorth(plot, c) - plotBurn(plot, c, level, device);
    if (v > bv + 1e-9) { bv = v; best = c; }
  });
  return best;
}
function finish(q, arr, r, damagesPaid) {
  var total = arrangementTotal(q, arr);
  var payA = profitA(q, arr.level) - (arr.device === 'A' ? q.deviceA.cost : 0) - damagesPaid;
  var payB = total - payA;
  return { arr: arr, total: total, payA: payA, payB: payB, damagesPaid: damagesPaid };
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
// Payoffs under an arrangement before any deal transfer: damages flow by the liability rule; each device is
// paid for by its own side.
function finishDeal(q, arr, r) {
  var dmg = damageTotal(q, arr);
  var damagesPaid = r === 1 ? dmg : 0;
  var total = arrangementTotal(q, arr);
  var payA = profitA(q, arr.level) - (arr.device === 'A' ? q.deviceA.cost : 0) - damagesPaid;
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
// coins: negative = A pays B (money flies from the harmer's side to the sufferer's), positive = B pays A.
// ============================================================================================================
function dollars(x) { var v = Math.round(x); return (v < 0 ? '−$' : '$') + Math.abs(v); }
function list(items) { return items.length <= 1 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
function count(n, one, many) { return n === 0 ? 'no ' + many : n === 1 ? 'one ' + one : (n === 2 ? 'two ' : n === 3 ? 'three ' : n === 4 ? 'four ' : n + ' ') + many; }
function state(level, choices, device, coins, fresh) { return { level: level, choices: choices.slice(), device: device || null, coins: coins || 0, fresh: !!fresh }; }
// fresh: the picture shows the scene as it stands, nothing yet eaten or burnt, because nobody has acted on the sign

function beats(q, r, res) {
  var out = [], sq = res.statusQuo, A = q.a.name, kind = q.kind;
  var sqChoices = sq.arr.choices, fin = res.final;
  function push(text, st) { out.push({ text: text, state: st }); }
  push('the sign goes up: ' + q.signs[r] + '.', state(q.scene.level, q.scene.choices, null, 0, true));
  if (r === 2) {
    push(A + ' must stop. ' + (kind === 'farm' ? 'the cows go.' : kind === 'rail' ? 'no trains run.' : 'the works shuts.'), state(0, sq.arr.choices, null));
    push(plantLine(q, sq.arr.choices, 0, null, r), state(0, sq.arr.choices, null));
    push(tallyLine(res), state(0, sq.arr.choices, null, 0));
    return out;
  }
  if (r === 1) {
    // B plants first (made whole), then A counts.
    push(plantLine(q, sqChoices, null, null, r), state(q.scene.level, sqChoices, null, 0, true));
    push(countLineLiable(q, sq), state(sq.arr.level, sqChoices, sq.arr.device));
    if (sq.damagesPaid > 0) {
      if (res.deal) push('every year, ' + A + ' would owe ' + q.b.name + ' ' + dollars(sq.damagesPaid) + ' for the damage.', state(sq.arr.level, sqChoices, sq.arr.device));
      else push(A + ' pays ' + q.b.name + ' ' + dollars(sq.damagesPaid) + ' for the damage.', state(sq.arr.level, sqChoices, sq.arr.device, -sq.damagesPaid));
    }
  } else {
    push(countLineFree(q, sq), state(sq.arr.level, q.scene.choices, null));
    push(plantLine(q, sqChoices, sq.arr.level, sq.arr.device, r), state(sq.arr.level, sqChoices, sq.arr.device));
  }
  if (res.deal) {
    out = out.concat(dealLines(q, r, res));
  } else if (isFinite(q.talk) && q.talk > 0 && res.efficient.total > sq.total + 1e-9) {
    push('a deal would make the valley ' + dollars(res.efficient.total - sq.total) + ' better off, but the lawyer charges ' + dollars(q.talk) + '. nobody calls him.', state(fin.level, fin.choices, fin.device));
  } else if (!isFinite(q.talk) && res.efficient.total > sq.total + 1e-9) {
    if (kind === 'rail') push('a hundred farms and one railway: there is no deal anyone could strike.', state(fin.level, fin.choices, fin.device));
    if (kind === 'smoke') push('the works would gladly pay for a hundred clothes horses, $' + CONFIG.HORSES + ', rather than a $' + CONFIG.FILTER + ' filter. but a hundred houses cannot sign one deal. the filter stays.', state(fin.level, fin.choices, fin.device));
  }
  push(tallyLine(res), state(fin.level, fin.choices, fin.device, 0));
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
    if (sq.arr.device) return A + ' counts: every cow would cost him corn money, so he builds the fence for ' + dollars(q.deviceA.cost) + ' and keeps ' + count(l, 'cow', 'cows') + '.';
    var nxt = l < q.a.marginal.length ? q.a.marginal[l] : null, p0 = q.b.plots[0];
    var eats = nxt === null ? 0 : burn(p0, l + 1) - burn(p0, l);
    if (nxt === null || sqChoicesNone(sq)) return A + ' counts, and keeps ' + count(l, 'cow', 'cows') + '.';
    return A + ' counts: ' + ['a first', 'a second', 'a third', 'a fourth'][l] + ' cow would bring ' + dollars(nxt) + ' and eat ' + dollars(eats) + ' of corn. he keeps ' + count(l, 'cow', 'cows') + '.';
  }
  if (q.kind === 'rail') {
    if (l === 0) return A + ' counts: one train would bring $100 and owe ' + dollars(damageAt(q, 1, sq.arr.choices)) + ' for burning. no trains run.';
    return A + ' counts and runs ' + count(l, 'train', 'trains') + ' a day.';
  }
  if (sq.arr.device === 'A') return A + ' counts: ' + dollars(q.b.plots[0].burn[0]) + ' for the smoke, every year, or a ' + dollars(q.deviceA.cost) + ' filter. it fits the filter and runs.';
  return l === 0 ? A + ' counts: the smoke would cost more than the works brings. it shuts.' : A + ' pays for the smoke and runs.';
}
function sqChoicesNone(sq) { return sq.arr.choices.every(function (c) { return c === 'none'; }); }
function damageAt(q, level, choices) { var d = 0; q.b.plots.forEach(function (p, i) { d += plotBurn(p, choices[i], level, null); }); return d; }
function plantLine(q, choices, level, device, r) {
  var B = q.b.name;
  if (q.kind === 'smoke') {
    if (r === 2) return 'the hundred houses hang out their washing, and it dries white.';
    if (r === 1) return 'the hundred houses hang out their washing: whatever the smoke spoils, the works will pay for.';
    if (device === 'B') return 'the hundred houses look at the chimney. each buys a clothes horse and dries indoors: ' + dollars(q.deviceB.cost) + ' between them, and the washing stays white. nothing to agree on: every house does it alone.';
    return choices[0] === 'none' ? 'the hundred houses look at the chimney and give up on white washing: ' + dollars(q.b.plots[0].worth) + ' of it, spoilt.' : 'the hundred houses hang out their washing and hope.';
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
  if (device) return B + ' builds the fence himself for ' + dollars(q.deviceB.cost) + ' and plants ' + (c === 'alt' ? 'turnips' : p.name) + '.';
  if (c === 'none') return B + ' looks at ' + dollars(p.worth) + ' of corn and ' + count(level, 'cow', 'cows') + ' that would eat ' + dollars(burn(p, level)) + ' of it, and does not plant. the strip stays grass.';
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
  var rather = (r === 1 && res.statusQuo.damagesPaid > 0) ? 'rather than that, ' : '';
  push(rather + payer + ' offers ' + payee + ' ' + dollars(amount) + ' ' + what + '.' + (q.kind === 'farm' ? ' ' + reasonLine(q, r, res) : ''), { level: sq.level, choices: sq.choices.slice(), device: sq.device, coins: 0, offer: true });
  push(payee + ' says yes.' + fee, state(fin.level, fin.choices, fin.device, -d.transfer));
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
    s = f.level === 0 ? 'the works shut' : (f.device === 'A' ? 'the works running with a $' + CONFIG.FILTER + ' filter' : f.device === 'B' ? 'the works running, the washing indoors on $' + CONFIG.HORSES + ' of clothes horses' : 'the works running, smoke and all');
  }
  if (o.deal) s += '; ' + (o.transfer > 0 ? A + ' pays ' + B : B + ' pays ' + A) + ' ' + dollars(Math.abs(o.transfer)) + (o.fee ? ' and the lawyer ' + dollars(o.fee) : '');
  else if (o.statusQuo.damagesPaid > 0) s += '; ' + A + ' pays ' + B + ' ' + dollars(o.statusQuo.damagesPaid);
  return { text: s, total: o.total };
}

// One line for the verdict, in the player's own terms.
function didLine(q, r) {
  var head = ['you let ' + q.a.name + ' carry on', 'you made ' + q.a.name + ' pay', 'you banned ' + (q.kind === 'farm' ? 'the cows' : q.kind === 'rail' ? 'the trains' : 'the smoke')][r];
  return head + ': ' + summary(q, r).text + '.';
}

// ============================================================================================================
// A run: six quarrels, the first ruled twice, the player's rulings, the score.
// ============================================================================================================
function newGame() { return { rulings: [], yearTwo: null, done: false }; }
// The first ruling on a quarrel. For the first quarrel the result says `again`: the year after is still to come.
function rule(game, r) {
  var qs = quarrels(), i = game.rulings.length;
  if (i >= qs.length || game.done) return null;
  if (i === 1 && qs[0].twice && game.yearTwo === null) return null;   // the year after has not been ruled yet
  var q = qs[i], br = bestRuling(q);
  var o = br.outcomes[r];
  game.rulings.push(r);
  if (game.rulings.length === qs.length) game.done = true;
  return { quarrel: q, ruling: r, outcome: o, best: br.best, bestTotal: br.bestTotal, ideal: br.ideal, again: !!q.twice,
           others: [0, 1, 2].filter(function (x) { return x !== r; }).map(function (x) { return { r: x, ruling: q.rulings[x], sign: q.signs[x], summary: summary(q, x) }; }),
           result: resultLines(q, r, o, br) };
}
// The year after: the first quarrel again, with a different sign. Not scored; the comparison is the point.
function ruleAgain(game, r) {
  var qs = quarrels(), q = qs[0];
  if (game.rulings.length !== 1 || game.yearTwo !== null || r === game.rulings[0]) return null;
  var br = bestRuling(q), r1 = game.rulings[0], o1 = br.outcomes[r1], o2 = br.outcomes[r];
  game.yearTwo = r;
  var left = [0, 1, 2].filter(function (x) { return x !== r && x !== r1; })[0];
  return { quarrel: q, ruling: r, outcome: o2, best: br.best, bestTotal: br.bestTotal, ideal: br.ideal, again: false,
           first: { ruling: r1, outcome: o1, summary: summary(q, r1) }, second: { ruling: r, outcome: o2, summary: summary(q, r) },
           others: [{ r: left, ruling: q.rulings[left], sign: q.signs[left], summary: summary(q, left) }],
           result: compareLines(q, r1, r, br) };
}
function whoPaid(q, r) {
  var o = outcome(q, r), A = q.a.name, B = q.b.name;
  if (o.deal) return (o.transfer > 0 ? A + ' paid ' + B : B + ' paid ' + A) + ' ' + dollars(Math.abs(o.transfer)) + (o.transfer > 0 ? ' to plant less' : ' to keep a cow at home');
  if (o.statusQuo.damagesPaid > 0) return A + ' paid ' + B + ' ' + dollars(o.statusQuo.damagesPaid) + ' for the corn';
  return 'nobody paid anybody';
}
function compareLines(q, r1, r2, br) {
  var o1 = br.outcomes[r1], o2 = br.outcomes[r2], lines = [];
  if (r1 !== 2 && r2 !== 2) {
    lines.push('two years, two signs, and the same valley: ' + count(o1.final.level, 'cow', 'cows') + ' and the corn both times, ' + dollars(o1.total) + ' both times.');
    lines.push('what changed is who paid whom. last year ' + whoPaid(q, r1) + '. this year ' + whoPaid(q, r2) + '.');
    lines.push('that is the paper\'s first finding. when the neighbours can talk for free, the ruling moves money and nothing else. the cows end up where they are worth most either way.');
  } else {
    var banYear = r1 === 2 ? 'last year' : 'this year', other = r1 === 2 ? r2 : r1, ob = br.outcomes[2], oo = br.outcomes[other];
    lines.push(banYear + ' you banned the cows: no cows, the corn, ' + dollars(ob.total) + '. the ban cost the valley ' + dollars(oo.total - ob.total) + ' of meat.');
    lines.push('the other year you did not, and the valley came to ' + dollars(oo.total) + ' with ' + count(oo.final.level, 'cow', 'cows') + ': ' + whoPaid(q, other) + '.');
    var left = [0, 1, 2].filter(function (x) { return x !== r1 && x !== r2; })[0];
    lines.push('the sign you did not try ends the same way, ' + count(oo.final.level, 'cow', 'cows') + ' and ' + dollars(oo.total) + ', with the money running the other way: ' + whoPaid(q, left) + '. when the neighbours can talk for free, the ruling moves money and nothing else.');
  }
  return lines;
}
function resultLines(q, r, o, br) {
  var lines = [];
  var gap = br.bestTotal - o.total;
  if (gap < 1e-9) lines.push('that is the most any ruling could get.');
  else lines.push('the most any ruling could get was ' + dollars(br.bestTotal) + '. yours fell ' + dollars(gap) + ' short.');
  if (br.ideal > br.bestTotal + 1e-9) lines.push('if everyone in the valley could sit at one table for free, it would be worth ' + dollars(br.ideal) + '. no ruling gets that.');
  // the paper's line for this quarrel
  var paper = {
    corn: r === 2 ? 'next year, try another sign and see what the cows do.' : 'next year, try the other sign and watch the cows.',
    strip: r === 2 ? 'the other two rulings would both have left the strip bare and three cows drinking: one with nobody paying, one with the rancher paying the farmer to give it up.' :
           (r === 0 ? 'had the strip been protected, the farmer would have planted it and then taken the rancher\'s money to give it up. same bare strip, and the farmer a little richer.' : 'the court protected the strip, and the strip is grass anyway: the rancher bought it off him. had the cows been let roam, the farmer would simply not have planted, and kept nothing.'),
    lawyer: 'now the ruling matters: a deal costs money, so whoever holds the right keeps it. the farmer could switch to turnips by himself; the rancher could only have paid him to, through the lawyer.',
    smoke: r === 0 ? 'the smoke harms the houses, and the houses are also the ones who can step out of its way cheaply. let the works smoke, and each house does, for a few cents. protect the houses, and the works has to buy the dear fix, because it cannot buy the cheap one from a hundred people.' :
           r === 1 ? 'the washing is white, but it cost $' + CONFIG.FILTER + ' when $' + CONFIG.HORSES + ' of clothes horses would have done. the houses did not buy them because, protected, they had no reason to; and the works could not pay them to, because a hundred houses cannot sign one deal. making the works pay put the fix on the dear side.' :
           'the works brought more than the washing was worth, and the washing could have been saved for $' + CONFIG.HORSES + ' of clothes horses. the ban threw away the works to save the washing.',
    sparks: 'make the railway pay, and the farmers plant the strip that burns, because it pays either way; then no train pays for its sparks. let it spark, and two trains run and the strip stays bare. one train would be best, and no ruling gets it.',
    orchard: 'the same railway, different figures: here the sparks cost more than the trains bring, and making the railway pay is right. there is no rule of thumb. you count the valley every time.'
  }[q.id];
  lines.push(paper);
  return lines;
}
// Why a ruling missed, for the verdict, by quarrel and ruling.
function missLine(q, r) {
  return {
    corn: ['', '', 'the ban sent the cows away, and the meat with them'],
    strip: ['', '', 'the ban sent the cows away, and the meat with them'],
    lawyer: ['', 'protecting the corn kept the farmer in corn, and the lawyer made the switch to turnips too dear to buy', 'the ban sent the cows away, and the meat with them'],
    smoke: ['', 'making the works pay bought a $' + CONFIG.FILTER + ' filter where $' + CONFIG.HORSES + ' of clothes horses would have done', 'the ban shut the works, which brought more than the washing was worth'],
    sparks: ['', 'making the railway pay got the strip planted and stopped the trains', 'the ban stopped the trains'],
    orchard: ['letting the railway spark burnt orchards worth more than the trains', '', '']
  }[q.id][r];
}
function verdict(game) {
  var qs = quarrels(), mine = 0, possible = 0, did = [], found = 0, misses = [];
  game.rulings.forEach(function (r, i) {
    var q = qs[i], br = bestRuling(q), o = br.outcomes[r], hit = o.total >= br.bestTotal - 1e-9;
    mine += o.total; possible += br.bestTotal; if (hit) found++; else misses.push({ q: q, r: r, why: missLine(q, r) });
    var line = didLine(q, r);
    if (q.twice && game.yearTwo !== null) line = 'year one, ' + line + ' year two, ' + didLine(q, game.yearTwo);
    did.push({ title: q.title, sign: q.signs[r], line: line, total: o.total, best: br.bestTotal, hit: hit });
  });
  var n = game.rulings.length, b = CONFIG.FATE_FOUND;
  var fate = found >= b[0] ? 'the valley paints your face on the signpost.' :
             found >= b[1] ? 'the farmer and the rancher both send you a card. so does the railway.' :
             found >= b[2] ? 'the valley is doing all right, and nobody is sure whose fault that is.' : 'the cows have asked for a new judge.';
  var words = ['none', 'one', 'two', 'three', 'four', 'five', 'six'];
  var didText = 'you found the best ruling in ' + (found === n ? 'all ' + words[n] : words[found] + ' of the ' + words[n]) + ' quarrels. in dollars, your valleys came to ' + dollars(mine) + ' of the ' + dollars(possible) + ' they could be.';
  var missText = '';
  if (misses.length) {
    var fair = misses.filter(function (m) { return m.r === 1; }), rest = misses.filter(function (m) { return m.r !== 1; });
    if (fair.length) missText += (fair.length === 1 ? 'in ' + fair[0].q.title + ', the ruling that felt fair was the wrong one: ' + fair[0].why + '.' :
      'in ' + list(fair.map(function (m) { return m.q.title; })) + ', the ruling that felt fair was the wrong one. ' + fair.map(function (m) { return m.why; }).join('; ') + '.');
    // the rest, grouped where the reason is the same (the ban, three times over)
    var groups = [];
    rest.forEach(function (m) { var g = groups.filter(function (x) { return x.why === m.why; })[0]; if (g) g.titles.push(m.q.title); else groups.push({ why: m.why, titles: [m.q.title] }); });
    if (groups.length) missText += (missText ? ' ' : '') + groups.map(function (g) { return 'in ' + list(g.titles) + ', ' + g.why; }).join('. ') + '.';
  }
  return {
    mine: mine, possible: possible, found: found, fate: fate, did: did, misses: misses,
    didText: didText, missText: missText,
    paper: 'when neighbours can talk for free, a ruling changes who pays whom and nothing else. when they cannot, the ruling decides what the valley is worth, and the ruling that feels fair, make the one who did the harm pay, can leave everyone poorer.',
    means: 'there is no culprit to find. there are two neighbours, and the question is which harm is the smaller. the right ruling counts the whole valley.'
  };
}

var API = { CONFIG: CONFIG, quarrels: quarrels, outcome: outcome, efficient: efficient, statusQuo: statusQuo, bestRuling: bestRuling,
            summary: summary, newGame: newGame, rule: rule, ruleAgain: ruleAgain, verdict: verdict, dollars: dollars, arrangementTotal: arrangementTotal, allArrangements: allArrangements };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.COASE = API;
})(typeof window !== 'undefined' ? window : this);
