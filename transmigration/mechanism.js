// Beam Me Up, Leibniz — the mechanism, headless. The only copy: build.py inlines this file verbatim into the HTML and
// refuses to build if the embedded copy differs. Runs unchanged in Node (module.exports) and in the browser (window.BEAM).
// Kind: toy (memo §16). A world built to illustrate the argument of Leibniz, "On Unities and Transmigration" (c. 1702–1705,
// Strickland's translation): pods are organic bodies, pilots are unities (souls), a porthole is a point of view, a pod's
// log is what mechanics does to it with each line caused by an earlier line, a pilot's tape is the same seen from inside,
// the station's book is the rule that the body expresses everything, and the second book is the moral law for minds.
// Every try returns a list of frames, one thing happening and one plain sentence each, which the pad plays slowly.
(function (root) {
  'use strict';

  var CONFIG = {
    // --- the five rules, as the screen states them (memo §12); each is one sentence of the text made into a rule of the station
    RULES: [
      'A pod and its pilot never touch. There is no wire. Each follows its own line, and they agree.',                       // "the spontaneous agreement of their phenomena"
      'A pod shows everything: its porthole is the fleet from where it is, its log is everything that happens to it, and every line follows from the line before.', // "the body must express everything"; "mechanical laws"
      'No pod is ever made and none is ever destroyed. A pod is pods all the way down; fire only scorches the outside.',     // "folded in themselves to infinity"; "fire ... can only ever disturb the outside"
      'One pilot per pod, and a pilot in every pod, where a pod can be told from a heap.',                                   // "two souls are not in the same organic body"; "I cannot decide anything about ... a diamond"
      'A mind’s passage is kept in a second book, by what the mind claims and remembers.'                                     // "moral laws which would record the transfer and the identity"
    ],
    // --- the fleet: pods, pilots and positions on the pad (340 × 190). Positions are ours; the dog and the cat are "soul in animals",
    //     the fern "principle of life in living things", the diamond the text's own undecidable mass. kind: animal | plant | heap | mind
    PODS: {
      A: { id: 'A', name: 'pod A',       pilot: 'the dog',       kind: 'animal', porthole: true,  x: 85,  y: 88,  big: true,  she: 'she', her: 'her' },
      B: { id: 'B', name: 'pod B',       pilot: 'the cat',       kind: 'animal', porthole: true,  x: 255, y: 88,  big: true,  she: 'he',  her: 'him' },
      C: { id: 'C', name: 'the fern’s pod', pilot: 'the fern',   kind: 'plant',  porthole: true,  x: 170, y: 30,  big: false, she: 'it',  her: 'it' },
      D: { id: 'D', name: 'the diamond', pilot: null,            kind: 'heap',   porthole: false, x: 278, y: 26,  big: false, she: 'it',  her: 'it' },
      E: { id: 'E', name: 'pod E',       pilot: 'a mouse',       kind: 'animal', porthole: true,  x: 62,  y: 30,  big: false, she: 'it',  her: 'it' }
    },
    // --- the second shift: you and the far pod. "a life which continues my life ... an intelligence which claims for itself what has happened to me"
    SHIFT2: {
      A: { id: 'A', name: 'your pod',    pilot: 'you',           kind: 'mind',   porthole: true,  x: 85,  y: 88,  big: true,  she: 'you', her: 'you' },
      B: { id: 'B', name: 'the far pod', pilot: 'the far pilot', kind: 'mind',   porthole: true,  x: 245, y: 88,  big: true,  she: 'it',  her: 'it' },
      C: { id: 'C', name: 'pod C',       pilot: 'the fern',      kind: 'plant',  porthole: true,  x: 170, y: 30,  big: false, she: 'it',  her: 'it' },
      E: { id: 'E', name: 'pod E',       pilot: 'a mouse',       kind: 'animal', porthole: true,  x: 62,  y: 30,  big: false, she: 'it',  her: 'it' }
    },
    // --- the logs: what mechanics does to a pod, each line caused by an earlier line of the same log (the schedule). Ours.
    //     ev: what the pod does; cause: the line it follows from (an index into the same pod's log, or 'schedule' for the first lines);
    //     feel: what the pilot's tape says for it ("the soul passes, of itself, from one representation to another"; joy to pain, Socrates' short path)
    LOG: {
      A: [
        { t: '3:10', ev: 'the timer ticks',         cause: null, feel: 'nothing much' },
        { t: '3:11', ev: 'the thruster fires',       cause: 0,    feel: 'a push' },
        { t: '3:12', ev: 'rolls left',               cause: 1,    feel: 'the fleet turns right in the window' },
        { t: '3:13', ev: 'the heater comes on, warms', cause: 0,  feel: 'warm; glad' },
        { t: '3:14', ev: 'the heater goes off, cools', cause: 3,  feel: 'cold; a pang' }
      ],
      B: [
        { t: '3:10', ev: 'the timer ticks',         cause: null, feel: 'nothing much' },
        { t: '3:11', ev: 'the heater comes on, warms', cause: 0,  feel: 'warm; glad' },
        { t: '3:12', ev: 'the thruster fires',       cause: 0,    feel: 'a push' },
        { t: '3:13', ev: 'rolls right',              cause: 2,    feel: 'the fleet turns left in the window' },
        { t: '3:14', ev: 'the heater goes off, cools', cause: 1,  feel: 'cold; a pang' }
      ]
    },
    // --- the marks: the mechanical signs the player can ask the far pod to show on arrival, each with the line of its own log
    //     that causes it. "What means are there of expressing the passage of a soul by the laws of mechanics?" The signs are ours.
    MARKS: {
      lamp:   { key: 'THE LAMP',     name: 'the lamp',     ev: 'the lamp flashes',          causeEv: 'the timer closes the lamp circuit', said: 'the lamp flashed' },
      roll:   { key: 'A ROLL',       name: 'a roll',       ev: 'rolls over, once',          causeEv: 'the thruster fires, on its schedule', said: 'it rolled over' },
      course: { key: 'A NEW COURSE', name: 'a new course', ev: 'turns onto a new course',   causeEv: 'the course clock reaches its next leg', said: 'it changed course' },
      memory: { key: 'A MEMORY',     name: 'a memory',     ev: 'its pilot says: “I was in pod A. I remember the roll at 3:12 and the warmth at 3:13.”',
                causeEv: 'its own works move so', said: 'its pilot claimed your life', mind: true }
    },
    // --- the burn: layers peeled per setting; "all the way" runs to the cap and the station stops counting. The cap is ours; the text says infinity.
    DEPTHS: [ { key: '1 LAYER', n: 1 }, { key: '10', n: 10 }, { key: '100', n: 100 }, { key: 'ALL THE WAY', n: 1000000, all: true } ],
    BURN_CAP: 1000000,
    // --- the booking: the text's "seems possible" against "more in keeping with order", and the player's own likely wish, met by rule 3. Ours.
    WAYS: {
      beam:     { key: 'BY BEAM',                        line: 'A life is rebuilt at the far station that remembers yours. You stay here too.' },
      pod:      { key: 'BY POD',                         line: 'You and your pod go together. Slow. One of you.' },
      beamburn: { key: 'BY BEAM, THEN BURN THE ONE LEFT HERE', line: 'A life is rebuilt there that remembers yours; then fire for the pod here.' }
    },
    // --- Leibniz's lines, in the game's words, said after the game's own voice (colour, not the explanation)
    LEIBNIZ: {
      burn:    'Leibniz: every organic body is a machine folded in on itself without end, so fire and every other outside force can only ever disturb the outside.',
      quiet:   'Leibniz: an exchange of souls that showed in no body would be against order, since a body must express everything.',
      heap:    'Leibniz: we cannot always tell whether a mass is alive, because we cannot always tell an organic body from a heap; he cannot decide about the sun, the Earth, or a diamond.',
      mark:    'Leibniz: if the exchange showed in the bodies, we would have to see how. What means are there of expressing the passage of a soul by the laws of mechanics?',
      wire:    'Leibniz: no unity acts on another, and God does not run between them; each expresses, by its own nature, everything outside it. The union of a soul and its body is their spontaneous agreement.',
      memory:  'Leibniz: the mechanical laws themselves could make reborn elsewhere a life which continues my life, an intelligence that claims what has happened to me as its own, so that morally it would be me.',
      booking: 'Leibniz: that seems possible; but it seems more in keeping with order that moral identity is always accompanied by a physical identity.'
    }
  };

  // ---------- the world ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function newShift(n) {
    var pods = clone(n === 1 ? CONFIG.PODS : CONFIG.SHIFT2), logs = {};
    Object.keys(pods).forEach(function (id) { logs[id] = clone(CONFIG.LOG[id] || CONFIG.LOG.A); pods[id].scorched = 0; });
    return { shift: n, pods: pods, logs: logs, tries: [], burns: 0, quiets: 0, marks: 0, used: {}, moral: [], claimants: { A: ['you'] }, stickOut: false, steers: 0, booked: null, over: false };
  }
  function newGame() { return { shift: newShift(1), history: [], done: false }; }

  // the porthole: the whole fleet from where this pod is (rule 2). Positions of the others relative to this one.
  function view(s, id) {
    var me = s.pods[id];
    if (!me.porthole) return null;
    return Object.keys(s.pods).filter(function (k) { return k !== id; }).map(function (k) { return { id: k, dx: s.pods[k].x - me.x, dy: s.pods[k].y - me.y, big: s.pods[k].big }; });
  }
  // the pilot's tape: the pod's log seen from inside (rule 1: no wire; each line is the pilot's own)
  function tape(s, id) { return s.logs[id].map(function (l) { return { t: l.t, feel: l.feel }; }); }
  // everything the station can see of the fleet: portholes and logs (rule 2). This is what the book reads.
  function observe(s) {
    var o = {};
    Object.keys(s.pods).forEach(function (id) { o[id] = { view: view(s, id), log: s.logs[id].map(function (l) { return l.t + ' ' + l.ev; }), scorched: s.pods[id].scorched }; });
    return JSON.stringify(o);
  }
  function lastLine(s, id) { return s.logs[id][s.logs[id].length - 1]; }
  function nextTime(s, id) { var t = lastLine(s, id).t.split(':'); return t[0] + ':' + (parseInt(t[1], 10) + 1); }

  // ---------- the tries ----------
  // BURN: peel n layers of pod A. Rule 3: a pod all the way down; the pilot in every layer; only the outside scorched.
  function burn(s, depthIndex) {
    var d = CONFIG.DEPTHS[depthIndex], A = s.pods.A, n = Math.min(d.n, CONFIG.BURN_CAP), who = A.pilot;
    A.scorched += 1; s.burns++; s.used.burn = true;
    var frames = [
      { pic: 'fire', text: 'Fire on the outside of pod A.' },
      { pic: 'peel', n: n, all: !!d.all, text: d.all ? 'The outer layer burns off. Inside it, a pod, with a porthole, and ' + who + ' in it. Then the next layer. The counter runs.' : 'The outer layer burns off. Inside it, a pod, with a porthole, and ' + who + ' in it. Then the next layer, and the next.' },
      { pic: 'remains', n: n, all: !!d.all, text: d.all ? 'Past a million layers the station stops counting. A pod, with a porthole; ' + who + ' in it; the fleet in the window.' : n + (n === 1 ? ' layer' : ' layers') + ' burnt. A pod, with a porthole; ' + who + ' in it; the fleet in the window. The outside is scorched.' }
    ];
    var voice = (d.all ? 'You burnt past a million layers and the station stopped counting. ' : 'You burnt ' + n + (n === 1 ? ' layer' : ' layers') + '. ') + 'Under every layer there was a pod with ' + who + ' in it and the same fleet in its window. There is no bottom to burn down to, so there is no way to open the pod and let ' + A.her + ' out. The fire scorched the outside.';
    var book = 'Pod A: outside scorched. Pilot: ' + who + ', as before.';
    var r = { kind: 'burn', depth: d, n: n, all: !!d.all, frames: frames, voice: voice, book: book, leibniz: CONFIG.LEIBNIZ.burn, exhausted: s.burns >= 2 };
    s.tries.push(r); return r;
  }

  // SWAP QUIETLY: exchange the pilot of A with the pilot of the target pod, with nothing to show for it.
  // Rule 2 decides: the book reads the portholes and the logs; if nothing it reads has changed, it writes nothing, and a swap it cannot
  // write is no swap. The porthole is the point of view, which belongs to the pod's position, so it cannot move with a pilot.
  function swapQuiet(s, targetId) {
    var A = s.pods.A, T = s.pods[targetId]; s.quiets++; s.used.quiet = true;
    if (!T.porthole) {
      var fr = [ { pic: 'seek', target: targetId, text: 'The station looks for a porthole on ' + T.name + '. It finds none.' },
                 { pic: 'heap', target: targetId, text: 'With no porthole there is no pilot to find, and no way to tell whether ' + T.name + ' is a pod or a heap.' } ];
      var rh = { kind: 'quiet', target: T, heap: true, frames: fr, voice: 'You asked for a swap with ' + T.name + '. The station found no porthole, so it cannot tell whether there is a pilot in it, or whether it is a pod at all rather than a heap of stuff. Nothing to swap with.', book: T.name + ': no porthole found. Nothing written. ' + cap(A.pilot) + ' is in pod A.', leibniz: CONFIG.LEIBNIZ.heap, exhausted: false };
      s.tries.push(rh); return rh;
    }
    var before = observe(s), hyp = clone(s);
    var p = hyp.pods.A.pilot; hyp.pods.A.pilot = hyp.pods[targetId].pilot; hyp.pods[targetId].pilot = p;   // the exchange, supposed
    var after = observe(hyp), same = before === after;
    var frames = [
      { pic: 'cross', target: targetId, text: 'Two shadows cross between pod A and ' + T.name + ', quietly.' },
      { pic: 'windows', target: targetId, text: 'The two portholes, before and after. Pod A’s window is the fleet from pod A; ' + T.name + '’s is the fleet from there. The same.' },
      { pic: 'tapes', target: targetId, text: 'The two logs run on. The same lines; nothing new.' },
      { pic: 'book', target: targetId, text: 'The book reads the portholes and the logs, finds nothing changed, and writes nothing.' }
    ];
    var voice = 'You swapped ' + A.pilot + ' and ' + T.pilot + ' on the quiet. Every porthole still shows what it showed, because a porthole is the fleet from where its pod is, and no pod moved. Every log still says what it said. The book writes only what the pods show, so it wrote nothing; and a swap the book cannot write is no swap at all. ' + cap(A.pilot) + ' is where ' + A.her + ' window is: in pod A.';
    var book = 'Nothing shown. Nothing written. ' + cap(A.pilot) + ' is in pod A.';
    var r = { kind: 'quiet', target: T, heap: false, same: same, frames: frames, voice: voice, book: book, leibniz: CONFIG.LEIBNIZ.quiet, exhausted: false };
    s.tries.push(r); return r;
  }

  // SWAP WITH A MARK: exchange, and ask pod B to show a sign on arrival. The sign goes into B's log, and the book finds the line
  // it follows from. Rule 2: every line follows from the line before; a mark is the pod's own. For a mind, the memory is the exception
  // (rule 5): it too has a mechanical cause, and the second book records it all the same.
  function swapMark(s, signId) {
    var A = s.pods.A, B = s.pods.B, m = CONFIG.MARKS[signId]; s.marks++; s.used.mark = true;
    var t0 = nextTime(s, 'B'), causeIdx = s.logs.B.length;
    s.logs.B.push({ t: t0, ev: m.causeEv, cause: 0, feel: m.mind ? 'the thought of pod A comes' : 'a stir' });
    var t1 = nextTime(s, 'B');
    s.logs.B.push({ t: t1, ev: m.ev, cause: causeIdx, feel: m.mind ? 'I was in pod A; I remember' : (signId === 'lamp' ? 'light' : signId === 'roll' ? 'the fleet wheels in the window' : 'the fleet slides across the window') });
    var frames = [ { pic: 'cross', target: 'B', text: 'Two shadows cross between pod A and ' + B.name + '.' } ];
    if (!m.mind) {
      frames.push({ pic: 'mark', sign: signId, text: cap(B.name) + ' shows the sign: ' + m.said + '. Its log writes it: ' + t1 + ', ' + m.ev + '.' });
      frames.push({ pic: 'arrow', sign: signId, text: 'The book reads the line before: ' + t0 + ', ' + m.causeEv + '. The sign follows from it. The sign is the pod’s own.' });
      var voice = 'You asked ' + B.name + ' to mark the arrival with ' + (signId === 'lamp' ? 'its lamp' : signId === 'roll' ? 'a roll' : 'a new course') + ', and it did. Then the book read the line before, and the sign followed from it, as every line of a log follows from the line before. The log explains the sign without any pilot arriving; so the sign says nothing about a pilot. ' + cap(A.pilot) + ' is in pod A.';
      var book = cap(B.name) + ': ' + m.said + '; its cause, the line before: ' + m.causeEv + '. Pilot: ' + B.pilot + ', as before.';
      var r = { kind: 'mark', sign: m, signId: signId, frames: frames, voice: voice, book: book, leibniz: CONFIG.LEIBNIZ.mark, exhausted: s.marks >= 2, moral: false };
      s.tries.push(r); return r;
    }
    // the memory, for minds
    s.moral.push('The far pilot claims the life of your pod’s pilot: the roll at 3:12, the warmth at 3:13. By what it claims and remembers: morally, it is you.');
    s.claimants.A = ['you', 'the far pilot']; s.beamed = true;
    frames.push({ pic: 'speak', sign: 'memory', text: 'The far pod’s pilot speaks: “I was in pod A. I remember the roll at 3:12 and the warmth at 3:13.” Its log writes it: ' + t1 + '.' });
    frames.push({ pic: 'arrow', sign: 'memory', text: 'The book reads the line before: ' + t0 + ', ' + m.causeEv + '. The words follow from it, like any line. The first book writes the words and their cause, and no pilot arriving.' });
    frames.push({ pic: 'moral', text: 'A second book slides open, kept not by what pods show but by what minds claim and remember. It writes: the far pilot claims your life. Morally, it is you.' });
    frames.push({ pic: 'speakA', text: 'Look at your pod. You are in it, and you say the same words.' });
    var voiceM = 'It worked, in the second book: the far pilot remembers your life, claims it, and by what it claims it is, morally, you. In the first book nothing arrived: the words followed from the far pod’s own works, as every line follows from the line before. And nothing left: you are still in your pod, remembering the same roll and the same warmth. Two pilots now claim one life.';
    var bookM = 'The far pod: its pilot claimed your life, from its own works. Pilot: as before. · Second book: the far pilot is, morally, you.';
    var rm = { kind: 'mark', sign: m, signId: 'memory', frames: frames, voice: voiceM, book: bookM, leibniz: CONFIG.LEIBNIZ.memory, exhausted: true, moral: true, claimants: 2 };
    s.tries.push(rm); return rm;
  }

  // THE STICK (shift 2, free): push the stick, the pod rolls, the fleet turns in the window, and the two tapes say why: the thruster
  // on its schedule, and your wanting. Rule 1: no wire. Pull the stick out and the same happens.
  function steer(s, dir) {
    s.steers++;
    var t = nextTime(s, 'A'), i = s.logs.A.length;
    s.logs.A.push({ t: t, ev: 'the thruster fires, on its schedule', cause: 0, feel: 'I want to go ' + dir });
    s.logs.A.push({ t: nextTime(s, 'A'), ev: 'rolls ' + dir, cause: i, feel: 'the fleet turns ' + (dir === 'left' ? 'right' : 'left') + ' in the window' });
    return { dir: dir, stickOut: s.stickOut, text: s.stickOut
      ? 'You wanted ' + dir + ', and the pod rolled ' + dir + '. The stick is in your hand, attached to nothing. Your wanting is your own line; the pod’s roll is its own, the thruster on its schedule. They agree.'
      : 'You pushed the stick ' + dir + ', and the pod rolled ' + dir + '. The pod’s log says why it rolled: the thruster, on its schedule. Your tape says why you pushed: you wanted ' + dir + '.' };
  }
  function pullStick(s) { s.stickOut = true; return { text: 'The stick comes out in your hand. It was attached to nothing. Want a turn, and see.' }; }

  // BOOK PASSAGE: the last decision, no score (memo: the text ranks "possible" under "in keeping with order", and the game says so in words).
  function bookPassage(s, wayId) {
    var w = CONFIG.WAYS[wayId]; s.booked = wayId; s.over = true;
    var r = { kind: 'book', way: w, wayId: wayId, leibniz: CONFIG.LEIBNIZ.booking };
    if (wayId === 'beam') { r.claimants = 2; r.voice = 'Booked by beam. A life at the far station remembers yours and claims it, and the second book says: morally, you. You are here as well, with the same memories, and the second book says the same of you. Two of you; one life claimed twice; nothing moved.'; }
    if (wayId === 'pod') { r.claimants = 1; r.voice = 'Booked by pod. You and your pod go together, slowly, along the fleet, and arrive as one. The first book writes the pod’s course, line by line; the second book has one of you in it, where the first book has your pod.'; }
    if (wayId === 'beamburn') { r.claimants = 2; r.voice = 'Booked by beam, and then fire for the pod left here. The far pilot claims your life; the fire scorches the outside of your pod; under every layer, a pod, with you in it. Two of you; one scorched.'; }
    s.tries.push(r); return r;
  }

  // ---------- the verdict ----------
  function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  function list(xs) { return xs.length <= 1 ? (xs[0] || '') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]; }
  function verdict(game) {
    var s1 = game.history[0] || game.shift, s2 = game.shift.shift === 2 ? game.shift : null, burns = s1.tries.filter(function (t) { return t.kind === 'burn'; }),
        quiets = s1.tries.filter(function (t) { return t.kind === 'quiet'; }), marks = s1.tries.filter(function (t) { return t.kind === 'mark'; }),
        beam = s2 ? s2.tries.filter(function (t) { return t.kind === 'mark'; }) : [], booking = s2 ? s2.tries.filter(function (t) { return t.kind === 'book'; })[0] : null;
    var paper = 'No pilot ever leaves its pod. There is no pod to open, because a pod is pods all the way down, and no swap to write, because a swap that shows nothing is nothing and whatever a swap shows, the pod’s own log explains. A mind can be continued somewhere else by a life that remembers it, and morally that life is the mind; but it moves nothing, and it is more in keeping with order that a mind and its pod go together.';
    var found = [];
    if (burns.length) found.push('You burnt ' + list(burns.map(function (b) { return b.all ? 'past a million layers' : b.n + (b.n === 1 ? ' layer' : ' layers'); })) + ' and found a pod under every one, with the dog in it.');
    if (quiets.length) found.push('You swapped on the quiet with ' + list(quiets.map(function (q) { return q.target.name; })) + (quiets.some(function (q) { return q.heap; }) ? '; the diamond had no porthole to read, and for the rest' : ', and') + ' the book wrote nothing, because nothing showed.');
    if (marks.length) found.push('You marked the arrival with ' + list(marks.map(function (m) { return m.sign.name; })) + ', and the log explained ' + (marks.length > 1 ? 'each sign' : 'the sign') + ' from the line before it.');
    if (beam.length) found.push(beam.some(function (b) { return b.moral; }) ? 'You beamed a memory: the far pilot claimed your life, the second book wrote it, and you were still in your pod. Two pilots, one life.' : 'You beamed with a mechanical sign and the log explained it.');
    if (booking) found.push('You booked your passage ' + booking.way.key.toLowerCase() + '.');
    var part = !booking ? '' : booking.wayId === 'pod' ? 'You went as Leibniz would: moral identity with physical identity, one of you, together.' : booking.wayId === 'beam' ? 'You took the road Leibniz calls possible and would not take: a life that remembers yours, and you left here as well.' : 'You tried to leave only one of you, and met the first thing you found: a pod has no bottom. Leibniz would have you fly.';
    var followed = !booking ? '' : booking.wayId === 'pod' ? 'Had the quiet swap been written instead, the book would record what nothing shows, and could then record anything; had the lamp counted, every lamp on every pod would be a pilot arriving.' : 'Two of you now claim one life, and the station must decide whose promise a promise is and whose debt a debt. Leibniz keeps that from happening by keeping moral identity with the body.';
    return { paper: paper, found: found, part: part, followed: followed, booking: booking, claimants: booking ? booking.claimants : null };
  }

  // ---------- shift control ----------
  function shiftDone(s) { return s.shift === 1 ? !!(s.used.burn && s.used.quiet && s.used.mark) : !!s.booked; }
  function nextShift(game) { game.history.push(game.shift); game.shift = newShift(2); return game.shift; }

  var API = { CONFIG: CONFIG, newGame: newGame, newShift: newShift, view: view, tape: tape, observe: observe, burn: burn, swapQuiet: swapQuiet, swapMark: swapMark, steer: steer, pullStick: pullStick, bookPassage: bookPassage, verdict: verdict, shiftDone: shiftDone, nextShift: nextShift, cap: cap };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BEAM = API;
})(typeof window !== 'undefined' ? window : this);
