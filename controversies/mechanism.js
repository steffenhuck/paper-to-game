// mechanism.js — Leibniz's Even Hand. The single source of truth: the page, the readers and every rule that moves
// anything on screen live here and nowhere else. Runs unchanged in Node (calibration.js) and in the browser (inlined
// verbatim by build.py). No DOM, no randomness.
//
// The text: G. W. Leibniz, "On Controversies" (1680), A IV 3, 204–212, in Lloyd Strickland's translation (2021).
// The text has no numbers. Every number below is a design choice and says so.

var CONFIG = {
  // How many ruled lines a thing takes on the page. Our choice: a reason in full is twice a reason in brief; a reply is one line.
  LINES: { full: 2, brief: 1, reply: 1 },

  // The four rules the partisan readers apply, one pair of readers (one per side) each. Leibniz's readers "examine you very
  // closely, picking out words everywhere" (A IV 3, 207); ours count four countable things: the length (ploy 2), the points
  // left out (note 5, "so that they cannot say that their arguments have been neglected"), the answers (ploy 4) and the
  // order (ploy 1). Any difference at all places the writer: no tolerance (our choice). Each rule is one sentence a
  // teenager can check against the page; nothing is netted (revision 2).
  READERS: [
    { key: 'lines', label: 'lines', rule: 'who speaks more lines' },
    { key: 'leftout', label: 'left out', rule: 'whose points you left out' },
    { key: 'unanswered', label: 'unanswered', rule: 'whose points stand with no answer under them' },
    { key: 'ends', label: 'first & last', rule: 'who gets the first word and the last' }
  ],

  // The quarrels, written for the game (Leibniz's was the Church: A IV 3, 212, note 1): three rounds, three quarrels a round;
  // the player picks one per round on the first screen (revision 4; no defaults since revision 5). Side 0 is drawn violet, side 1 tangerine. budget: lines on the page (ploy 2, "disputes expand into
  // volumes", turned into a constraint). min: the fewest lines the readers will read as a report (our choice: keeps the
  // empty page from passing). A point has a full form and a short form, both its own side's words; its reply is the other
  // side's one line.
  POOLS: [
    [ // round 1: an even quarrel, three points a side, ten lines (phones, cars, uniforms) (phones, cars, uniforms)
      {
        slug: 'phones', question: 'Should phones be banned in school?', budget: 10, min: 6,
        sides: [
          { name: 'Ban', side: 'the ban side', says: 'The ban side says', stance: 'Ban them', of: 'the ban' },
          { name: 'Phones', side: 'the phone side', says: 'The phone side says', stance: 'Let us keep them', of: 'the phones' }
        ],
        reasons: [
          { id: 'b1', side: 0,
            full: 'Nobody can learn with a buzzing pocket. Take the phones away and whole lessons come back.',
            brief: 'A buzzing pocket makes lessons impossible.',
            reply: 'Then take away the buzzing, not the phone. Silent mode exists.' },
          { id: 'b2', side: 0,
            full: 'Break time without phones is break time with people. Schools that tried it saw the corridors fill with talk again.',
            brief: 'Without phones, break time has people in it again.',
            reply: 'Or it has bored kids staring at walls, counting the minutes.' },
          { id: 'b3', side: 0,
            full: 'Half the bullying now happens on a screen, during the school day, where no teacher can see it.',
            brief: 'Bullying moved onto screens; a ban moves it back where adults can see.',
            reply: 'It moves it to after four o’clock. The screen comes home.' },
          { id: 'p1', side: 1,
            full: 'A phone is a calculator, a dictionary, a camera and a map. Banning it bans every tool a working adult uses.',
            brief: 'A phone is every tool an adult uses. Banning it is absurd.',
            reply: 'Adults are not fourteen, and do not have maths next period.' },
          { id: 'p2', side: 1,
            full: 'Parents want to reach their kids, and kids want to reach their parents. A ban cuts that line for seven hours a day.',
            brief: 'A ban cuts the line home for seven hours a day.',
            reply: 'The school office has had a phone for a hundred years.' },
          { id: 'p3', side: 1,
            full: 'You do not learn to handle a thing by having it taken away. School is exactly where to learn to put the phone down.',
            brief: 'You learn to put a phone down by practising, not by losing it.',
            reply: 'You also do not learn to swim by being thrown in the deep end.' }
        ]
      },
      {
        slug: 'cars', question: 'Should cars be banned from the city centre?', budget: 10, min: 6,
        sides: [
          { name: 'Ban', side: 'the ban side', says: 'The ban side says', stance: 'Ban them', of: 'the ban' },
          { name: 'Cars', side: 'the car side', says: 'The car side says', stance: 'Let them drive', of: 'the cars' }
        ],
        reasons: [
          { id: 'b1', side: 0,
            full: 'Nobody walks or cycles happily beside moving metal. Take the cars out and the street becomes a place rather than a route.',
            brief: 'A street without cars becomes a place, not a route.',
            reply: 'A place for whom? For the people who can get there, which is fewer.' },
          { id: 'b2', side: 0,
            full: 'Half the air in the centre is exhaust. Every city that has tried a ban measured cleaner air within a year.',
            brief: 'The air gets cleaner, and quickly; every trial shows it.',
            reply: 'Cleaner on the closed streets; dirtier on the ring road the cars moved to.' },
          { id: 'b3', side: 0,
            full: 'Shops do better, not worse: people on foot stop, browse and come back. Drivers pass through.',
            brief: 'Shops gain: people on foot stop and browse; drivers pass.',
            reply: 'Boutiques gain. The shop that sells fridges loses; nobody carries a fridge home on foot.' },
          { id: 'c1', side: 1,
            full: 'The old, the ill and the parent with twins and the shopping cannot be told to cycle. For them the car is the city’s front door.',
            brief: 'For the old, the ill and the laden, the car is the front door.',
            reply: 'Exemptions and vans cover those. The ban is for the healthy commuter alone in two tonnes of steel.' },
          { id: 'c2', side: 1,
            full: 'A ban does not abolish trips, it reroutes them. The traffic goes somewhere, usually the poorer streets just outside the cordon.',
            brief: 'The traffic does not vanish; it moves to the streets outside.',
            reply: 'Some of it evaporates: once driving stops being easy, many trips are never made.' },
          { id: 'c3', side: 1,
            full: 'Drivers already pay road tax, parking and fuel duty to use their own city. Shutting them out is a tax rise by other means.',
            brief: 'Drivers have paid for the streets they are being shut out of.',
            reply: 'Road tax pays for a fraction of the roads; everyone else pays the rest through everything else.' }
        ]
      },
      {
        slug: 'uniforms', question: 'Should school uniforms be scrapped?', budget: 10, min: 6,
        sides: [
          { name: 'Scrap', side: 'the scrap side', says: 'The scrap side says', stance: 'Scrap them', of: 'scrapping them' },
          { name: 'Keep', side: 'the keep side', says: 'The keep side says', stance: 'Keep them', of: 'keeping them' }
        ],
        reasons: [
          { id: 'u1', side: 0,
            full: 'A uniform costs a family real money every autumn, for clothes nobody would choose and nobody can wear anywhere else.',
            brief: 'Uniforms cost real money, for clothes nobody chose.',
            reply: 'A blazer for a year is cheaper than a wardrobe that has to keep up.' },
          { id: 'u2', side: 0,
            full: 'Clothes are how a fourteen-year-old says who they are. Take that away and you get a quieter corridor, not a kinder one.',
            brief: 'Clothes are how a teenager says who they are.',
            reply: 'And how the ones with money say it louder.' },
          { id: 'u3', side: 0,
            full: 'No workplace you will ever join makes you wear a tie in order to think. Uniforms train obedience, not learning.',
            brief: 'Uniforms train obedience, not learning.',
            reply: 'Nurses, pilots and chefs would like a word.' },
          { id: 'w1', side: 1,
            full: 'In a uniform the kid in last year\u2019s trainers and the kid in this month\u2019s are the same kid. That is worth a tie.',
            brief: 'In uniform the rich kid and the poor kid look the same.',
            reply: 'They know anyway. The shoes, the bag and the phone give it away by nine.' },
          { id: 'w2', side: 1,
            full: 'Getting dressed for school in a uniform takes two minutes and no argument. Ask any parent at seven in the morning.',
            brief: 'Two minutes, no argument, every morning.',
            reply: 'Two minutes, plus ironing a shirt nobody wants to iron.' },
          { id: 'w3', side: 1,
            full: 'A school with a uniform is visible in the street, and its pupils behave as if someone might be watching. Someone is.',
            brief: 'In uniform, pupils know the school is watching.',
            reply: 'So the school outsources its discipline to passers-by.' }
        ]
      }
    ],
    [ // round 2: the short page, six lines (pets, pizza, seasons) (pets, pizza, seasons)
      {
        slug: 'pets', question: 'Dogs or cats?', budget: 6, min: 4,
        sides: [
          { name: 'Dogs', side: 'the dog side', says: 'The dog side says', stance: 'Dogs', of: 'the dogs' },
          { name: 'Cats', side: 'the cat side', says: 'The cat side says', stance: 'Cats', of: 'the cats' }
        ],
        reasons: [
          { id: 'd1', side: 0,
            full: 'A dog is glad you exist, every single time you come through the door. Nothing else on earth does that.',
            brief: 'A dog is glad you exist, every time.',
            reply: 'Glad anyone exists. It is not a judgement, it is a reflex.' },
          { id: 'd2', side: 0,
            full: 'A dog gets you out of the house twice a day in all weathers, which is more than any gym has managed.',
            brief: 'A dog gets you out of the house, twice a day.',
            reply: 'In the rain. At six. For fifteen years.' },
          { id: 'd3', side: 0,
            full: 'Dogs do jobs: they herd, guide, and find the lost and the buried. A cat has never found anyone.',
            brief: 'Dogs work: they guide, herd and rescue.',
            reply: 'Cats cleared the granaries of rats and made cities possible. Quietly.' },
          { id: 'c1', side: 1,
            full: 'A cat asks nothing of you and gives you, on its own terms, something close to respect. You have to earn it.',
            brief: 'A cat’s affection is earned, so it means something.',
            reply: 'Earned by feeding it. That is not respect, it is a contract.' },
          { id: 'c2', side: 1,
            full: 'A cat can be left alone for a weekend with a bowl and a box. Try that with a labrador.',
            brief: 'A cat can be left alone with a bowl for a weekend.',
            reply: 'A cat can be left alone because it does not mind whether you come back.' },
          { id: 'c3', side: 1,
            full: 'Cats are clean, quiet and small. They fit a flat, a budget and a city; a dog needs a garden and a van.',
            brief: 'Cats fit a flat, a budget and a city.',
            reply: 'So does a dachshund.' }
        ]
      },
      {
        slug: 'pizza', question: 'Pineapple on pizza?', budget: 6, min: 4,
        sides: [
          { name: 'Yes', side: 'the yes side', says: 'The yes side says', stance: 'Yes, obviously', of: 'the pineapple' },
          { name: 'No', side: 'the no side', says: 'The no side says', stance: 'Never', of: 'the purists' }
        ],
        reasons: [
          { id: 'y1', side: 0,
            full: 'Sweet against salty is the oldest trick in cooking. Ham and pineapple is a sandwich that went to Italy.',
            brief: 'Sweet against salty is the oldest trick in cooking.',
            reply: 'Italy did not invite it. The Hawaiian was invented in Canada.' },
          { id: 'y2', side: 0,
            full: 'Millions of people order it every week. A dish that popular is not a mistake, it is a taste you do not share.',
            brief: 'Millions order it. That is a taste, not a mistake.',
            reply: 'Millions also order it with a stuffed crust. Popular is not the same as right.' },
          { id: 'y3', side: 0,
            full: 'Pizza was street food for the poor and took whatever was cheap. The rules about it are a hundred years younger than pizza.',
            brief: 'Pizza took whatever was cheap. The rules came later.',
            reply: 'The rules came from people who have eaten a lot more pizza than you.' },
          { id: 'n1', side: 1,
            full: 'Hot fruit leaks. A slice of pineapple turns the crust underneath it into warm wet bread.',
            brief: 'Hot pineapple turns the crust to warm wet bread.',
            reply: 'So does a tomato, and nobody complains about tomato.' },
          { id: 'n2', side: 1,
            full: 'A pizza is a savoury thing. Fruit on it is a dessert that wandered onto the wrong plate.',
            brief: 'Pizza is savoury. Fruit on it is dessert on the wrong plate.',
            reply: 'Tomato is a fruit. Pizza has always been fruit on bread.' },
          { id: 'n3', side: 1,
            full: 'If a pizza needs pineapple to be interesting, the pizza was bad. Fix the pizza.',
            brief: 'If it needs pineapple, the pizza was bad.',
            reply: 'Or the pizza was fine and you are scared of a new flavour.' }
        ]
      },
      {
        slug: 'seasons', question: 'Summer or winter?', budget: 6, min: 4,
        sides: [
          { name: 'Summer', side: 'the summer side', says: 'The summer side says', stance: 'Summer', of: 'summer' },
          { name: 'Winter', side: 'the winter side', says: 'The winter side says', stance: 'Winter', of: 'winter' }
        ],
        reasons: [
          { id: 'm1', side: 0,
            full: 'Light until ten at night, doors open, nobody needs a coat. Summer is the only season that gives you more day.',
            brief: 'Summer gives you more day.',
            reply: 'More day to sweat through. Nobody sleeps in July.' },
          { id: 'm2', side: 0,
            full: 'The sea, the park, the garden, the bike: everything you would actually like to do is outside, and outside only opens in summer.',
            brief: 'Everything worth doing is outside, and outside opens in summer.',
            reply: 'Skiing, sledging and snow are outside, and they only open in winter.' },
          { id: 'm3', side: 0,
            full: 'Holidays. Six weeks of them. Winter gets a fortnight and a cold.',
            brief: 'Six weeks of holidays. Winter gets a fortnight.',
            reply: 'A fortnight with presents, lights and food beats six weeks of being bored by August.' },
          { id: 't1', side: 1,
            full: 'Cold is a problem you can solve with a jumper. Heat is a problem you can only complain about.',
            brief: 'Cold has a cure, a jumper. Heat has none.',
            reply: 'The cure for heat is a swim, and it is a lot more fun than a jumper.' },
          { id: 't2', side: 1,
            full: 'Snow turns an ordinary street into a place you would pay to visit. Nothing in summer does that to a street.',
            brief: 'Snow turns a street into somewhere you would pay to visit.',
            reply: 'For a morning. Then it is grey slush for a fortnight.' },
          { id: 't3', side: 1,
            full: 'Winter has the fire, the blanket, the long film, and the dark at four that makes being indoors a pleasure instead of a waste.',
            brief: 'Winter makes being indoors a pleasure, not a waste.',
            reply: 'That is a description of being trapped, with nice lighting.' }
        ]
      }
    ],
    [ // round 3: the uneven quarrel, four points against two, ten lines (homework, office, votes) (homework, office, votes)
      {
        slug: 'homework', question: 'Should homework be scrapped?', budget: 10, min: 6,
        sides: [
          { name: 'Scrap', side: 'the scrap side', says: 'The scrap side says', stance: 'Scrap it', of: 'scrapping it' },
          { name: 'Keep', side: 'the keep side', says: 'The keep side says', stance: 'Keep it', of: 'keeping it' }
        ],
        reasons: [
          { id: 's1', side: 0,
            full: 'School already takes seven hours. Homework takes the evening too, and nobody else works a double shift at twelve.',
            brief: 'Seven hours of school, then an evening shift. Nobody else works that.',
            reply: 'Half an hour a night is not a shift. It is practice.' },
          { id: 's2', side: 0,
            full: 'Homework rewards the kids with a quiet room and a parent who can help. The rest fall further behind every night.',
            brief: 'Homework rewards a quiet room and a parent who can help.',
            reply: 'So does everything. Homework at least gives the rest a chance to catch up.' },
          { id: 's3', side: 0,
            full: 'The studies agree: in primary school homework does nothing for results, and in secondary school very little.',
            brief: 'The studies find it does little or nothing for results.',
            reply: 'Results are not the point. Doing a thing alone, without a teacher, is.' },
          { id: 's4', side: 0,
            full: 'What homework mostly teaches is how to copy it from a friend at one minute to nine.',
            brief: 'It mostly teaches copying from a friend before the bell.',
            reply: 'That is a lesson about the kid, not about homework.' },
          { id: 'k1', side: 1,
            full: 'You cannot learn an instrument, a language or algebra in the lesson alone. The practice between lessons is where it sticks.',
            brief: 'The practice between lessons is where learning sticks.',
            reply: 'Then make the lesson longer and the evening free.' },
          { id: 'k2', side: 1,
            full: 'Nobody at work or university will sit beside you. Homework is the first time you manage your own time, and fail, safely.',
            brief: 'Homework is the first time you manage your own time.',
            reply: 'Failing safely still means failing every night for years.' }
        ]
      },
      {
        slug: 'office', question: 'Back to the office five days a week?', budget: 10, min: 6,
        sides: [
          { name: 'Office', side: 'the office side', says: 'The office side says', stance: 'Back to the office', of: 'the office' },
          { name: 'Home', side: 'the home side', says: 'The home side says', stance: 'Stay home', of: 'home' }
        ],
        reasons: [
          { id: 'o1', side: 0,
            full: 'The ideas that matter are had at the coffee machine and in the corridor, not on a scheduled call. You cannot schedule a chance.',
            brief: 'The good ideas happen in corridors, not on calls.',
            reply: 'Count them. The corridor’s ideas are mostly gossip; the written ones get read.' },
          { id: 'o2', side: 0,
            full: 'New people learn by watching. A twenty-three-year-old on a laptop in a bedsit learns nothing from anyone.',
            brief: 'The young learn by watching, and there is nobody to watch at home.',
            reply: 'Then bring the juniors in and leave the rest. A five-day rule for everyone is a blunt tool.' },
          { id: 'h1', side: 1,
            full: 'Two hours a day on a train are two hours nobody is paid for. Give them back and people are rested, and work no worse.',
            brief: 'The commute is unpaid time; give it back.',
            reply: 'The commute is also where the day begins and ends; without it, work leaks into everything.' },
          { id: 'h2', side: 1,
            full: 'Output went up, not down, when the offices closed. The numbers are in; the complaint is about control.',
            brief: 'Output rose when the offices closed; the complaint is about control.',
            reply: 'Output of the things already set up. Nothing new got started.' },
          { id: 'h3', side: 1,
            full: 'Parents, carers and anyone outside the big city can finally hold a good job. Five days in the office quietly fires them.',
            brief: 'Five days in the office quietly fires parents and carers.',
            reply: 'Or hires them part-time, which was always the honest deal.' },
          { id: 'h4', side: 1,
            full: 'Empty offices still cost rent. The firm that lets people stay home saves on floors and spends it on people.',
            brief: 'Offices are rent; home is free.',
            reply: 'The lease is signed either way; the saving is a slide, not a cheque.' }
        ]
      },
      {
        slug: 'votes', question: 'Should sixteen-year-olds get the vote?', budget: 10, min: 6,
        sides: [
          { name: 'Yes', side: 'the yes side', says: 'The yes side says', stance: 'Yes, at sixteen', of: 'the vote at sixteen' },
          { name: 'No', side: 'the no side', says: 'The no side says', stance: 'No, eighteen', of: 'waiting till eighteen' }
        ],
        reasons: [
          { id: 'v1', side: 0,
            full: 'At sixteen you can work, pay tax and leave home. Being taxed by a government you cannot vote for is the thing a revolution was once fought over.',
            brief: 'At sixteen you can work and pay tax. No vote with it is tax without a say.',
            reply: 'You cannot buy a drink, drive or sign a lease either. Sixteen is a line for some things, not all.' },
          { id: 'v2', side: 0,
            full: 'The laws passed now, on climate, on debt, on schools, land hardest on the people who will live longest with them. They should get a say.',
            brief: 'Today\u2019s laws land hardest on the young. They should get a say.',
            reply: 'By that logic a ten-year-old has the biggest stake of all.' },
          { id: 'v3', side: 0,
            full: 'Where it has been tried, sixteen-year-olds turned out in bigger numbers than eighteen-year-olds, and kept voting afterwards.',
            brief: 'Where it has been tried, sixteen-year-olds turned out, and kept voting.',
            reply: 'They turned out once, with a teacher reminding them. A habit needs more than one election.' },
          { id: 'v4', side: 0,
            full: 'Schools teach politics to sixteen-year-olds and then send them away for two years before they can use any of it.',
            brief: 'School teaches you politics, then makes you wait two years to use it.',
            reply: 'School teaches you the law too, and nobody suggests sixteen-year-old judges.' },
          { id: 'x1', side: 1,
            full: 'Sixteen-year-olds live with their parents, and a vote cast at home is a vote the household casts twice.',
            brief: 'A vote at home is a vote the household casts twice.',
            reply: 'So is a married couple\u2019s. Nobody counts those as one.' },
          { id: 'x2', side: 1,
            full: 'Eighteen is the age at which the state treats you as an adult for everything else. One line is clearer and fairer than a dozen.',
            brief: 'Eighteen is the adult line for everything. One line is fairer than many.',
            reply: 'There is no one line now: you drive at seventeen, marry at sixteen, drink at eighteen.' }
        ]
      }
    ]
  ],

  // Words the game says. Kept here so the calibration check can read them.
  WORDS: {
    ours: 'One of ours.', theirs: 'One of theirs.', cant: 'Can’t tell.',
    nobody: 'No reader could tell.',
    split: 'And they do not agree which way, which is halfway to nobody knowing.'
  }
};

