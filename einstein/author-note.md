**Revised five times after first review.** The game now marries the paper to a merchant's balance sheet: paid on the station clock (synchronised by §1), flowers alive or dead by the rocket's clock (§4), fuel by §10, and a discount rate chosen at the start. See memo §24; every price and rate is tagged in `mechanism.js`.



# The Light Post — note for the author

1. Look first at `screenshot-range-2.png` (the "two halves" test shot: the beam lands at 4 years, the rocket at 5, the flowers' clock at 3), then `screenshot-end-first.png` and `screenshot-haul-end.png` for the verdicts.
2. Every number is in the `CONFIG` block at the top of `mechanism.js`, the only copy of the mechanism: c, the booster size w = c/2 (our choice), the test order, the two order books and the long haul, each tagged with its source (§1, §4, §5, page numbers of the Fourmilab PDF) or "our choice". Edit, run `node calibration.js` (32 checks against the paper's equations), then `python3 build.py`, which refuses to finish if the embedded mechanism differs from the file.
3. What we were least sure about: (a) the flowers ageing by their own clock extends the paper's moving clock to a living thing; the paper speaks only of clocks, and the game says so; (b) the relativity of simultaneity, the paper's conceptual core, is not played; the runner-up design in the memo (The Timekeeper) plays it, if you prefer; (c) the order book asks for rough mental arithmetic (time ÷ slowing factor); strangers may find it a step too far, which only real players can tell.

This game has had the builder's review only: screenshots and a scripted browser session at 380 px. It has not been played by real strangers, and the 5–7 minute length is an estimate. The equations were read from a typeset transcription (the 1923 translation as edited by J. Walker), not from a scan.