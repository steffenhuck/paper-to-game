// Zoom Out with Nagel: the mechanism, headless and the only copy. Runs unchanged in Node (module.exports) and in the
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
    { id: 'inside',  label: 'From inside',  needsLabel: null,     reads: 'with the same sense' },
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
      reply: { inside: '', shape: 'Next to orange, the warm end, blood. So I know where it sits. And what is it like?',
               physics: 'Seven hundred nanometres. A number. And what is it like?', unread: 'I have never seen. This frame is nothing to me.' } },
    { id: 'trumpet', thing: 'the sound of a trumpet, as it is to hear it', short: 'the trumpet', kind: 'experience', sense: 'ears',
      // p. 449: the trumpet is Nagel's own example; fn. 8: understanding is partial by similarity, and Ada hears
      reader: { id: 'ada', name: 'Ada', pron: 'she', who: 'blind from birth', has: ['ears', 'body', 'mind', 'sums'], lacks: ['eyes'] },
      ask: 'And the sound of a trumpet, what is that like?',
      frames: {
        inside:  { says: 'That bright brassy blare, right in the chest, the note held and then bent.' },
        shape:   { says: 'A loud, bright sound; sharp at the start, steady, then bent; one note of the scale at a time.' },
        physics: { says: 'A column of air set shaking at 440 times a second, with the overtones piled on; a wave in the air.' }
      },
      reply: { inside: 'Oh, I know that one. Right in the chest. Yes.',
               shape: 'Loud, bright, steady. I know all that already; I hear. Why the outline?',
               physics: 'Four hundred and forty a second. I hear trumpets, you know. Why the sums?', unread: '' } },
    { id: 'pain', thing: 'your pain', short: 'the pain', kind: 'experience', sense: 'body',
      // p. 444: "a Martian investigating my brain might be observing physical processes which were my mental
      // processes"; fn. 10; fn. 11: pain's "immediate phenomenological quality"; pp. 446-447: the "is" not understood
      reader: { id: 'physiologist', name: 'the physiologist', pron: 'he', who: 'a Martian, your whole brain on its screen', has: ['mind', 'sums'], lacks: ['eyes', 'ears', 'body'] },
      ask: 'I have every cell of your brain on screen. What is your pain?',
      frames: {
        inside:  { says: 'Your hand on the hot pan. That. Sharp, and all at once, and nothing else in the world.' },
        shape:   { says: 'Sharp, not dull; in the hand, not everywhere; it makes the hand pull back; worse than an itch, like a burn.' },
        physics: { says: 'Heat at the skin; a signal up the arm; a region of the brain lighting up; the arm’s muscles firing.' }
      },
      reply: { inside: '', shape: 'Sharp, placed, pulls the hand back. That is more than I had. Is that all it is?',
               physics: 'I had this. It is what I measured. Is that all it is?', unread: 'I have no body. This frame is nothing to me.' } },
    { id: 'bat', thing: 'the bat’s world, as it is for the bat', short: 'the bat’s world', kind: 'experience', sense: 'sonar',
      // pp. 438-440: sonar as "three-dimensional forward perception"; the intelligent bat as our mirror
      reader: { id: 'you', name: 'you', pron: 'you', who: 'the bat is sending; you receive', has: ['eyes', 'ears', 'body', 'mind', 'sums'], lacks: ['sonar'] },
      ask: 'What is my world like? Which frame do you want?',
      frames: {
        inside:  { says: 'No picture. This frame is taken from where you cannot stand.' },
        shape:   { says: 'Forward, in three dimensions; distance, size, shape, texture, motion, read off the echoes of its own shrieks.' },
        physics: { says: 'A shriek at 50,000 times a second from the throat; the echo back to the ears; the brain timing the gap.' }
      },
      reply: { inside: '', shape: 'Forward, in three dimensions. The shape of it. What is it like? You have no idea.',
               physics: 'A shriek, an echo, a gap. All of it. What is it like? You have no idea.', unread: 'You have no sonar. This frame is nothing to you.' } }
  ],
  // The closing question (p. 440: bats or Martians trying to conceive of us "would be wrong to conclude that there is
  // not anything precise that it is like to be us"; pp. 446-447: physicalism not shown false, the "is" not understood).
  QUESTION: 'The bat’s inside frame came to you blank. What is in it?',
  ANSWERS: [
    { id: 'nothing', label: 'Nothing. There is nothing it is like to be a bat.' },
    { id: 'physics', label: 'Only what the physics frame shows. The bat’s world is that shriek and that echo.' },
    { id: 'something', label: 'Something. I have no way to read it.' }
  ],
  NAGEL_ANSWER: 'something'
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
    if (r.id === 'pain') return 'The cause of it crossed, not the thing. Nobody yet knows how to read the sentence \u201Cthe pain is this firing\u201D: it may be true, and the pain is still not in the frame.';
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
    if (r.id === 'pain' && stop === 'physics') line = 'You sent the pain as the physics. The physiologist has instruments and sums; he read it, and he had it already: it is what he measured. All of the brain arrived. Of the pain, none.';
  }
  var reply = readable ? r.reply[stop] : r.reply.unread;
  return { round: k, stop: stop, readable: readable, holds: h, arrived: arrived, words: arrivedWords(arrived), line: line, why: readable ? why(k, stop) : null, reply: reply, frame: r.frames[stop].says, need: needsLabel(k, stop) };
}
function stopPhrase(stop) { return stop === 'inside' ? 'from inside' : stop === 'shape' ? 'as the shape' : 'as the physics'; }
function withSense(k, stop) { return CONFIG.SENSES[needs(k, stop)]; }
// The best stop for a round: the readable frame that holds most.
function best(k) {
  var b = null, bf = -1;
  CONFIG.STOPS.forEach(function (s) { var f = canRead(k, s.id) ? holds(k, s.id) : 0; if (f > bf) { bf = f; b = s.id; } });
  return { stop: b, arrived: bf };
}