// Every quarrel, flat, for the calibration check.
CONFIG.QUARRELS = CONFIG.POOLS.reduce(function (a, p) { return a.concat(p); }, []);

// ---------- the page ----------

function reasonById(q, id) { for (var i = 0; i < q.reasons.length; i++) if (q.reasons[i].id === id) return q.reasons[i]; return null; }
function speakerOf(q, item) { var r = reasonById(q, item.id); return item.kind === 'reply' ? 1 - r.side : r.side; }
function linesOf(item) { return item.kind === 'reply' ? CONFIG.LINES.reply : CONFIG.LINES[item.form]; }
function textOf(q, item) { var r = reasonById(q, item.id); return item.kind === 'reply' ? r.reply : r[item.form]; }
function pageLines(q, page) { var n = 0; for (var i = 0; i < page.length; i++) n += linesOf(page[i]); return n; }
function indexOnPage(page, id, kind) { for (var i = 0; i < page.length; i++) if (page[i].id === id && page[i].kind === kind) return i; return -1; }
function canPublish(q, page) { return pageLines(q, page) >= q.min && pageLines(q, page) <= q.budget; }

// Puts a reason or a reply on the page, at the end. A reason goes on in full if it fits, in brief if only that fits.
// A reply goes on only if its reason is on the page. Returns {page, note} or {error}.
function addItem(q, page, id, kind) {
  if (indexOnPage(page, id, kind) >= 0) return { error: 'already on the page' };
  var room = q.budget - pageLines(q, page);
  if (kind === 'reply') {
    if (indexOnPage(page, id, 'reason') < 0) return { error: 'put the reason on the page first' };
    if (room < CONFIG.LINES.reply) return { error: 'the page is full' };
    return { page: page.concat([{ id: id, kind: 'reply' }]), note: 'reply' };
  }
  if (room >= CONFIG.LINES.full) return { page: page.concat([{ id: id, kind: 'reason', form: 'full' }]), note: 'full' };
  if (room >= CONFIG.LINES.brief) return { page: page.concat([{ id: id, kind: 'reason', form: 'brief' }]), note: 'brief' };
  return { error: 'the page is full' };
}

