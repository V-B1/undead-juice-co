# Undead Juice Co.: Game Design Document

This is the source of truth for **what** the game is. `ARCHITECTURE.md` covers **how** it's built. Numbers here are starting values. They go into `src/data/` as written, and the lead tunes them later.

---

## 1. Pitch

A landscape side-scroller for phones. You're **Dex**, a jetpack-wearing entrepreneur, and with your drone **Bolt** you hunt zombies across swamps, ghost towns, frozen peaks, and a toxic plant. You lure them out of the ground with brain bait, harpoon them with balloon darts until they float away, and let Bolt vacuum them up. Back at base you squeeze them into juice, candy, slushies, and snacks, sell the products, upgrade your gear, and push into tougher areas.

Sessions are short (a hunt takes 2 to 4 minutes) and the loop is idle-friendly (factories keep running while you're away).

## 2. Kept from the original vs. new

The core loop and feel come from *Zombie Catchers*: bait out buried zombies, harpoon them with balloons, drone pickup, jetpack, traps, zombie types with distinct escape tricks, a factory that turns zombies into drinks, mixed recipes on better machines, upgrades, new areas, and night hunts. **All names, characters, and art are original.**

| Area | Original | Ours |
|---|---|---|
| Hunting limits | Area cooldowns and wait timers | **Hunt as much as you like.** The limit is storage space, which pushes you into the factory. |
| Monetization | IAP, premium currency gates | **None.** Plutonium is earned through play. |
| New | | Combo chains, power-up crates, gadgets (net, tranq, goo), boss hunts, Orders Board, Zombie Almanac with mastery bonuses, daily missions and login streak, achievements, skins, aim assist, left-handed layout, save export and import, offline play (PWA) |

## 3. Characters and tone

- **Dex**: the hero. Orange jumpsuit, goggles, blue jetpack, harpoon gun. Upbeat and a little greedy.
- **Bolt**: a round teal drone with one big eye and a suction nozzle. It does the radar scans, flies in to grab lifted zombies, and talks you through the tutorial and story missions in speech bubbles.
- **Zombies**: goofy rather than scary. They have googly eyes, stitched mouths, and silly accessories. Nothing gory: catching is harmless, the zombies just float away on balloons.
- Tone: Saturday-morning cartoon. Short punchy text. Every catch should feel satisfying (pop, wobble, whoosh, coins).

## 4. Core loop

```
WORLD MAP ──pick area/mode──▶ LOADOUT ──▶ HUNT ──▶ SUMMARY
    ▲                                       │ catches → Storage (committed live)
    │                                       ▼
 UNLOCK AREAS ◀── UPGRADES ◀── COINS ◀── SELL / ORDERS ◀── FACTORY (timed jobs)
```

1. **Hunt**: catch zombies. They go to **Storage**, which has limited capacity.
2. **Factory**: machines turn zombies into products over real time, including while you're offline.
3. **Sell or fill orders**: products become coins (orders also pay XP and sometimes plutonium).
4. **Workshop**: spend coins on gear and base upgrades.
5. **Progress**: reaching XP levels and coin thresholds unlocks areas, machines, night hunts, and bosses.

## 5. Controls (landscape)

### Touch (default; left-handed mode mirrors the left and right sides)
| Zone / button | Action |
|---|---|
| Left 40% of the screen | **Floating joystick**: it appears wherever the thumb lands. X moves left and right. Pushing up past 45% fires the **jetpack**. |
| Right 45% of the screen | **Aim stick**: drag to aim (a dotted trajectory preview shows), release to **fire** the harpoon. A quick tap with no drag fires at the nearest visible zombie when aim assist is on, otherwise straight ahead. |
| Bait button (above the aim zone) | Throw brain bait (count shown). It goes in the aim direction if aiming, otherwise forward at 40°. Long-press to choose glow or golden bait when you have them. |
| Trap button | Drop a trap at Dex's feet (only when grounded). |
| Gadget button | Use the equipped gadget (charges shown). Hidden if none is equipped. |
| Pause (top-left), Return flag (top-right) | Pause menu; end the hunt (with a confirm). |

### Keyboard and mouse (desktop testing)
A/D or ←/→ move · W, ↑ or Space jetpack · the mouse aims and click fires · E bait · Q trap · G gadget · Esc pause.

## 6. The hunt

### 6.1 Level
- A horizontal side-scroller. Width depends on the area (§8). The world is 720 tall, with the ground baseline at y ≈ 600.
- The ground is made of flat **segments** at different heights (steps up to 120 px, so the jetpack can always clear them), plus floating **platforms**, area **hazards** (swamp water, ice, toxic puddles), and decorative props. It's generated from a seed each hunt.
- Dex starts at the far left next to the **landing pad**, where Bolt drops him off.
- Three parallax background layers plus a ground layer. Fireflies, leaves, snow, and other area ambience.

### 6.2 Hero movement
| Stat | Base value |
|---|---|
| Run speed | 320 px/s (accel 2400 px/s²) |
| Gravity | 1600 px/s² |
| Jetpack thrust | 2900 px/s² upward, max rise speed 420 px/s |
| Jetpack fuel | 1.5 s at L1 (§12). Refills to full in 1.5 s while grounded, after a 0.3 s delay. |
| In water, toxic puddles, or goo | Speed ×0.6 |
| On ice | Friction ×0.15 (slidey) |
| Ceiling | Dex can't fly above y = 80 |

A small fuel arc shows above Dex's head while the jetpack is in use.

### 6.3 Radar and mounds
- Each zombie in a hunt starts **buried** under a **mound**: a small dirt hump that bubbles and twitches when Dex is within 400 px.
- **Bolt's radar**: buried zombies within `radarRange` (drone upgrade, 500 px at L1) that are off-screen show as **edge arrows** at the side of the screen pointing toward them. Arrows get more opaque as you get closer. Emerged zombies that are off-screen show red arrows. Night-only zombies show purple arrows.

### 6.4 Bait and luring
- Dex throws bait in an arc (650 px/s). Where it lands it becomes a bait pile that lasts **5 s after the first zombie starts eating** (or 8 s if nobody comes).
- Up to **2 buried zombies** whose mound is within **lure radius 240 px** of the pile, and whose `bait` type matches, are lured (nearest first). Each one waits 0.6 to 1.2 s, **emerges** (0.8 s, dirt burst, rising from behind the ground layer), walks to the bait at 60% speed, and **eats** for 3 s.
- Bait types: **brain** (lures day zombies; per-hunt amount from the Bait Bag upgrade), **glow** (lures night-only zombies and day zombies; a consumable bought for 60 coins), **golden** (from crates; lures any zombie within 600 px, up to 5).

### 6.5 Zombie states

```
BURIED ─bait─▶ EMERGING ─▶ SEEK_BAIT ─▶ EATING ─▶ ALERT ─▶ FLEE ─(escapeMs)─▶ BURROWING ─▶ BURIED (at new spot)
                                  any state except BURIED ─(balloons ≥ hp)─▶ LIFTING ─▶ GRABBED ─▶ caught
```
- **EATING**: the zombie ignores Dex unless it's hit. It's the easiest moment to shoot.
- **ALERT**: when eating ends, or the zombie is hit, or Dex comes within `noticeRadius` after eating, a "!" pops for 0.4 s. Then the type's escape behavior kicks in (§7).
- **FLEE**: run away from Dex at full speed, turning at level ends, hopping up steps of 120 px or less. After `escapeMs` (12 s by default) the zombie **burrows** (1 s, still catchable) and becomes a new mound right there. You'll need fresh bait to bring it back up.
- Zombies never hurt themselves or die. There's no gore.

### 6.6 Harpoon and balloons (the catch)
- The **harpoon gun** fires a dart (speed 900 px/s at L1, gravity 600 px/s², max flight 1.2 s) that hits the first non-buried zombie in its path.
- Each hit attaches **balloons** (1 per hit at L1, more with upgrades). Each balloon slows the zombie by 25% (minimum 25% speed) and **pops after 4 s**.
- When **balloons ≥ hp**, the zombie is **LIFTING**: it floats upward at 120 px/s for 1.2 s, kicking its legs, then hovers until Bolt grabs it. Lifting is permanent from then on, and balloons no longer pop.
- **Bolt** flies to lifting zombies one at a time (in queue order, 600 px/s at L1), turns on a suction beam for 0.5 s, and the zombie shrinks into the nozzle: **caught**. Bolt then returns to hover near Dex.
- **Reload**: 1.2 s at L1, shown as a ring around the aim stick base.
- **Aim assist** (on by default): if the aim direction is within 15° of a visible zombie less than 900 px away, it snaps to that zombie and leads its velocity.

### 6.7 Traps
- Placed at Dex's feet on the ground. They arm in 0.8 s. A **ground** zombie (any state except BURIED, EMERGING or flying) that walks over an armed trap is caught instantly: a net springs up and it goes straight to LIFTING. Bosses are immune.
- Per-hunt count comes from the Trap Kit upgrade (1 at L1). A trap is consumed when it triggers.

### 6.8 Hazards and stun
- Thrown projectiles (trash, snowballs), boss slams, and similar arc toward Dex. A hit means a **stun**: Dex can't move or fire for `stunMs` (1000 ms at Armor L1), gets knocked back 150 px, and shows a flashing tint. Snowballs show a frozen look instead.
- Gas clouds slow Dex to 50% while he's inside them. Dex can't die.

### 6.9 Coins, combo, and pickups
- Every catch bursts out `coins × comboMultiplier` coin sprites (shown as 3 to 6 sprites, whatever the value) that **home in on Dex** after 0.6 s. Coins are added to `GameState` at the moment of the catch.
- **Combo**: a catch within **5 s** of the previous one raises the combo by 1. Multiplier = `min(1 + 0.25 × (combo − 1), 3.0)`. It applies to catch coins and catch XP. The HUD shows "COMBO ×N" with a draining bar. The best combo is tracked in stats.
- **Crates** (§14): power-ups.

### 6.10 Ending a hunt
- **All zombies caught**: the "AREA CLEARED!" banner shows, you get +20% of hunt coins as a bonus, and the summary appears after 2 s.
- **Return flag**: confirm, then the summary.
- **Summary panel**: catches grouped by type (with icons), coins earned, combo bonus, XP gained with the level bar, best combo, "NEW!" tags for first-time Almanac entries, mission ticks, and storage status. Buttons: **Base** and **Hunt again** (same area and mode).

### 6.11 Storage overflow
If storage is full when a zombie is caught, it's sold on the spot to a "street vendor" for 50% of the cheapest product it's used in. A toast says "Storage full: sold for N coins". Storage is the brake on hunting and the push toward the factory.

### 6.12 Hunt size
- **Day**: the zombie count comes from the area table (§8), and types are drawn from the area's spawn weights. 15% of slots in areas after Bayou draw from the previous area's day zombies instead.
- **Night**: 6 to 8 zombies. 50% are the area's night-only zombie and the rest are day types with notice radius +30%. Coins and XP are ×1.5.
- Mounds are spaced at least 450 px apart, and none are within 800 px of the start.

## 7. Zombie roster

`hp` = balloons needed. `speed` in px/s. `notice` = notice radius in px. `bait`: B = brain, G = glow. Behaviors are defined in §7.2.

### 7.1 Table

| id | Name | Area | Night | hp | speed | notice | xp | coins | bait | Behaviors | Look |
|---|---|---|---|---|---|---|---|---|---|---|---|
| shambler | Shambler | bayou | | 1 | 70 | 280 | 5 | 3 | B | flee | Green, round body, torn shirt |
| sprinter | Sprinter | bayou | | 1 | 210 | 360 | 8 | 4 | B | flee | Lime, tall and skinny, red sneakers, sweatband |
| mudlurker | Mudlurker | bayou | | 1 | 110 | 300 | 10 | 5 | B | flee (escapeMs 4000) | Brown, mud drips, half-buried look |
| hopper | Hopper | bayou | | 1 | 130 | 300 | 12 | 6 | B | flee, leap | Teal, frog legs, big eyes |
| glowbug | Glowbug | bayou | ✔ | 1 | 150 | 340 | 20 | 10 | G | fly(alt 180, amp 40), flee | Yellow-green glow, bug wings |
| tosser | Junk Tosser | ghost_town | | 1 | 100 | 340 | 15 | 7 | B | flee, throw(trash) | Grey-green, garbage sack |
| bruiser | Bruiser | ghost_town | | 3 | 80 | 300 | 18 | 9 | B | flee | Big purple, armor plates |
| dustrunner | Dust Runner | ghost_town | | 1 | 260 | 380 | 16 | 8 | B | flee, roll | Tan, bandana, rolls like a tumbleweed |
| specter | Specter | ghost_town | | 1 | 140 | 340 | 20 | 10 | B | fly(alt 220, amp 60), flee | Pale blue bedsheet ghost-zombie |
| phantom | Phantom | ghost_town | ✔ | 2 | 120 | 340 | 30 | 15 | G | phase, flee | Dark translucent, glowing eyes |
| skater | Ice Skater | frost_peak | | 1 | 240 | 380 | 20 | 10 | B | slide | Blue, scarf, ice skates |
| snowballer | Snowballer | frost_peak | | 2 | 90 | 340 | 22 | 11 | B | flee, throw(snowball) | White beard, beanie |
| yeti | Yeti Zombie | frost_peak | | 4 | 90 | 320 | 28 | 14 | B | flee, leap | Huge white fur, horns |
| frostwisp | Frost Wisp | frost_peak | | 1 | 160 | 360 | 25 | 12 | B | fly(alt 380, amp 80), flee | Ice-crystal body, floaty tail |
| aurora | Aurora Wraith | frost_peak | ✔ | 2 | 180 | 360 | 40 | 20 | G | fly(alt 260, amp 60), blink, flee | Rainbow shimmer trail |
| splitter | Splitter | toxic_plant | | 2 | 110 | 320 | 30 | 15 | B | flee, split | Green, stitched seam down the middle |
| splitling | Splitling | toxic_plant | (spawned only) | 1 | 200 | 400 | 12 | 6 | n/a | flee | Half a splitter, tiny |
| blinker | Blinker | toxic_plant | | 1 | 140 | 340 | 30 | 15 | B | flee, blink | Purple, antenna |
| bloater | Gas Bloat | toxic_plant | | 2 | 70 | 300 | 28 | 14 | B | flee, gasOnHit | Bloated yellow, gas mask |
| mecha | Mecha-Zom | toxic_plant | | 3 | 100 | 320 | 35 | 18 | B | flee, shieldFront | Metal plates, front shield, one red eye |
| ghoul | Nuke Ghoul | toxic_plant | ✔ | 2 | 230 | 400 | 50 | 25 | G | flee, blink | Neon green, glowing veins |

### 7.2 Behaviors
| Behavior | Params (defaults) | Rules |
|---|---|---|
| flee | escapeMs 12000 | Described in §6.5. |
| leap | cooldownMs 3000, jumpVelocity 650, triggerRadius 220 | When a harpoon dart heading toward it comes within the trigger radius, or Dex does, it jumps away (vy −650, vx away from Dex). Yeti uses cooldown 4000. |
| throw | projectile trash/snowball, cooldownMs 2500 (snowball 3000), range 600 | While fleeing and Dex is within range, it lobs a projectile at Dex's predicted position. A hit stuns (§6.8). |
| fly | altitude, amplitude | No gravity. Hovers at `groundY − altitude` with a sine bob of the given amplitude (2 s period). Comes down to ground level to eat bait, then rises back up when it flees. Immune to traps. |
| roll | none | While fleeing, its hitbox drops to 50% height (harder to hit) and it hops every 1.5 s. |
| phase | visibleMs 1500, hiddenMs 1500 | Alternates between solid and ghosted (alpha 0.25). Darts pass through while it's ghosted. Always solid while eating. |
| slide | accel 300, turnMs 600 | Builds up to top speed and slides on. Turning takes 0.6 s of braking, so it's predictable. |
| blink | everyMs 2500 (aurora 3000, ghoul 4000), distance 300 (ghoul 250) | Shimmers for 0.3 s (the tell), then teleports `distance` away from Dex onto valid ground with a poof. |
| split | into splitling ×2 | If it's hit while balloons < hp, it splits into 2 splitlings that flee in opposite directions. If it's caught whole (enough balloons in one hit, a trap, or a net), it counts as a splitter. |
| gasOnHit | radius 160, slow 0.5, durationMs 3000 | Each hit leaves a green gas cloud that slows Dex inside it. |
| shieldFront | none | Darts that hit from the front (the side it faces, within 60° of horizontal) clang off. Hit it from behind or from above. |

### 7.3 Bosses (one per area)
| id | Name | Area | hp | speed | Behaviors | First catch reward | Repeat reward |
|---|---|---|---|---|---|---|---|
| swamp_king | Swamp King | bayou | 12 | 60 | summon(shambler, every 8000, max 3), shakeOff(every 6000, 2) | 1000 coins, 15 plutonium, unlocks Bayou night | 300 coins, 2 plutonium |
| sheriff_rot | Sheriff Rot | ghost_town | 16 | 90 | barrage(trash ×3, every 5000), shakeOff | 2000, 15, Ghost Town night | 600, 2 |
| frostjaw | Frostjaw | frost_peak | 20 | 80 | slam(every 6000, radius 300: stuns if Dex is grounded), shakeOff | 3000, 15, Frost night | 900, 2 |
| ooze_overlord | Ooze Overlord | toxic_plant | 24 | 70 | summon(splitling, every 7000, max 4), gasTrail(every 1500), shakeOff | 4000, 20, Toxic night | 1200, 3 |

Boss rules: bosses are about 2.5× normal size. Balloons on a boss **don't time out**, but the boss shakes off 2 every 6 s. Bosses are immune to traps and nets. A boss bar at the top of the HUD shows balloons against hp. A boss hunt is a 2-screen arena. The boss bursts up after Dex throws the first bait. Bosses aren't stored. They become trophies in the Almanac. **A boss hunt unlocks after 25 catches in that area.**

## 8. Areas

| id | Name | Unlock | Width | Day zombies | Spawn weights | Hazard | Machine unlocked |
|---|---|---|---|---|---|---|---|
| bayou | Bayou Swamp | start | 5200 | 6–8 | shambler 40, sprinter 25, mudlurker 20, hopper 15 | water pools | Juicer (owned) |
| ghost_town | Ghost Town | 2,500 coins + level 5 | 5600 | 7–9 | tosser 30, bruiser 20, dustrunner 25, specter 25 | none (rooftop platforms) | Candy Press |
| frost_peak | Frost Peak | 12,000 coins + level 10 | 6000 | 7–9 | skater 30, snowballer 25, yeti 20, frostwisp 25 | ice patches | Slush Blender |
| toxic_plant | Toxic Plant | 45,000 coins + level 15 | 6400 | 8–10 | splitter 30, blinker 25, bloater 25, mecha 20 | toxic puddles | Snack Lab |

**Look and palettes** (outline color everywhere: `#1f1430`):
- **Bayou Swamp**: dusk sky `#2b1d4f`→`#e0794f`. Far trees `#3b2a5a`, mid mangroves `#2e5a4a`, grass top `#6bbf59`, dirt `#5a3b2e`, water `#3a8f8a`. Fireflies, hanging moss, lily pads, floating log platforms.
- **Ghost Town**: sunset `#f2b56b`→`#c0533d`. Saloon silhouettes `#6b4a3a`, sand `#d8a066`, boardwalk planks `#8a5a3c`. Tumbleweeds, water tower, cacti, rooftop platforms.
- **Frost Peak**: sky `#9fd3f5`→`#e6f4ff`. Mountains `#6f8fb8`, snow `#f4fbff`, ice `#9fe3ff`. Falling snow, pine trees, icicle ledges.
- **Toxic Plant**: sky `#1c2b2a`→`#3d5a3a`. Smokestacks `#4b5563`, metal `#8a94a6`, toxic `#9cff3a`. Pipes, catwalk platforms, warning stripes, drifting bubbles.

**World map**: four nodes along a winding path. Each node shows its lock state and requirements, along with **Day**, **Night** (locked until the boss is caught; needs 1 glow bait), and **Boss** (locked until 25 catches) buttons.

## 9. Night hunts
- Same layout generator as day. The screen is darkened (a night overlay) with a radial light around Dex. Bait piles, glowing zombies, and coins carry small lights of their own.
- Composition is in §6.12. Night-only zombies are lured only by glow or golden bait.
- Unlocked per area by catching that area's boss. Starting one requires at least 1 glow bait (you can buy it on the Loadout screen).

## 10. Base, factory and selling

### 10.1 Base screen
A side-view yard (1600 px wide, drag to pan when the screen is narrower), with tappable buildings left to right: **Landing Pad** (Bolt; opens the World Map), **Storage Silo**, **Factory** (machines appear as you unlock them; a "ready" bubble floats over finished jobs), **Workshop** garage, **Orders Board**, and **Almanac** (a book on a crate). There's a **top bar** (coins, plutonium, level and XP bar, storage `n/cap`) and a **bottom dock** (Hunt, Factory, Workshop, Orders, Almanac, Missions, Settings) that opens the same panels.

### 10.2 Storage
- Holds caught zombies by type. Capacity: 15 at L1 (§12).
- The **Warehouse** tab lists products with stock and price, plus **Sell 1** and **Sell all** buttons. There's no warehouse limit for products.

### 10.3 Machines
| id | Name | Requirement | Cost | Extra slot costs (2nd, 3rd) |
|---|---|---|---|---|
| juicer | Juicer | start (owned, 1 slot) | 0 | 800, 3,000 |
| candy_press | Candy Press | Ghost Town unlocked | 3,000 | 4,000, 12,000 |
| slush_blender | Slush Blender | Frost Peak unlocked | 15,000 | 18,000, 50,000 |
| snack_lab | Snack Lab | Toxic Plant unlocked | 50,000 | 60,000, 150,000 |

Each slot runs one job at a time. Starting a job **takes the input zombies out of storage**. A finished job waits in its slot with a "ready" bubble. Tap to **collect** it into the warehouse (there's also a **Collect all** button). Jobs keep progressing offline. **Speed up**: costs `ceil(remaining minutes)` plutonium, minimum 1.

### 10.4 Products (one recipe per product)
| id | Name | Machine | Inputs | Out | Time | Price |
|---|---|---|---|---|---|---|
| swamp_juice | Swamp Juice | juicer | shambler | 1 | 20s | 25 |
| zippy_juice | Zippy Juice | juicer | sprinter | 1 | 30s | 45 |
| mud_shake | Mud Shake | juicer | mudlurker | 1 | 40s | 60 |
| hop_soda | Hop Soda | juicer | hopper | 1 | 45s | 70 |
| glow_juice | Glow Juice | juicer | glowbug | 2 | 60s | 110 |
| trash_punch | Trash Punch | juicer | tosser | 1 | 50s | 90 |
| dust_tonic | Dust Tonic | juicer | dustrunner | 1 | 50s | 100 |
| brute_brew | Brute Brew | juicer | bruiser | 2 | 90s | 110 |
| specter_spritz | Specter Spritz | juicer | specter | 1 | 60s | 120 |
| swamp_gummies | Swamp Gummies | candy_press | shambler ×2, sprinter | 3 | 120s | 70 |
| hop_drops | Hop Drops | candy_press | hopper, mudlurker | 2 | 120s | 110 |
| junk_jawbreaker | Junk Jawbreaker | candy_press | tosser, shambler | 2 | 150s | 105 |
| ghost_taffy | Ghost Taffy | candy_press | specter, dustrunner | 2 | 180s | 170 |
| brute_bonbons | Brute Bonbons | candy_press | bruiser, hopper | 3 | 240s | 130 |
| phantom_fudge | Phantom Fudge | candy_press | phantom, specter | 3 | 300s | 260 |
| skater_slush | Skater Slush | slush_blender | skater | 1 | 90s | 160 |
| snowball_cone | Snowball Cone | slush_blender | snowballer | 2 | 120s | 110 |
| yeti_float | Yeti Float | slush_blender | yeti | 3 | 180s | 150 |
| wisp_whip | Wisp Whip | slush_blender | frostwisp, specter | 2 | 180s | 230 |
| blizzard_blend | Blizzard Blend | slush_blender | skater, sprinter ×2 | 3 | 240s | 150 |
| aurora_ice | Aurora Ice | slush_blender | aurora | 3 | 300s | 300 |
| splitter_chips | Splitter Chips | snack_lab | splitter | 2 | 120s | 200 |
| splitling_bites | Splitling Bites | snack_lab | splitling ×2 | 1 | 60s | 220 |
| blink_bar | Blink Bar | snack_lab | blinker | 2 | 150s | 210 |
| bloat_burger | Bloat Burger | snack_lab | bloater, bruiser | 3 | 240s | 230 |
| mecha_munch | Mecha Munch | snack_lab | mecha, yeti | 3 | 300s | 300 |
| ghoul_glowpops | Ghoul Glowpops | snack_lab | ghoul, glowbug | 4 | 360s | 320 |

Every product gives **1 XP per unit** when it's collected. Product icon shapes: juicer makes bottles, candy press makes wrapped candy, slush blender makes cups with straws, snack lab makes bags and burgers. Each product is tinted with its main zombie's skin color.

### 10.5 Orders Board (new)
- 3 order slots. Each order asks for 1 to 3 product lines with quantities of 2 to 6, drawn only from products whose machine you own.
- Reward: coins = `niceRound(Σ price × qty × 1.5)`, XP = `Σ qty × 3`, and a 25% chance of +1 to 3 plutonium.
- **Fulfill** removes the products and pays out. **Decline** is free. After either, the slot refills **10 minutes** later (real time). **Refresh all now** costs 2 plutonium.
- Generated with a seeded RNG so tests are deterministic.

## 11. Currencies and starting state
- **Coins**: the main currency.
- **Plutonium**: the rare currency, earned only. Sources: missions, achievements, bosses, login streak, orders, every 5th level. Sinks: production speed-ups, order refresh, skins.
- **Start**: 150 coins, 10 plutonium, level 1, Juicer with 1 slot, every upgrade at L1, 0 glow bait.

## 12. Workshop upgrades

Cost to reach level L (L ≥ 2) = `niceRound(baseCost × growth^(L − 2))`.
`niceRound(x)`: below 100, round to 5; below 1,000, round to 10; below 10,000, round to 50; otherwise round to 100.

| id | Name | Max | baseCost | growth | Effect by level L |
|---|---|---|---|---|---|
| harpoon | Harpoon Gun | 10 | 150 | 1.7 | reloadMs = 1200 − 80(L−1); dartSpeed = 900 + 60(L−1); balloonsPerHit = 1 (L1–4), 2 (L5–8), 3 (L9–10) |
| jetpack | Jetpack | 10 | 120 | 1.65 | fuelMs = 1500 + 400(L−1); thrust = 2900 + 60(L−1) |
| armor | Armor | 5 | 300 | 2.0 | stunMs = 1000 − 175(L−1) |
| bait_bag | Bait Bag | 6 | 100 | 1.8 | brain bait per hunt = [3, 4, 5, 6, 8, 10][L−1] |
| trap_kit | Trap Kit | 5 | 200 | 1.9 | traps per hunt = L |
| drone | Bolt Drone | 5 | 250 | 1.8 | radarRange = 500 + 150(L−1); droneSpeed = 600 + 100(L−1) |
| storage | Storage Silo | 10 | 200 | 1.5 | capacity = 15 + 12(L−1) |

Machines and machine slots are bought from the Factory panel (§10.3). Gadgets and skins are in Workshop tabs (§13, §16).

## 13. Gadgets (new)
Bought once with coins and gated by level. You pick **one per hunt** on the Loadout screen, and charges refill every hunt.
| id | Name | Level | Cost | Charges | Effect |
|---|---|---|---|---|---|
| tranq_dart | Tranq Darts | 3 | 800 | 5 | Fast straight dart. The target moves 70% slower and can't leap or blink for 5 s. |
| sticky_goo | Sticky Goo | 6 | 1,500 | 3 | Thrown like bait. Leaves a 220 px puddle for 8 s. Ground zombies inside are stuck (speed 0, no leap). Dex is slowed in it. |
| net_launcher | Net Launcher | 8 | 2,000 | 2 | A 320 px cone, 45° wide, in the aim direction. Non-boss zombies with hp ≤ 2 inside are caught instantly (including flyers). Heavier ones get +2 balloons. |

## 14. Power-up crates (new)
Every 60 to 90 s during a hunt (day or night, not boss), Bolt airdrops a crate 400 to 800 px ahead of Dex, with only one on the map at a time. Touch it or shoot it to open.
| Power-up | Weight | Effect |
|---|---|---|
| Double Coins | 30 | Catch coins ×2 for 15 s |
| Slow-Mo | 25 | All zombies move at 50% speed for 6 s (and the screen gets a blue tint) |
| Rapid Fire | 25 | Reload ×0.3 for 8 s |
| Golden Bait | 20 | +1 golden bait (§6.4) |

## 15. Progression

### 15.1 XP and levels
- XP comes from catches (`xp × combo multiplier`, ×1.5 at night), product collection, and orders.
- XP needed to go from level n to n+1 = `round(40 × n^1.5)`. There's no level cap (balance targets go up to about 25).
- Every level-up gives `50 × newLevel` coins and shows a modal. Every 5th level also gives +5 plutonium.

### 15.2 Story missions (one active at a time, shown by Bolt)
| # | Mission | Reward |
|---|---|---|
| 1 | Catch 3 Shamblers | 100 coins |
| 2 | Make 2 Swamp Juice | 100 |
| 3 | Sell 2 products | 50 + 2 plu |
| 4 | Upgrade the Harpoon Gun to L2 | 150 |
| 5 | Catch 2 Sprinters | 150 |
| 6 | Catch a zombie with a trap | 200 |
| 7 | Catch 3 Hoppers | 250 |
| 8 | Complete 2 orders | 300 + 3 plu |
| 9 | Reach a ×3 combo | 300 |
| 10 | Upgrade Storage to L2 | 300 |
| 11 | Reach level 5 | 500 |
| 12 | Unlock Ghost Town | 5 plu |
| 13 | Catch 5 Junk Tossers | 600 |
| 14 | Buy the Candy Press | 800 |
| 15 | Make 5 Swamp Gummies | 800 |
| 16 | Catch 3 Bruisers | 900 |
| 17 | Catch the Swamp King | 10 plu |
| 18 | Finish a night hunt | 1,000 |
| 19 | Reach level 10 | 1,500 |
| 20 | Unlock Frost Peak | 10 plu |
| 21 | Catch Sheriff Rot | 2,000 |
| 22 | Catch 5 Frost Wisps | 2,000 |
| 23 | Buy the Slush Blender | 3,000 |
| 24 | Reach level 15 | 5 plu |
| 25 | Unlock Toxic Plant | 10 plu |
| 26 | Catch Frostjaw | 4,000 |
| 27 | Catch a whole Splitter | 3,000 |
| 28 | Buy the Snack Lab | 5,000 |
| 29 | Catch the Ooze Overlord | 20 plu |
| 30 | Complete the Almanac (every zombie type caught) | Golden Dex skin |

Missions count progress **from when they become active**. The exception is "reach / unlock / buy / upgrade to" missions: they check current state, so they complete at once if already true.

### 15.3 Daily missions (new)
- 3 per local calendar day, drawn from a pool and scaled to unlocked content: catch N zombies (N = 10), catch N of a specific unlocked type (4), produce N products (8), sell N products (10), complete N orders (2), reach a combo of ×N (4), catch N with traps (3), play N hunts (3).
- Rewards: the first two give `200 × (unlocked areas)` coins each, and the third gives 3 plutonium. Finishing all 3 opens a bonus chest worth 5 plutonium.

### 15.4 Login streak (new)
A 7-day calendar that loops: 100 coins, 200 coins, 1 plu, 400 coins, 600 coins, 3 plu, 1000 coins + 5 plu. Claiming on consecutive local days moves the streak forward. Missing a day resets it to day 1. It shows as a modal on the first visit each day.

### 15.5 Achievements (new)
| id | Goal | Reward |
|---|---|---|
| first_catch | 1 catch | 2 plu |
| catches_100 / 500 / 2000 | Total catches | 5 / 10 / 20 plu |
| combo_5 / combo_10 | Best combo | 5 / 10 plu |
| products_100 / 1000 | Products collected | 5 / 15 plu |
| orders_25 | Orders completed | 10 plu |
| coins_100k | Lifetime coins earned | 10 plu |
| boss_hunter | All 4 bosses caught | Hazmat skin |
| night_owl | 10 night hunts finished | 10 plu |
| maxed_harpoon | Harpoon Gun L10 | 15 plu |
| trapper | 50 trap catches | 5 plu |

### 15.6 Zombie Almanac (new)
- A page per zombie and boss. Uncaught entries show a silhouette and "???".
- Each page shows the name, a blurb (one funny line), area, day or night, hp, behaviors as icons, and the products that use it.
- **Mastery**: 10 / 50 / 200 catches earns Bronze / Silver / Gold, giving +5% / +10% / +20% sell price **and order coins** on products whose *first* input is that zombie.

## 16. Skins (new, cosmetic only)
| id | Name | How to get |
|---|---|---|
| dex | Classic Dex | default |
| swamp_ranger | Swamp Ranger | 20 plutonium |
| cowpoke | Cowpoke | 30 plutonium |
| arctic | Arctic Dex | 40 plutonium |
| hazmat | Hazmat Dex | achievement *boss_hunter* |
| golden | Golden Dex | story mission 30 |

Skins are palette swaps plus a hat or helmet part on the same rig.

## 17. Settings and accessibility
Sound FX on/off · Music on/off · Haptics on/off (Android only) · **Left-handed controls** · **Aim assist** (default on) · Screen shake on/off · **Export save** (copyable code) / **Import save** · Reset save (you have to type RESET to confirm) · Credits.

## 18. Screens and flow
```
Boot (procedural textures, progress bar)
 └▶ Title ("Undead Juice Co.", tap to start: unlocks audio, goes fullscreen on Android)
     └▶ [first run: Tutorial] ─▶ Base ⇄ World Map ─▶ Loadout ─▶ Hunt (+HUD) ─▶ Summary ─▶ Base | Hunt again
 Modals over Base: Welcome back (offline report) · Daily login · Level up · Area unlocked · Confirm
```
- The pause menu during a hunt has Resume, Settings, and Quit hunt (catches so far are kept).
- In portrait, a "Rotate your phone" overlay covers everything and the hunt pauses.
- The Android back button closes the top panel or modal. On the Base screen with nothing open, it does nothing.

## 19. Art direction
- **Style**: chunky cartoon with thick outlines (4 px at design scale, `#1f1430`). Flat fills with one shade (fill darkened 15%) and one highlight (lightened 20%). Rounded shapes. Characters are about 45% head. Googly eyes (white with a black pupil) whose pupils look where the character is going.
- **Characters** are paper-doll **rigs**: separate parts (head, body, arms, legs, accessories) drawn as SVG, rasterized at boot, and animated with tweens (idle bob, walk cycle, eat nod, struggle kick, float, emerge, burrow).
- **Size**: a normal zombie is about 120 px tall, Dex is about 130, bosses are about 300.
- **UI**: chunky rounded panels (`#2a1f3d` fill, 4 px outline, inner highlight), big buttons with drop shadows, coin yellow `#ffd23f`, plutonium green `#7dff6a`, accent orange `#ff8a3d`. Font: **Lilita One** for headings and numbers, the system UI font for small text.
- **Juice**: squash and stretch on landing, catches, and buttons. Particles for dirt, splashes, sparkles, coins, and gas. A small screen shake on hits (can be turned off). Number pop-ups for coins.

## 20. Audio direction
- **SFX** (zzfx presets): harpoon_fire, balloon_inflate, balloon_pop, zombie_emerge, zombie_groan, zombie_alert, catch_suck, coin, jetpack (loop while thrusting), bait_throw, bait_land, trap_set, trap_snap, stun_hit, clang (shield), blink_poof, gas_puff, crate_drop, crate_open, ui_click, ui_error, purchase, level_up, machine_done, combo_up, boss_roar.
- **Music**: short procedural WebAudio loops (4 to 8 bars). Base: chill swampy groove. Hunt: upbeat plucky. Night: spooky. Boss: driving drums. Music is quieter than SFX and ducks while the pause menu is open.

## 21. Tutorial (first run, skippable)
1. Bolt bubble over the Base: "Boss! The bayou's crawling with zombies. Let's catch 'em and juice 'em!" Fly straight to a scripted Bayou hunt.
2. The scripted hunt: 3 Shamblers, with mounds at 900 / 1400 / 1900 px, no crates, and the end flag hidden until all 3 are caught.
3. Prompts in order, each waiting for the action: **move** (joystick ghost hint), **follow the radar arrow**, **throw bait** (bait button pulses), **wait for it…**, **aim and release** (aim hint), "Caught! Bolt's got it." The 2nd zombie teaches the **jetpack** (its mound sits on a ledge). The 3rd teaches the **trap** (drop it in the fleeing zombie's path).
4. Back at base: tap the **Juicer**, then make **Swamp Juice** (the first job finishes in 3 s), then **collect**, then **sell**, then **Workshop**, then **upgrade the Harpoon**. Done: "Now go make us rich!"
5. Progress is saved after every step. Skipping skips the rest but still grants what the tutorial would have given.

## 22. Balance targets (for the lead's tuning pass)
- First session (about 10 min): finish the tutorial, run 2 to 3 hunts, end with about 400 coins and Harpoon L2.
- Ghost Town unlocks after about 40 minutes of play. Frost Peak after about 2.5 hours. Toxic Plant after about 6 hours. Everything maxed after about 15 hours.
- A Bayou day hunt lasts about 2 to 3 minutes for 6 to 8 catches and earns about 250 to 350 coins once processed and sold.