// ---------------------------------------------------------------------------------------------------------------
// The verdict. `sends` is an array of six results from send(); `answer` is one of CONFIG.ANSWERS ids.
// ---------------------------------------------------------------------------------------------------------------
var NAGEL_SAYS = [
  'Step back from your eyes and a thing in the world stays in view and gets clearer: lightning is what it does, not how it looks.',
  'Step back from your eyes and an experience drops out of the frame, because it is a way of seeing and not a thing seen: of red, of pain, the far frame holds the cause and not the thing.',
  'A frame you cannot read is not an empty one. The Martian got your brain and none of your pain, and your pain was there. The bat’s frame is blank to you the same way.'
];
function foundLine(s) {
  var r = round(s.round);
  var who = r.id === 'bat' ? 'you' : r.reader.name;
  if (!s.readable) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + who + ' could not read it. Nothing arrived.';
  if (s.arrived >= 1) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': all of it reached ' + who + '.';
  if (s.arrived > 0) return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + (r.kind === 'experience' ? 'the shape of it reached ' + who + ', not the thing.' : 'a part of it reached ' + who + '.');
  return cap(r.short) + ' ' + stopPhrase(s.stop) + ': ' + (r.id === 'pain' ? 'all of the brain reached him, and none of the pain.' : 'the cause of it reached ' + who + ', and none of the thing.');
}
function verdict(sends, answer) {
  var head, part, stood;
  if (answer === 'nothing') {
    head = 'You called the blank frame empty.';
    part = 'Nagel parts from you here. A frame you cannot read is not an empty one: Ada could not read your red from inside, and the red was there; the Martian could not read your pain from inside, and the pain was there. The bat’s inside frame is blank to you for the same reason, and no other.';
    stood = 'Had yours stood, the Martian with your whole brain on screen would be right to say there is nothing it is like to be you. You know that is false. So does the bat about itself.';
  } else if (answer === 'physics') {
    head = 'You called the blank frame the physics frame over again.';
    part = 'Nagel does not call this false. He says nobody can yet read it. "The bat’s world is that shriek and that echo" is a sentence like "matter is energy" said to someone two thousand years before anyone knew how it could be true: it may be so, and we have no idea what would make it so. Your own pain round showed the gap: the physics arrived whole and the pain was not in it.';
    stood = 'Had yours stood, the shriek and the echo would be all there is to the bat, and the firing would be all there is to your pain. Then the physiologist had your pain on screen all along, and could not find it. Something in the sentence is still missing.';
  } else {
    head = 'You called the blank frame full of something you cannot read.';
    part = 'That is Nagel’s answer. We can say in a schematic way what sort of thing is there (forward, three-dimensional, read off echoes) and believe it is as specific and as rich as our own, and still have no way to read it, because our frames are taken from where we stand. He adds that this does not make physicalism false: it means we do not yet understand what it would mean for it to be true.';
    stood = 'Had yours stood, and it does: there are facts about what it is like to be a bat, true and beyond our concepts; the bat is in the same position about us; and the science of the bat’s brain, which we can have in full, does not reach them.';
  }
  return { head: head, nagel: NAGEL_SAYS, found: sends.map(foundLine), part: part, stood: stood, nagelAnswer: CONFIG.NAGEL_ANSWER, answer: answer };
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

var api = { CONFIG: CONFIG, round: round, needs: needs, needsLabel: needsLabel, canRead: canRead, holds: holds, send: send, best: best, verdict: verdict, play: play, STRATEGIES: STRATEGIES, arrivedWords: arrivedWords, stopIndex: stopIndex, NAGEL_SAYS: NAGEL_SAYS };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NagelMechanism = api;
})(typeof window !== 'undefined' ? window : this);