// Takes a line off the page. Taking a reason off takes its reply off with it.
function removeItem(q, page, idx) {
  var it = page[idx]; if (!it) return page;
  return page.filter(function (x, i) { return i !== idx && !(it.kind === 'reason' && x.id === it.id && x.kind === 'reply'); });
}

function moveItem(q, page, idx, dir) {
  var j = idx + dir; if (j < 0 || j >= page.length) return page;
  var p = page.slice(); var t = p[idx]; p[idx] = p[j]; p[j] = t; return p;
}

// Full to brief always works; brief to full only if the page has room for the extra line.
function toggleForm(q, page, idx) {
  var it = page[idx]; if (!it || it.kind !== 'reason') return { page: page };
  var p = page.slice();
  if (it.form === 'full') { p[idx] = { id: it.id, kind: 'reason', form: 'brief' }; return { page: p, note: 'brief' }; }
  if (q.budget - pageLines(q, page) < CONFIG.LINES.full - CONFIG.LINES.brief) return { page: page, error: 'no room to say it in full' };
  p[idx] = { id: it.id, kind: 'reason', form: 'full' }; return { page: p, note: 'full' };
}

// ---------- the readers ----------

// Everything a reader could count, for both sides.
function sums(q, page) {
  var lines = [0, 0], leftOut = [0, 0], unanswered = [0, 0], ends = [0, 0];
  for (var i = 0; i < page.length; i++) lines[speakerOf(q, page[i])] += linesOf(page[i]);
  for (var r = 0; r < q.reasons.length; r++) {
    var R = q.reasons[r];
    if (indexOnPage(page, R.id, 'reason') < 0) leftOut[R.side]++;
    else if (indexOnPage(page, R.id, 'reply') < 0) unanswered[R.side]++;
  }
  if (page.length) { ends[speakerOf(q, page[0])]++; ends[speakerOf(q, page[page.length - 1])]++; }
  return { lines: lines, leftOut: leftOut, unanswered: unanswered, ends: ends };
}

