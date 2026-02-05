const textInput = document.getElementById("textInput");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const analyzeBtn = document.getElementById("analyzeBtn");
const results = document.getElementById("results");
const analysisOutput = document.getElementById("analysisOutput");
const scoreValue = document.getElementById("scoreValue");
const scoreFill = document.getElementById("scoreFill");
const biasSummary = document.getElementById("biasSummary");
const ocrStatus = document.getElementById("ocrStatus");
const loadSample = document.getElementById("loadSample");
const scoreLabel = document.getElementById("scoreLabel");

const biasRules = [
  {
    key: "deception",
    label: "Deception / Lying",
    weight: 30,
    definition:
      "Deception is knowingly presenting false information or withholding truth to shape outcomes.",
    patterns: [
      /i was lying/i,
      /i lied/i,
      /that's a lie/i,
      /i wasn't being honest/i,
      /i didn't tell you the truth/i,
      /i just wanted to say something nice/i,
      /i said .* so you would/i,
      /i told you .* but/i,
    ],
    highlight: [
      "i was lying",
      "i lied",
      "not being honest",
      "didn't tell you the truth",
      "just wanted to say",
      "so you would",
      "told you",
    ],
    explain:
      "Admitting false statements or strategic omissions is a strong manipulation signal.",
  },
  {
    key: "contradiction",
    label: "Contradiction",
    weight: 22,
    definition:
      "Contradiction is reversing a statement to avoid accountability or shift the narrative.",
    patterns: [
      /when i told you .* that was true.* but/i,
      /i didn't .* at least/i,
      /i should have said/i,
      /i meant to say/i,
      /i couldn't .* but/i,
      /i said .* i didn't/i,
    ],
    highlight: [
      "that was true",
      "but",
      "should have said",
      "meant to say",
      "i didn't",
    ],
    explain:
      "Walk-backs and reversals muddy the truth and make it harder to trust.",
  },
  {
    key: "shiftingreasons",
    label: "Shifting Reasons",
    weight: 18,
    definition:
      "Shifting reasons pile on after the fact to justify a decision.",
    patterns: [
      /it was .* and .* and/i,
      /it was countless other things/i,
      /there were so many reasons/i,
      /it was deeper than that/i,
      /it was the kind of/i,
    ],
    highlight: [
      "countless other things",
      "deeper than that",
      "so many reasons",
      "it was the kind of",
    ],
    explain:
      "Adding reasons later can feel like rationalization rather than clarity.",
  },
  {
    key: "strategicomission",
    label: "Strategic Omission",
    weight: 22,
    definition:
      "Strategic omission hides key details to steer how someone feels or decides.",
    patterns: [
      /i didn't tell you/i,
      /i left out/i,
      /i omitted/i,
      /i kept that from you/i,
      /i spared you the truth/i,
      /i didn't have the heart to tell you/i,
      /i couldn't bring myself to say/i,
    ],
    highlight: [
      "didn't tell you",
      "left out",
      "omitted",
      "kept that from you",
      "spared you",
      "didn't have the heart",
    ],
    explain:
      "Withholding key info manipulates the narrative and denies informed choice.",
  },
  {
    key: "futurefaking",
    label: "Future-Faking",
    weight: 18,
    definition:
      "Future-faking promises or hints at a future to keep someone invested without intent to deliver.",
    patterns: [
      /we will/i,
      /someday/i,
      /one day/i,
      /when things settle/i,
      /after this we'll/i,
      /i can see us/i,
    ],
    highlight: ["someday", "one day", "when things settle", "after this", "see us"],
    explain:
      "Vague future promises can be used to delay accountability now.",
  },
  {
    key: "emotionalmisdirection",
    label: "Emotional Misdirection",
    weight: 16,
    definition:
      "Emotional misdirection uses sentiment to dodge the actual issue or soften deception.",
    patterns: [
      /it would have taken a courage/i,
      /our love/i,
      /i just wanted to be nice/i,
      /i didn't want to hurt you/i,
      /for your own good/i,
      /i meant well/i,
    ],
    highlight: [
      "our love",
      "wanted to be nice",
      "didn't want to hurt you",
      "for your own good",
      "meant well",
    ],
    explain:
      "Appealing to emotions can distract from the truth or impact.",
  },
  {
    key: "doublebind",
    label: "Double Bind",
    weight: 16,
    definition:
      "Double binds create no-win situations where any response is wrong.",
    patterns: [
      /if you do.*you lose/i,
      /either way/i,
      /no matter what you do/i,
      /you can't win/i,
      /you're wrong either way/i,
    ],
    highlight: ["either way", "no matter what", "can't win", "wrong either way"],
    explain:
      "No-win framing traps the other person and blocks resolution.",
  },
  {
    key: "blameshift",
    label: "Blame Shifting",
    weight: 18,
    definition:
      "Blame shifting moves responsibility away from the speaker to avoid accountability.",
    patterns: [
      /you made me/i,
      /if you hadn't/i,
      /this is on you/i,
      /because of you/i,
      /you pushed me/i,
      /you forced me/i,
    ],
    highlight: ["you made me", "if you hadn't", "on you", "because of you", "forced me"],
    explain:
      "It reframes the speaker's actions as the other person's fault.",
  },
  {
    key: "minimization",
    label: "Minimization",
    weight: 16,
    definition:
      "Minimization downplays harm to make it seem insignificant.",
    patterns: [
      /it's not a big deal/i,
      /you're making a big deal/i,
      /it was just/i,
      /only joking/i,
      /not that serious/i,
      /just a joke/i,
    ],
    highlight: ["not a big deal", "just", "only joking", "not that serious", "joke"],
    explain:
      "Downplaying impact can invalidate the other person's feelings.",
  },
  {
    key: "deflection",
    label: "Deflection",
    weight: 14,
    definition:
      "Deflection changes the subject or redirects blame to avoid the core issue.",
    patterns: [
      /what about you/i,
      /that's not the point/i,
      /anyway/i,
      /let's talk about/i,
      /you also/i,
      /and you/i,
    ],
    highlight: ["what about you", "not the point", "anyway", "you also", "and you"],
    explain:
      "It sidesteps the original concern instead of addressing it.",
  },
  {
    key: "invalidating",
    label: "Invalidation",
    weight: 20,
    definition:
      "Invalidation dismisses someone's feelings or experience.",
    patterns: [
      /you're too sensitive/i,
      /overreacting/i,
      /stop being dramatic/i,
      /you're imagining things/i,
      /you're taking it wrong/i,
    ],
    highlight: [
      "too sensitive",
      "overreacting",
      "dramatic",
      "imagining things",
      "taking it wrong",
    ],
    explain:
      "Dismissing emotions can make someone doubt themselves.",
  },
  {
    key: "guilttrip",
    label: "Guilt Tripping",
    weight: 18,
    definition:
      "Guilt tripping uses remorse or obligation to control behavior.",
    patterns: [
      /after all i've done/i,
      /i guess i don't matter/i,
      /you owe me/i,
      /if you cared/i,
      /i did this for you/i,
    ],
    highlight: ["after all i've done", "don't matter", "owe me", "if you cared"],
    explain:
      "It pressures someone to comply out of guilt rather than choice.",
  },
  {
    key: "mixed",
    label: "Mixed Signals",
    weight: 20,
    definition:
      "Mixed signals are conflicting messages that create ambiguity about intent or commitment.",
    patterns: [
      /i like you but/i,
      /i like you,? but/i,
      /i want you but/i,
      /i miss you but/i,
      /i care about you but/i,
      /i don't want to lose you but/i,
      /not sure what i want/i,
      /i'm confused about us/i,
      /i don't know what i want/i,
      /maybe i'm not ready/i,
      /i want this and i don't/i,
      /yes and no/i,
    ],
    highlight: [
      "i like you but",
      "i want you but",
      "i miss you but",
      "i care about you but",
      "not sure what i want",
      "i'm confused",
      "i don't know what i want",
      "not ready",
      "yes and no",
    ],
    explain:
      "It sends two opposing signals at once, which can keep the other person stuck in uncertainty.",
  },
  {
    key: "commitment",
    label: "Commitment Avoidance",
    weight: 22,
    definition:
      "Commitment avoidance is deferring clarity or responsibility to keep options open.",
    patterns: [
      /let's just see/i,
      /let's see where this goes/i,
      /no labels/i,
      /i don't want anything serious/i,
      /i'm not looking for anything/i,
      /i'm not ready for a relationship/i,
      /i don't want to define it/i,
      /let's keep it casual/i,
      /no expectations/i,
      /we'll figure it out/i,
      /i'll decide later/i,
      /after we/i,
      /after that i'll decide/i,
      /we'll talk after/i,
    ],
    highlight: [
      "see where this goes",
      "no labels",
      "not ready",
      "keep it casual",
      "no expectations",
      "decide later",
      "after we",
      "after that",
    ],
    explain:
      "It delays clarity, which can shift the emotional risk onto the other person.",
  },
  {
    key: "transactional",
    label: "Transactional Framing",
    weight: 18,
    definition:
      "Transactional framing treats intimacy or attention as a test or exchange.",
    patterns: [
      /come over and/i,
      /if we hook up/i,
      /if we have sex/i,
      /sleep together and/i,
      /have sex and/i,
      /we can have sex and/i,
      /i'll decide if/i,
      /i'll see if/i,
      /prove it/i,
      /earn it/i,
      /show me and i'll/i,
      /i'll see after/i,
      /let me test/i,
    ],
    highlight: [
      "come over",
      "hook up",
      "have sex",
      "sleep together",
      "i'll decide if",
      "i'll see if",
      "prove it",
      "earn it",
      "test",
    ],
    explain:
      "It positions intimacy as leverage rather than mutual choice or clear intention.",
  },
  {
    key: "breadcrumbing",
    label: "Breadcrumbing",
    weight: 16,
    definition:
      "Breadcrumbing is giving just enough attention to keep someone hopeful without real commitment.",
    patterns: [
      /i'll text you soon/i,
      /let's hang soon/i,
      /miss you\\b.*maybe/i,
      /i'll call you\\b.*later/i,
      /one day we'll/i,
      /we should totally/i,
      /soon\\b.*i promise/i,
    ],
    highlight: [
      "text you soon",
      "hang soon",
      "call you later",
      "one day",
      "we should totally",
      "soon",
    ],
    explain:
      "It strings you along with vague future promises instead of concrete action.",
  },
  {
    key: "sexualpressure",
    label: "Sexual Pressure",
    weight: 22,
    definition:
      "Sexual pressure is pushing intimacy while downplaying or bypassing consent or clarity.",
    patterns: [
      /if you loved me/i,
      /prove you want me/i,
      /don't be a tease/i,
      /just this once/i,
      /come over\\b.*now/i,
      /you owe me/i,
      /everyone does this/i,
    ],
    highlight: [
      "if you loved me",
      "prove you",
      "tease",
      "just this once",
      "come over",
      "you owe me",
    ],
    explain:
      "It creates guilt or urgency to push intimacy rather than respecting boundaries.",
  },
  {
    key: "ambiguity",
    label: "Ambiguity",
    weight: 12,
    definition:
      "Ambiguity keeps intentions unclear, making it hard to set expectations.",
    patterns: [
      /we'll see/i,
      /maybe/i,
      /it depends/i,
      /not sure/i,
      /idk/i,
      /let's just go with it/i,
    ],
    highlight: ["we'll see", "maybe", "depends", "not sure", "idk"],
    explain:
      "Vague statements can avoid accountability and keep you guessing.",
  },
  {
    key: "anchoring",
    label: "Anchoring Bias",
    weight: 8,
    definition:
      "Anchoring bias is relying too heavily on the first number or idea offered.",
    patterns: [/first offer/i, /original price/i, /starting at/i, /at least \\d+/i],
    highlight: ["first offer", "original price", "starting at", "at least"],
    explain: "The first figure or idea sets a mental anchor for later judgment.",
  },
  {
    key: "availability",
    label: "Availability Heuristic",
    weight: 8,
    definition:
      "Availability heuristic is judging likelihood based on what comes to mind easily.",
    patterns: [/all i hear is/i, /everywhere/i, /i keep seeing/i, /just happened to/i],
    highlight: ["all i hear", "everywhere", "keep seeing", "just happened"],
    explain: "Recent or vivid examples can feel more common than they are.",
  },
  {
    key: "representativeness",
    label: "Representativeness Heuristic",
    weight: 8,
    definition:
      "Representativeness is judging based on stereotypes rather than actual odds.",
    patterns: [/looks like the type/i, /people like that/i, /that's so typical/i],
    highlight: ["type", "people like that", "typical"],
    explain: "Stereotypes can override real base rates or evidence.",
  },
  {
    key: "hindsight",
    label: "Hindsight Bias",
    weight: 8,
    definition:
      "Hindsight bias is believing after the fact that you knew it all along.",
    patterns: [/i knew it/i, /obvious now/i, /told you so/i],
    highlight: ["i knew it", "obvious", "told you so"],
    explain: "After outcomes, we overestimate how predictable they were.",
  },
  {
    key: "overconfidence",
    label: "Overconfidence Bias",
    weight: 8,
    definition:
      "Overconfidence bias is being more certain about accuracy than evidence supports.",
    patterns: [/100% sure/i, /can't be wrong/i, /no doubt/i, /definitely/i],
    highlight: ["100% sure", "can't be wrong", "no doubt", "definitely"],
    explain: "Strong certainty can mask uncertainty or missing info.",
  },
  {
    key: "selfserving",
    label: "Self-Serving Bias",
    weight: 8,
    definition:
      "Self-serving bias credits success to oneself and failure to external factors.",
    patterns: [/i did that/i, /my success/i, /their fault/i, /not my fault/i],
    highlight: ["my success", "their fault", "not my fault"],
    explain: "It protects ego by shifting blame or credit unfairly.",
  },
  {
    key: "fae",
    label: "Fundamental Attribution Error",
    weight: 8,
    definition:
      "Fundamental attribution error is blaming character instead of situation.",
    patterns: [/that's just who you are/i, /you're lazy/i, /you're selfish/i],
    highlight: ["just who you are", "lazy", "selfish"],
    explain: "It overlooks context and jumps to personal blame.",
  },
  {
    key: "halo",
    label: "Halo Effect",
    weight: 6,
    definition:
      "Halo effect is letting one positive trait shape overall judgment.",
    patterns: [/since you're so smart/i, /because you're successful/i, /you're so good at/i],
    highlight: ["so smart", "successful", "good at"],
    explain: "A single good trait can inflate the whole impression.",
  },
  {
    key: "horn",
    label: "Horn Effect",
    weight: 6,
    definition:
      "Horn effect is letting one negative trait shape overall judgment.",
    patterns: [/since you're bad at/i, /because you're a mess/i, /you're so annoying/i],
    highlight: ["bad at", "a mess", "annoying"],
    explain: "A single flaw can unfairly taint everything else.",
  },
  {
    key: "negativity",
    label: "Negativity Bias",
    weight: 6,
    definition:
      "Negativity bias gives more weight to bad experiences than good ones.",
    patterns: [/everything is awful/i, /always the worst/i, /nothing good happens/i],
    highlight: ["awful", "worst", "nothing good"],
    explain: "Negative events dominate perception and memory.",
  },
  {
    key: "optimism",
    label: "Optimism Bias",
    weight: 6,
    definition:
      "Optimism bias assumes positive outcomes are more likely than they are.",
    patterns: [/it'll be fine/i, /nothing can go wrong/i, /guaranteed/i],
    highlight: ["it'll be fine", "nothing can go wrong", "guaranteed"],
    explain: "It underestimates risks or downsides.",
  },
  {
    key: "pessimism",
    label: "Pessimism Bias",
    weight: 6,
    definition:
      "Pessimism bias assumes negative outcomes are more likely than they are.",
    patterns: [/it'll never work/i, /always fails/i, /it's doomed/i],
    highlight: ["never work", "always fails", "doomed"],
    explain: "It overestimates risk and downplays possibility.",
  },
  {
    key: "statusquo",
    label: "Status Quo Bias",
    weight: 6,
    definition:
      "Status quo bias prefers the current state over change.",
    patterns: [/we've always done it this way/i, /why change/i, /leave it as is/i],
    highlight: ["always done", "why change", "as is"],
    explain: "It favors familiarity even when change could help.",
  },
  {
    key: "lossaversion",
    label: "Loss Aversion",
    weight: 7,
    definition:
      "Loss aversion is feeling losses more intensely than gains.",
    patterns: [/can't afford to lose/i, /risk losing/i, /lose everything/i],
    highlight: ["lose", "risk losing"],
    explain: "Potential losses can outweigh equivalent gains.",
  },
  {
    key: "sunkcost",
    label: "Sunk Cost Fallacy",
    weight: 8,
    definition:
      "Sunk cost fallacy is sticking with something because you've already invested.",
    patterns: [/already put in/i, /too much invested/i, /can't quit now/i],
    highlight: ["already put in", "too much invested", "can't quit"],
    explain: "Past investment shouldn't dictate future decisions.",
  },
  {
    key: "bandwagon",
    label: "Bandwagon / Social Proof",
    weight: 8,
    definition:
      "Bandwagon and social proof follow the crowd as evidence.",
    patterns: [/everyone is doing it/i, /most people/i, /all my friends/i],
    highlight: ["everyone", "most people", "all my friends"],
    explain: "Popularity is used as proof instead of evidence.",
  },
  {
    key: "scarcity",
    label: "Scarcity Bias",
    weight: 7,
    definition:
      "Scarcity bias values things more when they seem limited.",
    patterns: [/only \\d+ left/i, /last chance/i, /limited time/i],
    highlight: ["only", "last chance", "limited time"],
    explain: "Perceived scarcity can pressure decisions.",
  },
  {
    key: "framing",
    label: "Framing Effect",
    weight: 7,
    definition:
      "Framing effect is changing decisions based on how info is presented.",
    patterns: [/90% chance/i, /10% chance/i, /only \\d+%/i],
    highlight: ["chance", "only"],
    explain: "Different frames can shift the same facts.",
  },
  {
    key: "ingroup",
    label: "In-Group Bias",
    weight: 6,
    definition:
      "In-group bias favors people who are perceived as part of your group.",
    patterns: [/people like us/i, /our kind/i, /we always/i],
    highlight: ["people like us", "our kind", "we always"],
    explain: "It privileges insiders over outsiders.",
  },
  {
    key: "outgroup",
    label: "Out-Group Bias",
    weight: 6,
    definition:
      "Out-group bias stereotypes or dismisses people outside your group.",
    patterns: [/people like them/i, /those people/i, /they always/i],
    highlight: ["people like them", "those people", "they always"],
    explain: "It generalizes outsiders unfairly.",
  },
  {
    key: "authority",
    label: "Authority Bias",
    weight: 6,
    definition:
      "Authority bias is overvaluing statements from perceived authority.",
    patterns: [/expert said/i, /doctor said/i, /the boss says/i],
    highlight: ["expert", "doctor", "boss"],
    explain: "Authority can be mistaken, yet feels convincing.",
  },
  {
    key: "planning",
    label: "Planning Fallacy",
    weight: 6,
    definition:
      "Planning fallacy underestimates time, cost, or difficulty.",
    patterns: [/won't take long/i, /easy job/i, /quick win/i],
    highlight: ["won't take long", "easy", "quick"],
    explain: "Plans ignore likely delays or complications.",
  },
  {
    key: "projection",
    label: "Projection Bias",
    weight: 6,
    definition:
      "Projection bias assumes others feel or think the way you do.",
    patterns: [/you feel the same/i, /you know you want this/i, /we both know/i],
    highlight: ["you feel the same", "you know you want", "we both know"],
    explain: "It treats your perspective as universal.",
  },
  {
    key: "spotlight",
    label: "Spotlight Effect",
    weight: 6,
    definition:
      "Spotlight effect overestimates how much others notice you.",
    patterns: [/everyone is watching/i, /everyone noticed/i, /people are staring/i],
    highlight: ["everyone", "noticed", "staring"],
    explain: "We assume others pay more attention than they do.",
  },
  {
    key: "illusioncontrol",
    label: "Illusion of Control",
    weight: 6,
    definition:
      "Illusion of control is overestimating your influence over outcomes.",
    patterns: [/i can control/i, /i'll make it happen/i, /it's all on me/i],
    highlight: ["control", "make it happen", "all on me"],
    explain: "It inflates personal control beyond reality.",
  },
  {
    key: "gamblers",
    label: "Gambler's / Hot-Hand Fallacy",
    weight: 6,
    definition:
      "Gambler's and hot-hand fallacies misread randomness as streaks.",
    patterns: [/due for a win/i, /on a streak/i, /can't lose now/i],
    highlight: ["due for a win", "streak", "can't lose"],
    explain: "Random events are treated like predictable runs.",
  },
  {
    key: "justworld",
    label: "Just-World Hypothesis",
    weight: 6,
    definition:
      "Just-world bias assumes people get what they deserve.",
    patterns: [/they deserved it/i, /karma/i, /people get what they earn/i],
    highlight: ["deserved", "karma", "get what they earn"],
    explain: "It rationalizes outcomes as fair by default.",
  },
  {
    key: "reactance",
    label: "Reactance",
    weight: 6,
    definition:
      "Reactance is resisting when you feel your freedom is threatened.",
    patterns: [/don't tell me/i, /you can't make me/i, /i'll do what i want/i],
    highlight: ["don't tell me", "can't make me", "do what i want"],
    explain: "Pushback grows when autonomy feels limited.",
  },
  {
    key: "dunningkruger",
    label: "Dunning-Kruger Effect",
    weight: 6,
    definition:
      "Dunning-Kruger is overestimating ability when knowledge is limited.",
    patterns: [/i know enough/i, /i don't need to learn/i, /it's easy for me/i],
    highlight: ["know enough", "don't need to learn", "easy for me"],
    explain: "Low expertise can create inflated confidence.",
  },
  {
    key: "endowment",
    label: "Endowment Effect",
    weight: 6,
    definition:
      "Endowment effect values things more just because you own them.",
    patterns: [/because it's mine/i, /my stuff is better/i, /i can't let go/i],
    highlight: ["it's mine", "my stuff", "can't let go"],
    explain: "Ownership increases perceived value.",
  },
  {
    key: "survivorship",
    label: "Survivorship Bias",
    weight: 6,
    definition:
      "Survivorship bias focuses on successes while ignoring failures.",
    patterns: [/they made it so/i, /all the winners/i, /look at the success/i],
    highlight: ["made it", "winners", "success"],
    explain: "Missing failures distorts the true odds.",
  },
  {
    key: "selection",
    label: "Selection Bias",
    weight: 6,
    definition:
      "Selection bias relies on unrepresentative samples.",
    patterns: [/from my circle/i, /people i know/i, /my feed shows/i],
    highlight: ["my circle", "people i know", "my feed"],
    explain: "A skewed sample can mislead conclusions.",
  },
  {
    key: "sampling",
    label: "Sampling Bias",
    weight: 6,
    definition:
      "Sampling bias draws conclusions from a non-random sample.",
    patterns: [/only asked/i, /small sample/i, /just a few/i],
    highlight: ["only asked", "small sample", "just a few"],
    explain: "A limited sample can distort reality.",
  },
  {
    key: "recency",
    label: "Recency Bias",
    weight: 6,
    definition:
      "Recency bias overweights the most recent information.",
    patterns: [/lately/i, /recently/i, /just now/i],
    highlight: ["lately", "recently", "just now"],
    explain: "Recent events feel more important than they are.",
  },
  {
    key: "primacy",
    label: "Primacy Effect",
    weight: 6,
    definition:
      "Primacy effect overweights first impressions or early info.",
    patterns: [/first impression/i, /from the start/i, /right away/i],
    highlight: ["first impression", "from the start", "right away"],
    explain: "Early info anchors judgment.",
  },
  {
    key: "zerorisk",
    label: "Zero-Risk Bias",
    weight: 6,
    definition:
      "Zero-risk bias prefers eliminating one risk even if alternatives reduce more overall risk.",
    patterns: [/no risk/i, /zero risk/i, /completely safe/i],
    highlight: ["no risk", "zero risk", "completely safe"],
    explain: "Zero feels better than small, even if less optimal.",
  },
  {
    key: "omission",
    label: "Omission Bias",
    weight: 6,
    definition:
      "Omission bias prefers inaction to avoid responsibility.",
    patterns: [/better to do nothing/i, /let's not do anything/i, /just leave it/i],
    highlight: ["do nothing", "not do anything", "leave it"],
    explain: "We judge harms from action more harshly than inaction.",
  },
  {
    key: "action",
    label: "Action Bias",
    weight: 6,
    definition:
      "Action bias prefers doing something over waiting, even when waiting is better.",
    patterns: [/we must do something/i, /do something now/i, /can't just wait/i],
    highlight: ["do something", "now", "can't just wait"],
    explain: "Action feels better than patience, even when unhelpful.",
  },
  {
    key: "present",
    label: "Present Bias",
    weight: 6,
    definition:
      "Present bias overvalues immediate rewards versus future ones.",
    patterns: [/right now/i, /today not tomorrow/i, /i want it now/i],
    highlight: ["right now", "today", "want it now"],
    explain: "Immediate rewards can outweigh long-term outcomes.",
  },
  {
    key: "hyperbolic",
    label: "Hyperbolic Discounting",
    weight: 6,
    definition:
      "Hyperbolic discounting strongly favors immediate rewards over future rewards.",
    patterns: [/later doesn't matter/i, /future me can deal/i, /i'll worry later/i],
    highlight: ["later doesn't matter", "future me", "worry later"],
    explain: "Future costs feel smaller than immediate gratification.",
  },
  {
    key: "falseconsensus",
    label: "False Consensus Effect",
    weight: 6,
    definition:
      "False consensus assumes others share your beliefs or behavior.",
    patterns: [/everyone thinks like me/i, /we all agree/i, /anyone would/i],
    highlight: ["everyone thinks", "we all agree", "anyone would"],
    explain: "We overestimate how common our views are.",
  },
  {
    key: "clustering",
    label: "Clustering Illusion",
    weight: 6,
    definition:
      "Clustering illusion sees patterns in random data.",
    patterns: [/look at this pattern/i, /too many in a row/i, /can't be random/i],
    highlight: ["pattern", "in a row", "can't be random"],
    explain: "Randomness often looks clustered by chance.",
  },
  {
    key: "texassharpshooter",
    label: "Texas Sharpshooter Fallacy",
    weight: 6,
    definition:
      "Texas sharpshooter selects data after the fact to fit a story.",
    patterns: [/look at these hits/i, /ignore the misses/i, /only the good ones/i],
    highlight: ["hits", "ignore", "only the good"],
    explain: "Cherry-picked data creates a fake pattern.",
  },
  {
    key: "baserate",
    label: "Base Rate Neglect",
    weight: 6,
    definition:
      "Base rate neglect ignores general statistics in favor of specific info.",
    patterns: [/odds don't matter/i, /base rate/i, /statistics don't apply/i],
    highlight: ["odds", "base rate", "statistics"],
    explain: "Ignoring base rates distorts probability judgments.",
  },
  {
    key: "conjunction",
    label: "Conjunction Fallacy",
    weight: 6,
    definition:
      "Conjunction fallacy assumes specific combined events are more likely.",
    patterns: [/more likely both/i, /more likely that both/i, /and also/i],
    highlight: ["more likely both", "both"],
    explain: "Specific combos feel more likely than single events.",
  },
  {
    key: "beliefperseverance",
    label: "Belief Perseverance",
    weight: 6,
    definition:
      "Belief perseverance sticks to beliefs despite new evidence.",
    patterns: [/even if that's true/i, /still believe/i, /doesn't change my mind/i],
    highlight: ["still believe", "doesn't change", "even if"],
    explain: "Beliefs can persist even when evidence shifts.",
  },
  {
    key: "beliefbias",
    label: "Belief Bias",
    weight: 6,
    definition:
      "Belief bias judges arguments based on conclusions rather than logic.",
    patterns: [/sounds right so it is/i, /i agree so it's true/i],
    highlight: ["sounds right", "i agree"],
    explain: "Agreement can override reasoning.",
  },
  {
    key: "backfire",
    label: "Backfire Effect",
    weight: 6,
    definition:
      "Backfire effect strengthens beliefs when confronted with disconfirming evidence.",
    patterns: [/that just proves me right/i, /makes me more sure/i],
    highlight: ["proves me right", "more sure"],
    explain: "Contradiction can harden beliefs instead of changing them.",
  },
  {
    key: "availabilitycascade",
    label: "Availability Cascade",
    weight: 6,
    definition:
      "Availability cascade spreads beliefs through repetition and social reinforcement.",
    patterns: [/everyone keeps saying/i, /it's all over/i, /people are talking about/i],
    highlight: ["keeps saying", "all over", "talking about"],
    explain: "Repeated messages feel truer over time.",
  },
  {
    key: "mereexposure",
    label: "Mere Exposure / Familiarity Bias",
    weight: 6,
    definition:
      "Mere exposure increases preference through repeated exposure.",
    patterns: [/seen it so much/i, /familiar so/i, /used to it/i],
    highlight: ["seen it", "familiar", "used to it"],
    explain: "Familiar things feel more trustworthy.",
  },
  {
    key: "contrast",
    label: "Contrast Effect",
    weight: 6,
    definition:
      "Contrast effect evaluates something relative to what came before.",
    patterns: [/compared to that/i, /after seeing that/i, /in comparison/i],
    highlight: ["compared to", "after seeing", "in comparison"],
    explain: "Perception shifts based on context.",
  },
  {
    key: "decoy",
    label: "Decoy Effect",
    weight: 6,
    definition:
      "Decoy effect nudges choice by adding a worse option.",
    patterns: [/better value/i, /only a little more/i, /makes sense to upgrade/i],
    highlight: ["better value", "little more", "upgrade"],
    explain: "Extra options can steer decisions.",
  },
  {
    key: "paradoxchoice",
    label: "Paradox of Choice",
    weight: 6,
    definition:
      "Paradox of choice is feeling worse when options increase.",
    patterns: [/too many options/i, /overwhelmed by choices/i, /can't decide/i],
    highlight: ["too many options", "overwhelmed", "can't decide"],
    explain: "More options can reduce satisfaction.",
  },
  {
    key: "choicesupportive",
    label: "Choice-Supportive Bias",
    weight: 6,
    definition:
      "Choice-supportive bias remembers chosen options as better than they were.",
    patterns: [/i chose right/i, /best decision/i, /no regrets/i],
    highlight: ["chose right", "best decision", "no regrets"],
    explain: "We justify our own choices after the fact.",
  },
  {
    key: "outcome",
    label: "Outcome Bias",
    weight: 6,
    definition:
      "Outcome bias judges decisions by results rather than process.",
    patterns: [/it worked so it was right/i, /since it ended well/i],
    highlight: ["worked so", "ended well"],
    explain: "Good outcomes don't guarantee good decisions.",
  },
  {
    key: "morallicensing",
    label: "Moral Licensing",
    weight: 6,
    definition:
      "Moral licensing uses past good deeds to justify bad ones.",
    patterns: [/i did good so/i, /i earned this/i, /i deserve to now/i],
    highlight: ["did good", "earned this", "deserve to now"],
    explain: "Past virtue can excuse present harm.",
  },
  {
    key: "systemjustification",
    label: "System Justification",
    weight: 6,
    definition:
      "System justification defends existing systems as fair or natural.",
    patterns: [/that's just how it is/i, /the system works/i, /it's the way things are/i],
    highlight: ["how it is", "system works", "way things are"],
    explain: "It rationalizes the status quo.",
  },
  {
    key: "normalcy",
    label: "Normalcy Bias",
    weight: 6,
    definition:
      "Normalcy bias underestimates the possibility of disaster.",
    patterns: [/nothing will happen/i, /it won't be that bad/i, /we've always been fine/i],
    highlight: ["nothing will happen", "won't be that bad", "always been fine"],
    explain: "We assume things will stay normal.",
  },
  {
    key: "neglectprob",
    label: "Neglect of Probability",
    weight: 6,
    definition:
      "Neglect of probability ignores likelihood when judging outcomes.",
    patterns: [/chances don't matter/i, /odds don't matter/i, /regardless of odds/i],
    highlight: ["chances don't matter", "odds don't matter"],
    explain: "Probability is discounted in decision-making.",
  },
  {
    key: "neglectduration",
    label: "Neglect of Duration",
    weight: 6,
    definition:
      "Neglect of duration ignores how long something lasts.",
    patterns: [/won't last long/i, /just a moment/i, /only for a bit/i],
    highlight: ["won't last long", "moment", "only for a bit"],
    explain: "Length is underestimated in impact.",
  },
  {
    key: "affect",
    label: "Affect Heuristic",
    weight: 6,
    definition:
      "Affect heuristic relies on feelings rather than evidence.",
    patterns: [/feels right/i, /bad vibe/i, /i just feel it/i],
    highlight: ["feels right", "bad vibe", "i just feel"],
    explain: "Emotions can substitute for analysis.",
  },
  {
    key: "empathygap",
    label: "Empathy Gap",
    weight: 6,
    definition:
      "Empathy gap misjudges behavior when in different emotional states.",
    patterns: [/you'd do the same/i, /you don't get it now/i, /wait until you're/i],
    highlight: ["do the same", "don't get it", "wait until you're"],
    explain: "We misread others' feelings in different states.",
  },
  {
    key: "identifiable",
    label: "Identifiable Victim Effect",
    weight: 6,
    definition:
      "Identifiable victim effect favors one story over statistics.",
    patterns: [/think of this one person/i, /this one kid/i, /that single case/i],
    highlight: ["one person", "one kid", "single case"],
    explain: "One vivid story can outweigh broader data.",
  },
  {
    key: "peakend",
    label: "Peak-End Rule",
    weight: 6,
    definition:
      "Peak-end rule judges experiences by the peak and the end.",
    patterns: [/what matters is the end/i, /remember the best part/i],
    highlight: ["matters is the end", "best part"],
    explain: "We overvalue highlights and endings.",
  },
  {
    key: "endofhistory",
    label: "End-of-History Illusion",
    weight: 6,
    definition:
      "End-of-history illusion assumes you won't change much in the future.",
    patterns: [/i'll never change/i, /this is who i am/i, /i'm set in my ways/i],
    highlight: ["never change", "who i am", "set in my ways"],
    explain: "We underestimate future growth and change.",
  },
  {
    key: "actorobserver",
    label: "Actor-Observer Bias",
    weight: 6,
    definition:
      "Actor-observer bias blames situations for self and character for others.",
    patterns: [/i did it because/i, /they did it because they are/i],
    highlight: ["i did it because", "they did it because they are"],
    explain: "We excuse ourselves and blame others.",
  },
  {
    key: "falsememory",
    label: "False Memory",
    weight: 6,
    definition:
      "False memory is confidently recalling events inaccurately.",
    patterns: [/i remember it clearly/i, /i swear it happened/i, /that definitely happened/i],
    highlight: ["remember it clearly", "swear it happened", "definitely happened"],
    explain: "Confidence doesn't guarantee accuracy.",
  },
  {
    key: "misattrib",
    label: "Misattribution of Arousal",
    weight: 6,
    definition:
      "Misattribution of arousal confuses excitement sources with attraction.",
    patterns: [/i'm so hyped because of you/i, /the rush makes me want you/i],
    highlight: ["hyped because of you", "rush makes me want you"],
    explain: "Arousal can be misread as attraction.",
  },
  {
    key: "baader",
    label: "Baader-Meinhof Phenomenon",
    weight: 6,
    definition:
      "Baader-Meinhof is noticing something more after first seeing it.",
    patterns: [/seeing it everywhere/i, /now i notice it all the time/i],
    highlight: ["seeing it everywhere", "notice it all the time"],
    explain: "Awareness makes things feel more frequent.",
  },
  {
    key: "smallnumbers",
    label: "Law of Small Numbers",
    weight: 6,
    definition:
      "Law of small numbers overgeneralizes from small samples.",
    patterns: [/from two examples/i, /only a couple of/i, /just a few cases/i],
    highlight: ["two examples", "couple", "few cases"],
    explain: "Small samples can be misleading.",
  },
  {
    key: "regression",
    label: "Regression to the Mean",
    weight: 6,
    definition:
      "Regression to the mean mistakes normal variation for change.",
    patterns: [/back to normal/i, /it was a fluke/i, /just a lucky streak/i],
    highlight: ["back to normal", "fluke", "lucky streak"],
    explain: "Extremes often drift toward average.",
  },
  {
    key: "curseknowledge",
    label: "Curse of Knowledge",
    weight: 6,
    definition:
      "Curse of knowledge assumes others know what you know.",
    patterns: [/it's obvious/i, /everyone knows that/i, /you should know/i],
    highlight: ["obvious", "everyone knows", "you should know"],
    explain: "Knowledge makes it hard to see others' perspective.",
  },
  {
    key: "illusorytruth",
    label: "Illusory Truth Effect",
    weight: 6,
    definition:
      "Illusory truth makes repeated claims feel true.",
    patterns: [/heard it a lot/i, /people keep saying/i, /it keeps coming up/i],
    highlight: ["heard it a lot", "keep saying", "keeps coming up"],
    explain: "Repetition increases perceived truth.",
  },
  {
    key: "illusiontransparency",
    label: "Illusion of Transparency",
    weight: 6,
    definition:
      "Illusion of transparency assumes your thoughts are obvious to others.",
    patterns: [/you should know what i mean/i, /it's obvious how i feel/i],
    highlight: ["should know", "obvious how i feel"],
    explain: "We overestimate how well others can read us.",
  },
  {
    key: "priorprob",
    label: "Neglect of Prior Probability",
    weight: 6,
    definition:
      "Neglect of prior probability ignores base rates.",
    patterns: [/base rate/i, /prior probability/i, /statistics don't matter/i],
    highlight: ["base rate", "prior probability", "statistics"],
    explain: "Ignoring priors skews judgments.",
  },
  {
    key: "placebo",
    label: "Placebo / Nocebo Effect",
    weight: 6,
    definition:
      "Placebo or nocebo effects are changes caused by belief in treatment.",
    patterns: [/this will make me better/i, /this will make me sick/i],
    highlight: ["make me better", "make me sick"],
    explain: "Expectation can shape outcomes.",
  },
  {
    key: "ostrich",
    label: "Ostrich Effect",
    weight: 6,
    definition:
      "Ostrich effect avoids negative information.",
    patterns: [/i don't want to know/i, /let's not look/i, /ignore the numbers/i],
    highlight: ["don't want to know", "not look", "ignore"],
    explain: "Avoidance hides uncomfortable facts.",
  },
  {
    key: "conservatism",
    label: "Conservatism Bias",
    weight: 6,
    definition:
      "Conservatism bias sticks too closely to initial beliefs.",
    patterns: [/stick with my original/i, /i still think the same/i],
    highlight: ["stick with my original", "still think the same"],
    explain: "We update beliefs too slowly.",
  },
  {
    key: "attribution",
    label: "Attribution Bias",
    weight: 6,
    definition:
      "Attribution bias misassigns causes for behavior.",
    patterns: [/because you're like that/i, /that's just you/i],
    highlight: ["because you're", "that's just you"],
    explain: "We over-attribute to personality.",
  },
  {
    key: "automation",
    label: "Automation Bias",
    weight: 6,
    definition:
      "Automation bias over-trusts automated tools or systems.",
    patterns: [/the system said/i, /the computer says/i, /the app says/i],
    highlight: ["system said", "computer says", "app says"],
    explain: "Automation can be wrong, but feels authoritative.",
  },
  {
    key: "egocentric",
    label: "Egocentric Bias",
    weight: 6,
    definition:
      "Egocentric bias overestimates your own contribution.",
    patterns: [/i did most of it/i, /i carried this/i, /i did all the work/i],
    highlight: ["did most", "carried", "all the work"],
    explain: "We remember our effort more than others'.",
  },
  {
    key: "positivity",
    label: "Positivity Bias",
    weight: 6,
    definition:
      "Positivity bias favors positive info over negative.",
    patterns: [/look on the bright side/i, /focus on the good/i, /it's all good/i],
    highlight: ["bright side", "focus on the good", "all good"],
    explain: "Positive framing can hide real issues.",
  },
  {
    key: "riskcomp",
    label: "Risk Compensation",
    weight: 6,
    definition:
      "Risk compensation takes more risk when feeling protected.",
    patterns: [/seatbelt so/i, /it's safe so i'll/i, /protected so/i],
    highlight: ["seatbelt", "safe so", "protected"],
    explain: "Safety measures can increase risk-taking.",
  },
  {
    key: "default",
    label: "Default Effect",
    weight: 6,
    definition:
      "Default effect sticks with the pre-selected option.",
    patterns: [/just go with the default/i, /keep the default/i, /leave it as default/i],
    highlight: ["default", "go with", "keep"],
    explain: "Defaults feel easier than active choice.",
  },
  {
    key: "mereownership",
    label: "Mere Ownership Effect",
    weight: 6,
    definition:
      "Mere ownership effect prefers things simply because they're yours.",
    patterns: [/because i own it/i, /it's mine so/i, /my version is better/i],
    highlight: ["own it", "it's mine", "my version"],
    explain: "Ownership boosts perceived value.",
  },
  {
    key: "gaslighting",
    label: "Gaslighting",
    weight: 28,
    definition:
      "Gaslighting is when someone denies your reality or rewrites events to make you doubt your memory or perception.",
    patterns: [
      /you're (imagining|overreacting|too sensitive)/i,
      /that never happened/i,
      /you always make things up/i,
      /you're crazy/i,
    ],
    highlight: ["imagining", "overreacting", "too sensitive", "never happened", "always", "crazy"],
    explain:
      "This language dismisses your experience and reframes events as unreliable or invented.",
  },
  {
    key: "confirmation",
    label: "Confirmation Bias",
    weight: 18,
    definition:
      "Confirmation bias is the habit of only accepting information that supports a pre-set belief and ignoring contrary evidence.",
    patterns: [
      /everyone agrees/i,
      /just proves my point/i,
      /obviously/i,
      /as i said/i,
    ],
    highlight: ["everyone", "proves my point", "obviously", "as I said"],
    explain:
      "This leans on selective proof instead of considering other perspectives.",
  },
  {
    key: "sarcasm",
    label: "Sarcasm",
    weight: 12,
    definition:
      "Sarcasm uses mock praise or irony to communicate contempt without saying it directly.",
    patterns: [
      /yeah right/i,
      /sure,? because/i,
      /great job/i,
      /love that for you/i,
    ],
    highlight: ["yeah right", "sure", "great job", "love that"],
    explain:
      "The tone implies the opposite of the literal words, which can invalidate the other person.",
  },
  {
    key: "passive",
    label: "Passive Aggressive",
    weight: 16,
    definition:
      "Passive aggression is indirect hostility, often delivered with politeness or ambiguity.",
    patterns: [
      /fine\.? whatever/i,
      /if you say so/i,
      /must be nice/i,
      /no worries\b.*but/i,
    ],
    highlight: ["fine", "whatever", "if you say so", "must be nice", "no worries"],
    explain:
      "This avoids a direct statement but still signals resentment or punishment.",
  },
  {
    key: "stonewalling",
    label: "Stonewalling",
    weight: 10,
    definition:
      "Stonewalling is shutting down a conversation to avoid accountability or to punish the other person.",
    patterns: [
      /i'm done talking/i,
      /we're not doing this/i,
      /don't talk to me/i,
    ],
    highlight: ["done talking", "not doing this", "don't talk"],
    explain:
      "This cuts off dialogue instead of addressing the issue.",
  },
];

const sampleText = `I like you, but I don't want anything serious right now. Maybe we should keep it casual and just see where this goes. I want you, but I'm not sure what I want. Can you come over and have sex, and I'll decide later if I want to date? You're being too sensitive about this, and that never happened anyway. Everyone agrees with me, obviously, so that proves my point. Sure, because I'm always the bad guy. Yeah right. Look, I'm done talking about this — don't tell me what to do. I'll do what I want. Maybe I'll text you soon.`;

const splitIntoSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const highlightTerms = (sentence, terms) => {
  let highlighted = sentence;
  terms.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    highlighted = highlighted.replace(regex, (match) => `<span class="highlight">${match}</span>`);
  });
  return highlighted;
};

const analyzeSentence = (sentence) => {
  const matches = [];
  biasRules.forEach((rule) => {
    if (rule.patterns.some((pattern) => pattern.test(sentence))) {
      matches.push(rule);
    }
  });
  return matches;
};

const scoreConversation = (sentences, findings) => {
  const base = findings.reduce((sum, finding) => sum + finding.weight, 0);
  const counts = findings.reduce((map, finding) => {
    map[finding.key] = (map[finding.key] || 0) + 1;
    return map;
  }, {});
  const clusterPenalty = Object.entries(counts).reduce((sum, [key, count]) => {
    if (count <= 1) return sum;
    const rule = biasRules.find((item) => item.key === key);
    if (!rule) return sum;
    return sum + (count - 1) * Math.round(rule.weight * 0.5);
  }, 0);
  const density = sentences.length ? base / sentences.length : 0;
  const raw = Math.min(100, Math.round(density + base * 0.6 + clusterPenalty));
  return Math.max(0, raw);
};

const renderSummary = (findingCounts) => {
  biasSummary.innerHTML = "";
  const ordered = biasRules
    .map((rule, index) => ({
      key: rule.key,
      label: rule.label,
      definition: rule.definition,
      count: findingCounts[rule.key]?.count ?? 0,
      index,
    }))
    .sort((a, b) => (b.count - a.count) || (a.index - b.index));

  ordered.forEach((data) => {
    const card = document.createElement("div");
    card.className = data.count > 0 ? "bias-card hit" : "bias-card";
    card.innerHTML = `
      <strong>${data.label}</strong>
      <span class="muted">${data.count} hits</span>
      <span class="bias-tip">${data.definition}</span>
    `;
    biasSummary.appendChild(card);
  });
};

const renderAnalysis = (sentences, annotated) => {
  analysisOutput.innerHTML = "";

  sentences.forEach((sentence, index) => {
    const matches = annotated[index];
    const container = document.createElement("article");
    container.className = "sentence";

    if (matches.length === 0) {
      container.innerHTML = `
        <header>
          <span class="tag">Clean-ish</span>
          <span class="muted">No obvious bias detected</span>
        </header>
        <p>${sentence}</p>
      `;
      analysisOutput.appendChild(container);
      return;
    }

    container.classList.add("hit");
    const match = matches[0];
    const highlighted = highlightTerms(sentence, match.highlight);

    container.innerHTML = `
      <header>
        <span class="tag">${match.label}</span>
        <div class="tooltip">
          <button type="button" aria-label="Definition">?</button>
          <span>${match.definition}</span>
        </div>
      </header>
      <p>${highlighted}</p>
      <p class="explain">${match.explain}</p>
    `;

    if (matches.length > 1) {
      const additional = matches
        .slice(1)
        .map((item) => item.label)
        .join(", ");
      const extra = document.createElement("p");
      extra.className = "muted";
      extra.textContent = `Also flagged: ${additional}.`;
      container.appendChild(extra);
    }

    analysisOutput.appendChild(container);
  });
};

const runAnalysis = () => {
  const text = textInput.value.trim();
  if (!text) {
    alert("Paste some text to analyze.");
    return;
  }

  const sentences = splitIntoSentences(text);
  const annotated = sentences.map((sentence) => analyzeSentence(sentence));
  const flattened = annotated.flat();

  const findingCounts = {};
  biasRules.forEach((rule) => {
    const count = flattened.filter((item) => item.key === rule.key).length;
    findingCounts[rule.key] = { label: rule.label, count };
  });

  const score = scoreConversation(sentences, flattened);

  scoreValue.textContent = `${score}%`;
  scoreFill.style.width = `${score}%`;

  scoreLabel.classList.remove("status-green", "status-yellow", "status-orange", "status-red");

  if (score <= 25) {
    scoreLabel.textContent = "Reasonable amount of cap";
    scoreLabel.classList.add("status-green");
  } else if (score <= 50) {
    scoreLabel.textContent = "Getting shady";
    scoreLabel.classList.add("status-yellow");
  } else if (score <= 75) {
    scoreLabel.textContent = "Brooo pack your bags";
    scoreLabel.classList.add("status-orange");
  } else {
    scoreLabel.textContent = "NAH 💀 that’s cap";
    scoreLabel.classList.add("status-red");
  }

  renderSummary(findingCounts);
  renderAnalysis(sentences, annotated);
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth" });
};

const handleImageUpload = async (file) => {
  if (!file) return;

  const url = URL.createObjectURL(file);
  imagePreview.innerHTML = `<img src="${url}" alt="Uploaded conversation screenshot" />`;

  if (!window.Tesseract) {
    ocrStatus.textContent = "OCR library is still loading. You can still paste text above.";
    return;
  }

  ocrStatus.textContent = "Running OCR...";
  try {
    const { data } = await window.Tesseract.recognize(file, "eng");
    if (data && data.text) {
      textInput.value = data.text.trim();
      ocrStatus.textContent = "OCR complete. Review the text and run analysis.";
    } else {
      ocrStatus.textContent = "OCR finished, but no text was detected.";
    }
  } catch (error) {
    ocrStatus.textContent = "OCR failed. Paste text manually for now.";
  }
};

analyzeBtn.addEventListener("click", runAnalysis);
imageInput.addEventListener("change", (event) => handleImageUpload(event.target.files[0]));
loadSample.addEventListener("click", () => {
  textInput.value = sampleText;
});
