// Nagel’s Camera (formerly Zoom Out with Nagel): the mechanism, headless and the only copy. Runs unchanged in Node (module.exports) and in the
// browser (window.NagelMechanism). Everything that moves an outcome lives here: the six rounds (thing, reader, the three
// frames and how much of the thing each holds), the rule that says whether a reader can read a frame, the result of a
// send, the closing question and the verdict's words. The interface only passes actions in and draws what comes back.
(function (root) {
'use strict';

// ---------------------------------------------------------------------------------------------------------------
// CONFIG: every tunable number and word, tagged with its source in the paper (Nagel 1974, Philosophical Review
// 83(4); page numbers are the journal's) or with the design reason. The paper has no numbers: every fraction here is
// ours, a toy of the argument, and the About screen says so.
// ---------------------------------------------------------------------------------------------------------------
var CONFIG = {
  // The three stops of the zoom ring (memo §15: ours; Nagel's direction of objectivity is a continuum, p. 443 and
  // fn. 8). 'needs' is what it takes to read a frame at that stop: the near frame needs the sense the thing is in
  // (pp. 441-442: a point of view is a type, taken up only by one similar enough), the shape frame needs a mind
  // (p. 449: structural features "accessible to objective description", for "beings incapable of having those
  // experiences"), the physics frame needs instruments and sums (pp. 443-444: the domain "observed and understood
  // from many points of view").
  STOPS: [
    { id: 'inside',  label: 'Naked eye',    needsLabel: null,     reads: 'with the same sense' },
    { id: 'shape',   label: 'The shape',    needsLabel: 'a mind', reads: 'with a mind' },
    { id: 'physics', label: 'The physics',  needsLabel: 'instruments and sums', reads: 'with instruments and sums' }
  ],
  // How much of the thing each frame holds, 0 to 1 (all ours; the paper gives direction only, memo §15).
  // An experience: all of it from inside; a part in the shape (p. 449: "at least in part", "something would be
  // left out"); none in the physics (fn. 10, p. 444: "no trace of which is to be found by someone looking into my
  // brain"; p. 445: "takes us farther away from it"). A thing in the world: its look only from inside (p. 443:
  // "not exhausted by its visual appearance"); a part in the shape; all of it in the physics (p. 443: the Martian
  // "could understand the rainbow, or lightning, or clouds as physical phenomena").
  HOLDS: {
    experience: { inside: 1, shape: 0.3, physics: 0 },
    world:      { inside: 0.25, shape: 0.6, physics: 1 }
  },
  // Words for how much arrived, by fraction (memo §7: direction first, rough size; no decimals on screen). Ours.
  ARRIVED_WORDS: [[1, 'All'], [0.5, 'Most'], [0.01, 'A part'], [0, 'None']],
  // Senses a reader can have. 'sonar' is the bat's (p. 438); nobody human has it.
  SENSES: { eyes: 'eyes', ears: 'ears', body: 'a body that feels', mind: 'a mind', sums: 'instruments and sums', sonar: 'sonar' },
  // The same senses after "no": "has no eyes", "has no body that feels".
  NO_SENSE: { eyes: 'eyes', ears: 'ears', body: 'body that feels', mind: 'mind', sums: 'instruments', sonar: 'sonar' },
  // The six rounds, in play order (memo §11: the collision in round 3). Each: the thing (what the reader asks about),
  // its kind, the sense its inside frame is in, the reader, and the lines. Readers' sense lists are ours, from the
  // paper's descriptions (memo §15).
  ROUNDS: [
    { id: 'sunset', thing: 'the sunset, as it was for you', short: 'the sunset', kind: 'experience', sense: 'eyes',
      // p. 442: "one person can know or say of another what the quality of the other's experience is"
      reader: { id: 'sam', name: 'Sam', pron: 'he', who: 'a friend', has: ['eyes', 'ears', 'body', 'mind', 'sums'], lacks: [] },
      ask: 'What was the sunset like for you tonight?',
      frames: {
        inside:  { says: 'The sky over the sea going orange, then pink, then violet, the sun half down, you on the pier.' },
        shape:   { says: 'Warm at the bottom, cool at the top, a slow fade; the sun a disc, dropping; the whole sky changing at once.' },
        physics: { says: 'The sun two degrees below the horizon; its light crossing 300 km of air; the short waves scattered out, the long ones left.' }
      },
      reply: { inside: 'That’s the one. I was nearly there with you.',
               shape: 'Warm below, cool above. Yes. But what was it like?',
               physics: 'Two degrees below. I see. But what was it like?',
               unread: '' } },
    { id: 'lightning', thing: 'lightning', short: 'lightning', kind: 'world', sense: 'eyes',
      // p. 443: "A Martian scientist with no understanding of visual perception could understand the rainbow, or
      // lightning, or clouds as physical phenomena, though he would never be able to understand the human concepts"
      reader: { id: 'martian', name: 'the Martian', pron: 'it', who: 'a scientist from elsewhere', has: ['mind', 'sums'], lacks: ['eyes', 'ears', 'body'] },
      ask: 'What is lightning?',
      frames: {
        inside:  { says: 'A white crack splitting a purple sky, there and gone, and you flinching before the bang.' },
        shape:   { says: 'A branching line, top to bottom, over in an instant; then a bang, later the further away.' },
        physics: { says: 'Charge piled up between cloud and ground; a channel of air torn open; 30,000 amps down it; the air heated white-hot in a flash.' }
      },
      reply: { inside: '', shape: 'A branching line, then a bang. I have the outline of it. What is it?',
               physics: 'Charge, a channel, a current. I have it. I could make one.', unread: 'I have no eyes. This frame is nothing to me.' } },
    { id: 'red', thing: 'red, as it is to see it', short: 'red', kind: 'experience', sense: 'eyes',
      // p. 449: "concepts that could be used to explain to a person blind from birth what it was like to see";
      // "Red is like the sound of a trumpet" is of little use
      reader: { id: 'ada', name: 'Ada', pron: 'she', who: 'blind from birth', has: ['ears', 'body', 'mind', 'sums'], lacks: ['eyes'] },
      ask: 'What is red like?',
      frames: {
        inside:  { says: 'A field of poppies, red to the edges. This. Just this.' },
        shape:   { says: 'One of the colours; next to orange, far from green; the warm end; the colour of ripe fruit, of blood, of a stop sign.' },
        physics: { says: 'Light of about 700 nanometres; the long-wave cones in the eye firing more than the others.' }
      },
      reply: { inside: '', shape: 'Next to orange, the warm end, blood. So I know where it sits. And what is it like? Say it in sound and I would have it; I hear.',
               physics: 'Seven hundred nanometres. A number. And what is it like?', unread: 'I have never seen. This frame is nothing to me.' } }
  ],
  // What left the picture on the way to each stop, as the player saw it happen on the ring (revision 1; ours).
  LEFT: {
    sunset:    { inside: 'Nothing has left yet: this is the evening as you had it.', shape: 'On the way here the figure on the pier went out of the frame, then the colour; the sun stayed, as a disc going down.', physics: 'On the way here the figure went, then the colour, then the sun as you saw it; the camera pulled back until the earth was a ball and the evening was a sun two degrees under a line.' },
    lightning: { inside: 'Nothing has left yet: the flash as you had it, and the flinch.', shape: 'On the way here you went out of the frame, then the colour; the bolt stayed, as a branching line, and the bang took its place after it.', physics: 'On the way here you went, then the colour; the bolt stayed in the middle and gained what made it: the cloud, the ground, the charge, the channel.' },
    red:       { inside: 'Nothing has left yet: the field, red to the edges.', shape: 'On the way here the red went out of the poppies and a ring of colours came in with one slot marked; the red is the slot, not the colour.', physics: 'On the way here the red went, then the field; the eye that saw it shrank to the corner and the frame filled with the light that caused it.' }
  },
  // The second half (revision 3): the camera turns on the bat and the player builds, from pieces of their own evening,
  // storm and field, what the bat has of each. The grading is the SHAPE of a bat's world, built as a biologist would
  // build it from structure and behaviour (Nagel p. 439: "we may ascribe general types of experience on the basis of the
  // animal's structure and behavior"). Which pieces are in rests on bat biology the paper does not contain, summarised
  // from general references (Neuweiler, The Biology of Bats, 2000; Fenton & Simmons, Bats: A World of Science and
  // Mystery, 2015): most small bats have poor eyesight that tells light from dark and no colour, hearing far sharper
  // than ours, sonar as the main sense, and a good nose; they feel warmth and cold as we do, and fly at dusk. The pieces,
  // their idiom in the window, and the lines are ours.
  NIGHTS: [
    { id: 'evening', thing: 'the sunset', name: 'the bat\u2019s evening', ask: 'How does the bat have the sunset?',
      pieces: [
        { id: 'colour', label: 'the colour of the sky', idiom: 'light', in: false, why: 'A bat\u2019s eyes tell light from dark and no colour, and sonar carries no light. The colour is not in there.' },
        { id: 'disc', label: 'the sun\u2019s disc', idiom: 'light', in: false, why: 'A bat\u2019s eyes make no disc of it; at most a brightness, going.' },
        { id: 'warm', label: 'the warmth of the air', idiom: 'warm', in: true, why: 'A bat\u2019s skin feels the warm air as yours does.' },
        { id: 'sea', label: 'the sound of the sea', idiom: 'sound', in: true, why: 'A bat\u2019s hearing is far sharper than yours. The sea is loud in there.' },
        { id: 'moths', label: 'the moths rising', idiom: 'echo', in: true, why: 'Every moth answers a shriek. This is what the evening is for.' },
        { id: 'dark', label: 'the dark coming', idiom: 'dark', in: true, why: 'Dark from light is what a bat\u2019s eyes are for, and dusk is when it wakes.' }
      ] },
    { id: 'storm', thing: 'lightning', name: 'the bat\u2019s storm', ask: 'How does the bat have the lightning?',
      pieces: [
        { id: 'crack', label: 'the white crack', idiom: 'flash', in: true, why: 'A flash of brightness, yes: a bat\u2019s eyes can tell that much. The shape of it, no.' },
        { id: 'purple', label: 'the purple sky', idiom: 'light', in: false, why: 'No colour. The sky is not purple in there, or any colour.' },
        { id: 'bang', label: 'the bang', idiom: 'sound', in: true, why: 'Enormous. A bat\u2019s ears are made for faint echoes; thunder fills them.' },
        { id: 'rain', label: 'the rain on the leaves', idiom: 'echo', in: true, why: 'Every drop answers a shriek. The air fills with clutter.' },
        { id: 'flinch', label: 'the flinch', idiom: 'self', in: false, why: 'That was yours. It came with the sight of the crack, and the sight is not in there.' },
        { id: 'petrichor', label: 'the smell of rain', idiom: 'smell', in: true, why: 'A bat has a good nose. The wet earth is in there.' }
      ] },
    { id: 'field', thing: 'red', name: 'the bat\u2019s field', ask: 'How does the bat have the red?',
      pieces: [
        { id: 'red', label: 'the red', idiom: 'light', in: false, why: 'No colour vision, and sonar carries no light. The red is not in there at all.' },
        { id: 'shapes', label: 'the shape of the poppies', idiom: 'echo', in: true, why: 'By echo: a soft clutter of stalks and cups, each answering a shriek.' },
        { id: 'smell', label: 'the smell of the field', idiom: 'smell', in: true, why: 'A good nose. The field is in there as a smell before anything else.' },
        { id: 'rustle', label: 'the rustle of the stalks', idiom: 'sound', in: true, why: 'Sharp ears. The rustle is loud in there.' },
        { id: 'warmend', label: 'the warm end of the colours', idiom: 'light', in: false, why: 'There is no ring of colours in a bat, so nothing has a warm end.' },
        { id: 'bees', label: 'the bees humming', idiom: 'echo', in: true, why: 'Heard, and echoed: small, fast, near.' }
      ] }
  ],
  // Words for how much of the shape the player built (ours; no tally on screen).
  BUILT_WORDS: [[1, 'All of'], [0.74, 'Most of'], [0.4, 'About half of'], [0.01, 'A little of'], [0, 'None of']],
  BLANK_LINE: 'One stop further in than the shape you built, the window is blank. That is as far in as anyone\u2019s camera goes: what it is like for the bat to have this is the stop nobody reaches.',
  // The three readings of the blank (p. 440: a sceptical conclusion would be wrong; pp. 446-447: physicalism not
  // shown false, the "is" not understood). Read on the end screen, not chosen (revision 4).
  READINGS: [
    { id: 'nothing', label: 'Nothing is there: there is nothing it is like to be a bat.', says: 'Nagel says this would be wrong: a frame you cannot read is not an empty one. Ada could not read your red, and the red was there; a physiologist with your whole brain on screen would find none of it, and it would be there.' },
    { id: 'physics', label: 'Only the physics is there: the bat\u2019s world is that shriek and that echo.', says: 'Nagel does not call this false. He says nobody can yet read it, like \u201Cmatter is energy\u201D said two thousand years early: the physics of your red could arrive whole, and the red was not in it. The same question is asked today of machines.' },
    { id: 'something', label: 'Something is there that you have no way to read.', says: 'This is Nagel\u2019s. We can build the shape, as you did, and believe the inside as rich as our own, and still have no way in, because every frame we take is taken from where we stand.' }
  ]
};

// ---------------------------------------------------------------------------------------------------------------
// The rules.
// ---------------------------------------------------------------------------------------------------------------
function stopIndex(stop) { for (var i = 0; i < CONFIG.STOPS.length; i++) if (CONFIG.STOPS[i].id === stop) return i; return -1; }
function round(k) { return CONFIG.ROUNDS[k]; }
// What it takes to read a frame: the near frame needs the sense the thing is in; the others as in STOPS.
function needs(k, stop) {
  if (stop === 'inside') return round(k).sense;
  return stop === 'shape' ? 'mind' : 'sums';
}
function needsLabel(k, stop) { return CONFIG.SENSES[needs(k, stop)]; }
// Can this round's reader read this frame? (memo §15: a threshold, the coarse form of fn. 8's continuum)
function canRead(k, stop) { return round(k).reader.has.indexOf(needs(k, stop)) >= 0; }
// How much of the thing this frame holds.
function holds(k, stop) { return CONFIG.HOLDS[round(k).kind][stop]; }
function arrivedWords(f) { for (var i = 0; i < CONFIG.ARRIVED_WORDS.length; i++) if (f >= CONFIG.ARRIVED_WORDS[i][0]) return CONFIG.ARRIVED_WORDS[i][1]; return 'None'; }
// Why a frame holds what it holds, in the rule's own words (the sum shown after the move, SKILL.md §3).
function why(k, stop) {
  var r = round(k), exp = r.kind === 'experience';
  if (exp) {
    if (stop === 'inside') return 'It lives in this frame: how it is from where you stand.';
    if (stop === 'shape') return 'The shape of it crossed: where it sits among its neighbours and what it makes you do. The thing itself stayed in the first frame.';
    if (r.id === 'bat') return 'The cause of it crossed, not the thing. The bat\u2019s world lives in the frame you cannot read.';
    return 'The cause of it crossed, not the thing. Step back from your senses and a thing in your sensing drops out of the frame.';
  }
  if (stop === 'inside') return 'Only how it looks crossed. ' + cap(r.short) + ' is more than its look.';
  if (stop === 'shape') return 'Its outline crossed. Step back further and more of it comes into view.';
  return 'Step back from your eyes and a thing in the world stays in view and gets clearer. The flash you saw is what this does to air and to eyes.';
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
// A send. Returns everything the screen needs to say what happened.
function send(k, stop) {
  var r = round(k), readable = canRead(k, stop), h = holds(k, stop), arrived = readable ? h : 0;
  var line, sense = CONFIG.SENSES[needs(k, stop)], you = r.id === 'bat';
  if (!readable) {
    line = (you ? 'You asked for ' : 'You sent ') + r.short + ' ' + stopPhrase(stop) + '. ' + (you ? 'You have' : cap(r.reader.name) + ' has') + ' no ' + CONFIG.NO_SENSE[needs(k, stop)] + ', and that frame can be read only with ' + sense + '. Nothing arrived.';
  } else {
    line = (you ? 'You asked for ' : 'You sent ') + r.short + ' ' + stopPhrase(stop) + '. ' + (you ? 'You have ' : cap(r.reader.name) + ' has ') + sense + '; ' + (you ? 'you' : r.reader.pron) + ' read it. ' + arrivedWords(arrived) + ' of ' + r.short + ' arrived.';
  }
  var reply = readable ? r.reply[stop] : r.reply.unread;
  return { round: k, stop: stop, readable: readable, holds: h, arrived: arrived, words: arrivedWords(arrived), line: line, why: readable ? why(k, stop) : null, reply: reply, frame: r.frames[stop].says, need: needsLabel(k, stop), left: CONFIG.LEFT[r.id][stop] };
}
function stopPhrase(stop) { return stop === 'inside' ? 'from the naked eye' : stop === 'shape' ? 'as the shape' : 'as the physics'; }
function withSense(k, stop) { return CONFIG.SENSES[needs(k, stop)]; }
// The best stop for a round: the readable frame that holds most.
function best(k) {
  var b = null, bf = -1;
  CONFIG.STOPS.forEach(function (s) { var f = canRead(k, s.id) ? holds(k, s.id) : 0; if (f > bf) { bf = f; b = s.id; } });
  return { stop: b, arrived: bf };
}

// ---------------------------------------------------------------------------------------------------------------
// The nights: grading a built window. `chosen` is an array of piece ids.
// ---------------------------------------------------------------------------------------------------------------
function night(n) { return CONFIG.NIGHTS[n]; }
function builtWords(f) { for (var i = 0; i < CONFIG.BUILT_WORDS.length; i++) if (f >= CONFIG.BUILT_WORDS[i][0]) return CONFIG.BUILT_WORDS[i][1]; return 'None of'; }
function grade(n, chosen) {
  var N = night(n), inCount = 0, found = 0, wrong = [], pieces = N.pieces.map(function (p) {
    var c = chosen.indexOf(p.id) >= 0; if (p.in) inCount++; if (p.in && c) found++; if (!p.in && c) wrong.push(p.label);
    return { id: p.id, label: p.label, idiom: p.idiom, chosen: c, in: p.in, why: p.why, status: c && p.in ? 'kept' : c && !p.in ? 'faded' : !c && p.in ? 'missed' : 'left' };
  });
  var f = found / inCount, w = builtWords(f);
  var NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
  var line = w + ' the shape of ' + N.name + ' is in your window' + (found === inCount ? '' : ', ' + NUM[inCount - found] + ' of its pieces missing') + (wrong.length ? ', and ' + joinList(wrong) + (wrong.length > 1 ? ' are' : ' is') + ' in it that a bat does not have.' : ', and nothing that a bat does not have.');
  return { night: n, pieces: pieces, found: found, inCount: inCount, wrong: wrong, fraction: f, words: w, line: line };
}
function joinList(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function nightLine(g) { var N = night(g.night); return cap(N.name) + ': ' + g.words.toLowerCase() + ' its shape' + (g.wrong.length ? ', with ' + joinList(g.wrong) + ' in it that ' + (g.wrong.length > 1 ? 'do' : 'does') + ' not belong' : '') + '; the inside, blank.'; }

// ---------------------------------------------------------------------------------------------------------------
// The verdict. `sends` is an array of six results from send(); `answer` is one of CONFIG.ANSWERS ids.
// ---------------------------------------------------------------------------------------------------------------
var NAGEL_SAYS = [
  'Step back from your eyes and a thing in the world stays in view and gets clearer: lightning is what it does, not how it looks.',
  'Step back from your eyes and an experience drops out of the frame: red is a way of seeing, not a thing seen, so the far frame holds its cause and not it.',
  'What a bat\u2019s evening holds can be built from its structure and behaviour, as you built it; what it is like for the bat is the stop nobody reaches. And a frame you cannot read is not an empty one: Ada could not read your red, and the red was there.'
];
// The evidence panel (revision 2): for a round, which frame the reader could not read, and the line under it.
function evidence(k) {
  var r = round(k), unread = canRead(k, 'inside') ? null : 'inside', line;
  if (r.id === 'bat') line = 'You could not read this frame. The bat can.';
  else if (unread) line = cap(r.reader.name) + ' could not read this frame. You can. ' + (r.kind === 'experience' ? 'It was full.' : 'It holds the look of the thing, not the thing.');
  else line = cap(r.reader.name) + ' could read every frame.';
  return { unread: unread, line: line };
}
function foundLine(s) {
  var r = round(s.round);
  var who = r.id === 'bat' ? 'you' : r.reader.name;
  if (!s.readable) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + who + ' could not read it. Nothing arrived.';
  if (s.arrived >= 1) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': all of it reached ' + who + '.';
  if (s.arrived > 0) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + (r.kind === 'experience' ? 'the shape of it reached ' + who + ', not the thing.' : 'a part of it reached ' + who + '.');
  return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + 'the cause of it reached ' + who + ', and none of the thing.';
}
function verdict(sends, grades) {
  var g = grades || [], clean = g.filter(function (x) { return x.found === x.inCount && x.wrong.length === 0; }).length;
  var head = g.length ? 'You built the shape of a bat\u2019s evening ' + ['', 'once', 'twice', 'three times'][g.length] + (clean === g.length ? ', each time whole' : clean ? ', ' + ['', 'once', 'twice'][clean] + ' whole' : '') + ', and the frame one stop further in stayed blank.' : 'The frame one stop further in stayed blank.';
  return { head: head, nagel: NAGEL_SAYS, found: sends.map(foundLine).concat(g.map(nightLine)), readings: CONFIG.READINGS };
}

// ---------------------------------------------------------------------------------------------------------------
// Strategies (build.md §3): the obvious ways of playing, for the table in the memo and the calibration check.
// ---------------------------------------------------------------------------------------------------------------
function play(strategy) {
  var out = [], total = 0;
  CONFIG.ROUNDS.forEach(function (r, k) { var s = send(k, strategy(k)); out.push(s); total += s.arrived; });
  return { sends: out, total: total };
}
var STRATEGIES = {
  'always inside':  function () { return 'inside'; },
  'always shape':   function () { return 'shape'; },
  'always physics': function () { return 'physics'; },
  'furthest the reader can read': function (k) { var b = null; CONFIG.STOPS.forEach(function (s) { if (canRead(k, s.id)) b = s.id; }); return b; },
  'nearest the reader can read':  function (k) { var b = null; CONFIG.STOPS.forEach(function (s) { if (b === null && canRead(k, s.id)) b = s.id; }); return b; },
  'best': function (k) { return best(k).stop; }
};

var api = { CONFIG: CONFIG, evidence: evidence, night: night, grade: grade, nightLine: nightLine, builtWords: builtWords, round: round, needs: needs, needsLabel: needsLabel, canRead: canRead, holds: holds, send: send, best: best, verdict: verdict, play: play, STRATEGIES: STRATEGIES, arrivedWords: arrivedWords, stopIndex: stopIndex, NAGEL_SAYS: NAGEL_SAYS };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NagelMechanism = api;
})(typeof window !== 'undefined' ? window : this);