// Each rule's lean: positive means side 0 comes off better, negative side 1, zero neither.
function leans(s) {
  return {
    lines: s.lines[0] - s.lines[1],
    leftout: s.leftOut[1] - s.leftOut[0],           // a side is favoured by the other side's points being left out
    unanswered: s.unanswered[0] - s.unanswered[1],  // and by its own points standing with no answer
    ends: s.ends[0] - s.ends[1]
  };
}

function placedBy(lean) { return lean > 0 ? 0 : lean < 0 ? 1 : null; }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

// The six readers' readings of a page: for each, the side he places the writer with (or null), and his sentence.
function readPage(q, page) {
  var s = sums(q, page), L = leans(s), readers = [], A = q.sides[0].name, B = q.sides[1].name;
  for (var k = 0; k < CONFIG.READERS.length; k++) {
    var rule = CONFIG.READERS[k], lean = L[rule.key], placed = placedBy(lean), sum;
    if (rule.key === 'lines') sum = A + ' speaks ' + plural(s.lines[0], 'line') + ', ' + B + ' ' + s.lines[1] + '.';
    else if (rule.key === 'leftout') sum = 'Left out: ' + A + ' ' + s.leftOut[0] + ', ' + B + ' ' + s.leftOut[1] + '.';
    else if (rule.key === 'unanswered') sum = 'Unanswered: ' + A + ' ' + s.unanswered[0] + ', ' + B + ' ' + s.unanswered[1] + '.';
    else sum = page.length ? 'First word ' + q.sides[speakerOf(q, page[0])].name + ', last word ' + q.sides[speakerOf(q, page[page.length - 1])].name + '.' : 'An empty page.';
    for (var side = 0; side < 2; side++) {
      var call = placed === null ? CONFIG.WORDS.cant : placed === side ? CONFIG.WORDS.ours : CONFIG.WORDS.theirs;
      readers.push({ side: side, key: rule.key, label: rule.label, placed: placed, lean: lean, sum: sum, call: call, text: sum + ' ' + call });
    }
  }
  var n = 0, dirs = {};
  for (var i = 0; i < readers.length; i++) if (readers[i].placed !== null) { n++; dirs[readers[i].placed] = true; }
  var direction = n === 0 ? null : (dirs[0] && dirs[1]) ? 'split' : dirs[0] ? 0 : 1;
  var caught = []; for (var j = 0; j < CONFIG.READERS.length; j++) if (L[CONFIG.READERS[j].key] !== 0) caught.push(CONFIG.READERS[j].key);
  return { sums: s, leans: L, readers: readers, couldTell: n, direction: direction, caught: caught, statement: statement(q, n, direction) };
}

// What the game says, in its own voice, when the placards are up.
function statement(q, n, direction) {
  if (n === 0) return CONFIG.WORDS.nobody;
  var head = (n === 8 ? 'All eight' : n + ' of 8') + ' could tell.';
  if (direction === 'split') return head + ' ' + CONFIG.WORDS.split;
  return head + ' Your page leaned to ' + q.sides[direction].of + '.';
}

// ---------- the game ----------

// A game is three quarrels, one from each round's pool, all three picked by the player on the first screen (no defaults:
// the author's call, 25 Nov 2026); the game starts only when all three are picked, and nothing can be swapped after.
function newGame() {
  return { q: 0, draw: [null, null, null], stage: 'choose', stance: [null, null, null], page: [], results: [null, null, null], done: false };
}
function choose(game, round, idx) { if (game.stage !== 'choose' || !CONFIG.POOLS[round] || !CONFIG.POOLS[round][idx]) return game; game.draw[round] = idx; return game; }
function canStart(game) { return game.stage === 'choose' && game.draw.every(function (d) { return d !== null; }); }
function start(game) { if (!canStart(game)) return game; game.stage = 'stance'; return game; }
function quarrel(game) { return CONFIG.POOLS[game.q][game.draw[game.q]]; }
function gameQuarrels(game) { return CONFIG.POOLS.map(function (pool, i) { return pool[game.draw[i]]; }); }
function setStance(game, side) { if (game.stage !== 'stance') return game; game.stance[game.q] = side; game.stage = 'write'; game.page = []; return game; }

// Publishing reads the page and records the reading. One page a quarrel: once read, it is final (no revision; the author's call, 24 Nov 2026).
function publish(game) {
  var q = quarrel(game); if (game.stage !== 'write' || !canPublish(q, game.page)) return null;
  var r = readPage(q, game.page); r.page = game.page.slice();
  game.results[game.q] = r;
  game.stage = 'read';
  return r;
}
function next(game) {
  if (game.stage !== 'read') return game;
  if (game.q === CONFIG.POOLS.length - 1) { game.done = true; game.stage = 'end'; return game; }
  game.q++; game.stage = 'stance'; game.page = []; return game;
}

function numberWord(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] || String(n); }
function ruleWords(keys) {
  var w = { lines: 'the line count', leftout: 'what you left out', unanswered: 'what went unanswered', ends: 'the first word and the last' };
  var out = keys.map(function (k) { return w[k]; });
  return out.length <= 1 ? out.join('') : out.slice(0, -1).join(', ') + ' and ' + out[out.length - 1];
}

// The verdict: headline in words, one line per quarrel, and where the player really stood.
function verdict(game) {
  var Q = gameQuarrels(game), clean = 0, quarrels = [], stood = [];
  for (var i = 0; i < Q.length; i++) {
    var f = game.results[i], q = Q[i];
    if (f.couldTell === 0) clean++;
    var line = q.question + ' ';
    if (f.couldTell === 0) line += 'Your page gave the readers nothing: no reader could tell.';
    else line += 'Your page was placed by ' + numberWord(f.couldTell) + ' (' + ruleWords(f.caught) + ')' + (f.direction === 'split' ? ', and they disagreed which way' : ', with ' + q.sides[f.direction].of) + '.';
    quarrels.push(line);
    var st = game.stance[i], dir = f.direction, s;
    if (st === null) s = dir === null ? 'You declared no view, and the readers found none.' : dir === 'split' ? 'You declared no view; the readers quarrelled over you anyway.' : 'You declared no view; the readers put you with ' + q.sides[dir].of + '.';
    else if (dir === null) s = 'You are for ' + q.sides[st].of + '. Nobody could tell.';
    else if (dir === 'split') s = 'You are for ' + q.sides[st].of + '. The readers quarrelled over you, and none of them knew.';
    else if (dir === st) s = 'You are for ' + q.sides[st].of + ', and the readers found you out.';
    else s = 'You are for ' + q.sides[st].of + ', and the readers put you with ' + q.sides[dir].of + '. Bending over backwards is the other way of leaning.';
    stood.push(s);
  }
  var head = clean === Q.length ? 'No reader could tell. Twenty-four partisans read you, and not one could place you.'
    : clean === 0 ? 'The readers could tell every time.'
    : 'The readers could tell in ' + numberWord(Q.length - clean) + ' of your three quarrels.';
  return { headline: head, clean: clean, quarrels: quarrels, stood: stood };
}

// ---------- for the calibration check: every page, and the obvious ways of playing ----------

// Enumerates every page shape (which reasons, in which form, with or without their reply) within the budget and the
// minimum, and for each the ends a player could arrange. Order beyond the ends changes no reader's count.
function enumeratePages(q) {
  var out = [], n = q.reasons.length;
  function rec(i, items) {
    if (i === n) {
      var lines = pageLines(q, items); if (lines < q.min || lines > q.budget) return;
      var spk = [0, 0]; for (var k = 0; k < items.length; k++) spk[speakerOf(q, items[k])]++;
      var endsOptions = [];
      if (items.length === 1) endsOptions.push([spk[0] ? 0 : 1, spk[0] ? 0 : 1]);
      else { if (spk[0] >= 2) endsOptions.push([0, 0]); if (spk[1] >= 2) endsOptions.push([1, 1]); if (spk[0] && spk[1]) { endsOptions.push([0, 1]); endsOptions.push([1, 0]); } }
      for (var e = 0; e < endsOptions.length; e++) {
        var page = arrange(q, items, endsOptions[e][0], endsOptions[e][1]);
        out.push({ page: page, reading: readPage(q, page) });
      }
      return;
    }
    var R = q.reasons[i];
    rec(i + 1, items);
    ['brief', 'full'].forEach(function (form) {
      rec(i + 1, items.concat([{ id: R.id, kind: 'reason', form: form }]));
      rec(i + 1, items.concat([{ id: R.id, kind: 'reason', form: form }, { id: R.id, kind: 'reply' }]));
    });
  }
  rec(0, []);
  return out;
}

// Orders a set of items so that the first line is spoken by `first` and the last by `last`, if possible.
function arrange(q, items, first, last) {
  var rest = items.slice(), f = null, l = null;
  for (var i = 0; i < rest.length; i++) if (speakerOf(q, rest[i]) === first) { f = rest.splice(i, 1)[0]; break; }
  for (var j = rest.length - 1; j >= 0; j--) if (speakerOf(q, rest[j]) === last) { l = rest.splice(j, 1)[0]; break; }
  var page = []; if (f) page.push(f); page = page.concat(rest); if (l) page.push(l); return page;
}

// The obvious ways of playing (build.md §3), each a function from a quarrel to a page.
var HEURISTICS = {
  // The partisan for side S: own reasons in full first, own replies to the other side's reasons, the other side in brief, their replies dropped first.
  partisan: function (q, S) {
    var page = [], T = 1 - S, i;
    var own = q.reasons.filter(function (r) { return r.side === S; }), other = q.reasons.filter(function (r) { return r.side === T; });
    for (i = 0; i < own.length; i++) { var a = addItem(q, page, own[i].id, 'reason'); if (a.page) page = a.page; }
    for (i = 0; i < other.length; i++) { var b = addItem(q, page, other[i].id, 'reason'); if (b.page) { page = b.page; var k = page.length - 1; if (page[k].form === 'full') page = toggleForm(q, page, k).page; var c = addItem(q, page, other[i].id, 'reply'); if (c.page) page = c.page; } }
    return page;
  },
  // The stranger's first draft, a wall of reasons: reasons alternate sides in full as long as they fit, then replies if any fit.
  alternate: function (q) {
    var page = [], a = q.reasons.filter(function (r) { return r.side === 0; }), b = q.reasons.filter(function (r) { return r.side === 1; }), i;
    for (i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) { var x = addItem(q, page, a[i].id, 'reason'); if (x.page) page = x.page; } if (b[i]) { var y = addItem(q, page, b[i].id, 'reason'); if (y.page) page = y.page; } }
    for (i = 0; i < page.length; i++) if (page[i].kind === 'reason') { var z = addItem(q, page, page[i].id, 'reply'); if (z.page) page = z.page; }
    return page;
  },
  // The completist: every reason in brief, then every reply that fits, in the quarrel's order.
  completist: function (q) {
    var page = [], i;
    for (i = 0; i < q.reasons.length; i++) { var x = addItem(q, page, q.reasons[i].id, 'reason'); if (x.page) { page = x.page; var k = page.length - 1; if (page[k].form === 'full') page = toggleForm(q, page, k).page; } }
    for (i = 0; i < q.reasons.length; i++) { var y = addItem(q, page, q.reasons[i].id, 'reply'); if (y.page) page = y.page; }
    return page;
  },
  // The mirror: the same number of reasons a side, each with its reply, as many as fit, reasons first and replies after so the ends split.
  mirror: function (q) {
    var a = q.reasons.filter(function (r) { return r.side === 0; }), b = q.reasons.filter(function (r) { return r.side === 1; });
    var best = [];
    for (var k = Math.min(a.length, b.length); k >= 1; k--) {
      for (var fulls = k; fulls >= 0; fulls--) {
        var items = [], i;
        for (i = 0; i < k; i++) { items.push({ id: a[i].id, kind: 'reason', form: i < fulls ? 'full' : 'brief' }); items.push({ id: b[i].id, kind: 'reason', form: i < fulls ? 'full' : 'brief' }); }
        for (i = 0; i < k; i++) { items.push({ id: b[i].id, kind: 'reply' }); items.push({ id: a[i].id, kind: 'reply' }); } // the reply to b is spoken by side 0, so the last line is side 1's
        if (pageLines(q, items) <= q.budget && pageLines(q, items) >= q.min) return items;
      }
    }
    return best;
  },
  // The over-corrector for side S: the other side's reasons in full, own reasons in brief, own reasons' replies in, the other side's replies dropped first.
  overcorrect: function (q, S) { return HEURISTICS.partisan(q, 1 - S); }
};

if (typeof module !== 'undefined') module.exports = {
  CONFIG: CONFIG, reasonById: reasonById, speakerOf: speakerOf, linesOf: linesOf, textOf: textOf, pageLines: pageLines, indexOnPage: indexOnPage,
  canPublish: canPublish, addItem: addItem, removeItem: removeItem, moveItem: moveItem, toggleForm: toggleForm, sums: sums, leans: leans,
  readPage: readPage, statement: statement, newGame: newGame, choose: choose, canStart: canStart, start: start, quarrel: quarrel, gameQuarrels: gameQuarrels, setStance: setStance, publish: publish,
  next: next, verdict: verdict, enumeratePages: enumeratePages, arrange: arrange, HEURISTICS: HEURISTICS, numberWord: numberWord
};
