// ════════════════════════════════════════════════════════════════════════════════
// MODULE 1: WAKING UP
// 6 Weekly Immersion Plans, 7 days each.
// `sectionId` corresponds to the week number, `lessonNumber` to the day.
// ════════════════════════════════════════════════════════════════════════════════

const HAPPIER_NOTE = 'This day uses the Happier app. After your meditation in the app, return here for the reflection prompts.';

const WEEK_TITLES = {
  1: 'Becoming Mindful I',
  2: 'Becoming Mindful II',
  3: 'Exploring Habits I',
  4: 'Exploring Habits II',
  5: 'Investigating Information from Emotions and Sensations I',
  6: 'Investigating Information from Emotions and Sensations II',
};

function lesson(week, day, title, blocks) {
  return {
    id: `m1_w${week}_d${day}`,
    sectionId: week,
    lessonNumber: day,
    isCompanion: false,
    title,
    sectionTitle: `Week ${week}: ${WEEK_TITLES[week]}`,
    blocks,
  };
}

// ─── Block helpers ──────────────────────────────────────────────────────────────

const info = (content, title) => title ? { type: 'info', title, content } : { type: 'info', content };
const ask = (title, items) => ({
  type: 'questions',
  title,
  questions: items.map((label, i) => ({ id: `q${i + 1}`, label })),
});

// Plain hyperlink (article, podcast, app, book)
const link = (label, url, icon) => ({ type: 'link', url, label, icon: icon || '↗' });

// Dropbox video
const video = (label, url) => ({ type: 'link', url, label, icon: '🎬' });

// Dropbox audio
const audio = (label, url) => ({ type: 'link', url, label, icon: '🔊' });

// Dropbox PDF / printable
const pdf = (label, url) => ({ type: 'link', url, label, icon: '📄' });

// YouTube embed (renders thumbnail card)
const youtube = (label, url) => ({ type: 'youtube', url, label });

// ════════════════════════════════════════════════════════════════════════════════
// WEEK 1: Becoming Mindful I
// ════════════════════════════════════════════════════════════════════════════════

const WEEK_1 = [
  lesson(1, 1, 'Get Started', [
    info('This week you\'ll begin a dual practice: noticing what\'s happening inside you (thoughts, emotions, body sensations) and exploring how you show up with others. Each day follows a simple rhythm: a brief mindfulness practice, then a few prompts to reflect on what you noticed.'),
    ask('Why You Are Here', [
      'Why did you choose to join this program—why now?',
      'What qualities do you want to strengthen (e.g., patience, steadiness, compassion, clearer focus, ease under stress)?',
      'What do you hope will be different in you—or in how you meet your life after six weeks of this work? (Be realistic—small shifts count.)',
      'What helps you stay on course when you get pulled off track (habits, reminders, supports, boundaries)?',
    ]),
    info(HAPPIER_NOTE, 'Daily Practice'),
    info('For the next six weeks, we invite you into a daily mindfulness practice—short, consistent, and doable. The point isn\'t to stop thinking or achieve a blank mind. It\'s to notice what the mind is doing, return to the present moment when you realize you\'ve wandered, and gradually understand how reactivity works from the inside.', '"Waking Up" Practice'),
    ask('Before You Begin', [
      'What is your experience with meditation (if any), and what reactions come up for you about it?',
    ]),
    info('In the Happier app, navigate to Courses → The Basics → Session 1: "Get Started". Watch the 2-minute video, then listen to the 5-minute guided meditation.', 'Basics Session 1: "Get Started"'),
    ask('Reflection', [
      'Which benefits mentioned feel most relevant for you right now?',
      'How did this meditation meet your expectations—or differ from them?',
      'When you hear "It\'s natural for your mind to wander," what happens inside you (thoughts, feelings, relief, resistance)? There\'s no right answer—just notice.',
    ]),
    info('Anderson Cooper explores mindfulness meditation with researchers and practitioners, experiencing it firsthand and documenting the scientific evidence for its benefits (13 min).', '60 Minutes: Anderson Cooper learns mindfulness'),
    video('Watch the 60 Minutes segment', 'https://www.dropbox.com/s/9c7icv34mg0ubvk/Anderson%20Cooper%2060%20Minutes%20Special%20on%20Mindfulness%20Anderson%20Cooper.mp4?dl=0'),
    ask('After Watching', [
      'What surprised you about his experience?',
      'What still intrigues you or feels worth exploring?',
    ]),
  ]),

  lesson(1, 2, 'Clearing Your Mind', [
    ask('Begin with', [
      'What recurring thoughts have you noticed now that you\'ve begun this program?',
    ]),
    info('In the Happier app, open Basics Session 2: "Clearing Your Mind". Watch the brief opening video, then listen to the 5-minute meditation. When learning new skills, we often try to "fix" ourselves when we go off track. Here the instruction is different: notice, return, and begin again. Like training a puppy who keeps wandering off the path—you don\'t scold, you just gently bring them back, again and again, with patience.', 'Basics Session 2: "Clearing Your Mind"'),
    ask('Reflect', [
      'How does this idea land for you—especially the idea of returning without self-critique?',
      'Joseph suggests "delighting in the moment of remembering." What do you think he means by "delight" here? (If "delight" feels impossible right now, that\'s okay—just notice you\'ve returned.)',
      'How did noting the breath (In/Out or Rise/Fall) work for you?',
    ]),
    info('Each week you\'ll practice a relational process as a Listener in the BOR triads. This week\'s process is "seeing the loving essence"—recognizing the common humanity in the person in front of you. By this we mean: meeting the person in front of you as more than their opinions, personality, or behavior in the moment. It\'s an intentional shift from evaluation ("Do I agree? Do I like this?") toward respect ("A living person is here; I can meet them with presence").', 'Process of the Week: Seeing the Loving Essence'),
    info('In the BOR this week, before your partner begins speaking: pause for one breath, and silently acknowledge: "May I listen with openness; may I remember the good that lives in this person."', 'A Simple Practice'),
    ask('Reflection', [
      'What might get in the way of this practice for you, especially in conversation with someone you strongly disagree with?',
      'Where do you feel that difficulty in your body (tightness, heat, restlessness, numbness, etc.)?',
    ]),
    info('Listen to a short audio clip of Rick Rubin describing his personal ritual—an example of one person experimenting with "seeing the loving essence."', 'Example: Rick Rubin\'s Ritual'),
    video('Rick Rubin\'s ritual', 'https://www.dropbox.com/scl/fi/qrk0by6487gxlexji1frk/Rick-Rubin-ritual.mp4?rlkey=10xt8kl6lywo9hwar2gymmlzt&dl=0'),
    ask('Then reflect', [
      'What adjustment in attitude, like Rick\'s ritual, will support your listening this week?',
      'What intention will you set for how you show up—especially in the BOR triad?',
    ]),
  ]),

  lesson(1, 3, 'Behind the Waterfall', [
    info('In the Happier app, open Basics Session 3: "Behind the Waterfall". Metaphors can help us remember a skill. Dan and Joseph use "behind the waterfall"—observing the flow of thoughts without being swept away.', 'Basics Session 3: "Behind the Waterfall"'),
    ask('Reflect', [
      'How did this metaphor help you—and why?',
      'How do you usually react to body sensations (itch, ache, tingling, discomfort)?',
    ]),
    ask('After listening to the meditation', [
      'What was it like to use a body sensation as the object of meditation?',
      'What is your reaction to noticing sensations during ordinary moments (not just during meditation)?',
    ]),
    info('Before you watch, consider whether your usual way of thinking leans more toward the past or toward the future. What themes repeat most?', 'Jon Kabat-Zinn — Coming to Our Senses'),
    video('Coming to Our Senses with Jon Kabat-Zinn', 'https://www.dropbox.com/scl/fi/yzd83logs0pzskla7i118/Week-1-9-15-Coming-to-Our-Senses-with-Jon-Kabat-Zinn-PhD-Mod-1-week-3-excerpts.mp4?rlkey=h9ckyegane07jzuexn1g2kcon&dl=0'),
    ask('After watching', [
      'How did you relate to the idea that we spend large amounts of energy in mental activity when thoughts run the show?',
      'Where do you notice the urge to control life so it goes "your way"?',
      'What would it mean to practice letting things be as they are, at least for a moment?',
    ]),
    info('Topic: What did you discover about your mind this week? In each Zoom session, you will join 2 others in a speaking and listening exercise. When it is your turn to be the Speaker, draw on the range of experiences you\'ve had this week—steady practice, uneven practice, resistance, curiosity, relief, boredom. Whatever happened is useful data to share with your colleagues.', 'Topic of the Week (for the BOR triad)'),
    ask('Consider what you\'ll want to say', [
      'What has already happened for you in the course about the "topic of the week" that you want to remember to share with your Listener?',
      'You\'re practicing some new behaviors this week. List a few ways you can treat yourself with kindness as you learn something new.',
    ]),
  ]),

  lesson(1, 4, 'Finding the Time', [
    info('Many people, when the idea of meditation comes up, respond with a familiar refrain: "I don\'t have time." If that\'s you, there\'s no need to argue with it—just notice it.', 'Basics Session 4: "Finding the Time"'),
    ask('Reflect first', [
      'What would "I don\'t have time," protect you from?',
      'What does it assume?',
      'What reasons or excuses have shown up for you so far?',
      'Notice how most of us somehow find time for things we truly prioritize—emergency room visits, flights we can\'t miss, or meetings with consequences. What does this tell you about how the mind assigns priority?',
    ]),
    info('In the Happier app, watch the 2-minute introductory video, then listen to the meditation.', 'In the App'),
    ask('After', [
      'What benefits—however small—are you noticing? If none yet, what might be getting in the way?',
      'What sensations do you tend to push away or distract from?',
      'What is your reaction to Joseph\'s story about the long bus trip?',
      'Try the experiment he suggests for one unpleasant sensation, soften around it and "let it in" for a few breaths. What happens?',
    ]),
    ask('The Power of Mindfulness', [
      'How are you treating yourself during your mindfulness practice (patient, harsh, curious, impatient, perfectionistic, kind)?',
    ]),
    video('Shauna Shapiro — The Power of Mindfulness', 'https://www.dropbox.com/scl/fi/jogesi5nuaajgqgfswxvb/Shana-Shapiro-1.mp4?rlkey=u4ilagai9m28u9qrg8gw11i9h&dl=0'),
    ask('After watching', [
      'What comes to mind when you hear "what you practice grows stronger"?',
    ]),
    info('Bring one raisin, grape, or other small fruit. If you don\'t have any of these at home and can\'t easily get them, any small food item works—even a cracker or piece of chocolate. The practice will be about attention, not the specific food.\n\nPlanning ahead: Your meditations have been short this week. Starting next week they will be longer (about 15 minutes). For now, focus on consistency over duration, and choose a quiet location where you\'re unlikely to be interrupted. If you don\'t have a quiet space, remember: a parked car, bathroom, or even a closet with headphones can work.', 'For Tomorrow'),
  ]),

  lesson(1, 5, 'Respond, Not React', [
    info('Recall a recent interaction that didn\'t go the way you hoped. Choose something mild to moderate—this is practice, not therapy.', 'Basics Session 5: "Respond, not React"'),
    ask('Briefly recall', [
      'What did the mind do?',
      'What body sensations showed up—tension in shoulders, heat in face, tightness in chest?',
    ]),
    info('In the Happier app, watch the video, then listen to the meditation.', 'In the App'),
    ask('After', [
      'In what situations do you habitually react? How would you like to respond in those situations?',
      'When do you notice sleepiness or restlessness (in practice or in daily life)?',
      'What sensations or attitudes did you encounter? What was it like to investigate them with curiosity?',
    ]),
    ask('Experiment', [
      'Revisit the interaction you chose. Imagine meeting the urge to react with friendliness and curiosity. What new options become available to you?',
    ]),
    info('You joined Sacred Engagement because something about it spoke to you.', 'Your Motivation'),
    ask('If someone asked', [
      '"What does sacred engagement mean to you?"—how would you answer in your own words?',
    ]),
    info('Set aside about 4 minutes with no distractions. You\'ll move slowly and notice what happens in perception, sensation, and thought.\n\n1. Examine the raisin with your eyes and fingers (color, texture, light, shape).\n2. Bring it close to your nose and smell. Notice if the body starts preparing to eat.\n3. Place it in your mouth (or take a small bite). Notice initial taste and saliva.\n4. Chew slowly. Notice how flavor changes, how attention changes, and when swallowing happens.', 'Mindful Eating Activity (raisin or fruit)'),
    audio('Guided Raisin Activity', 'https://www.dropbox.com/s/499b4pd702mcm86/Raisin%20Activity.m4a?dl=0'),
    ask('Reflection', [
      'What surprised you about this exercise?',
      'What did you learn about how you eat—or more broadly, how you move through life?',
    ]),
  ]),

  lesson(1, 6, 'Challenges to Meditating', [
    ask('Begin', [
      'Where do you notice an inner "dictator" voice (pressure, critique, perfectionism, impatience)?',
    ]),
    info('In the Happier app, open Basics Session 6: "Challenges to Meditating". Watch the video, then listen to the meditation.', 'Basics Session 6: "Challenges to Meditating"'),
    ask('After', [
      'What\'s your reaction to Joseph\'s claim about boredom?',
      'What did you discover by watching thoughts and gently labeling/noting them?',
      'What are your "long trains" of thought—topics that hook you and carry you away?',
    ]),
    info('Mental noting is a simple way to name what\'s happening (thinking, planning, remembering, judging, hearing, feeling) without getting lost in the content of what\'s happening. The goal isn\'t to catalog everything; it\'s to re-establish awareness.\n\nMental noting is like narrating a nature documentary about your own mind. Instead of getting lost in the movie, you become the voice-over: "And here we see the subject having a worried thought… now planning… now remembering…"\n\nMental noting should be light and easy, not rigid. If noting becomes compulsive or anxiety-producing, that\'s a signal to ease up or drop it entirely for that session. The noting is serving you; you\'re not serving the noting.', 'Mental Noting'),
    link('Read: Mental Noting (Insight Meditation Center)', 'https://www.insightmeditationcenter.org/books-articles/mental-noting/'),
    ask('Reflect on noting', [
      'Which benefits of noting do you want to lean into?',
      'Which pitfalls do you want to watch for (e.g., over-efforting, judging, turning practice into a checklist)?',
    ]),
    info('In the Breakout Room (BOR) triads you\'ll rotate through three roles: Observer, Listener, and Speaker. This week the Listener practices Seeing the Loving Essence; the Speaker explores the Topic of the Week; the Observer assists the roles and timing. Before the Zoom session, review the Appendix: BOR instructions, and the BOR journal pages attached to this guide.', 'BOR Prep and Refresher'),
  ]),

  lesson(1, 7, 'Keep It Going', [
    info('As you continue with the app, you may receive subscription invitations. Your guest pass covers everything you need for Sacred Engagement—no additional purchase is necessary. You can decide about subscribing later if you wish.', 'Basics Session 7: "Keep it Going"'),
    ask('Begin', [
      'What is your attitude toward answering written prompts before and after practice?',
    ]),
    info('You\'ve completed a full week of daily practice. That itself is worth acknowledging. Today we explore emotions more directly. If this feels too big to explore right now, start with something smaller—perhaps a mild annoyance or brief discomfort. You can work up to larger emotions gradually.', 'A Note Before You Begin'),
    ask('What\'s present', [
      'What emotion do you already know you tend to avoid or suppress?',
    ]),
    info('In the Happier app, watch the video, then listen to the meditation.', 'In the App'),
    ask('After listening', [
      'Did you notice a thought → emotion sequence? If so, what was it like?',
      'Where did the emotion show up in the body (if it did)?',
      'What story (if any) was attached to the emotion?',
      'What changes when you locate emotion in the body and stay with sensation, rather than getting pulled into the story?',
    ]),
    info('Notice the language you (and nearly everyone) use to describe inner experience: "I\'m angry," "I\'m exhausted," "I\'m excited."\n\nChoose a current inner circumstance and say silently to yourself, several times: "I\'m ___."\n\nNow pause. Notice very carefully any subtle shifts—sensations in the body, changes in mood, tightening or softening, contraction or ease.\n\nNext, take the same circumstance and change the way you describe it from "I am…" to "I have anger." "I have exhaustion." "I have excitement."\n\nWhat happens inside when you form this slightly different description?\n\nYou could also try: "I am aware of anger." Or an even more objective phrasing: "Anger is arising." "Hunger is showing up."', 'The "I" That is Aware'),
    ask('Reflect', [
      'Describe what changes for you when you stand back and observe your feelings—rather than claim them as "me," or get pulled into their stories, justifications, and momentum.',
    ]),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    youtube('Jon Kabat-Zinn — Public Talk', 'https://www.youtube.com/watch?v=RnLRhHulcDU&t=13s'),
    link('Harvard Gazette: A Wandering Mind is Not a Happy Mind', 'https://news.harvard.edu/gazette/story/2010/11/wandering-mind-not-a-happy-mind/'),
    youtube('Ronald & Mary Hulnick — "Seeing the Loving Essence"', 'https://youtu.be/xeCXhXDkzpw'),
    link('Loyalty to Your Soul — Hulnicks (book)', 'https://www.amazon.com/Loyalty-Your-Soul-Spiritual-Psychology/dp/1401927289/'),
    youtube('Anderson Cooper + Jon Kabat-Zinn follow-up', 'https://youtu.be/3g6lPOHtjl0?si=9pcxdgUVntqnDBmX'),
    link('Ezra Klein & Rick Rubin — full interview transcript', 'https://www.nytimes.com/2023/02/10/podcasts/ezra-klein-show-transcript-rick-rubin.html'),
    link('The Creative Act: A Way of Being — Rick Rubin (book)', 'https://www.amazon.com/Creative-Act-Way-Being/dp/0593652886/'),
    video('Rick Rubin — 60 Minutes interview', 'https://www.dropbox.com/s/asjdazfu5kjref2/Rick%20Rubin%20The%2060%20Minutes%20Interview.mp4?dl=0'),
  ]),
];

// ════════════════════════════════════════════════════════════════════════════════
// WEEKS 2-6: Skeletons + embedded resource links
// (Detailed prompts can be filled in week-by-week — ask Claude to expand any week)
// ════════════════════════════════════════════════════════════════════════════════

function skeletonWithLinks(week, day, title, extraBlocks = []) {
  return lesson(week, day, title, [
    info(HAPPIER_NOTE, 'Daily Practice'),
    ...extraBlocks,
    ask('Daily Reflection', [
      'What stood out from today\'s meditation or reading?',
      'What did you notice in your body, thoughts, or emotions?',
      'What do you want to carry forward into tomorrow?',
    ]),
  ]);
}

// ─── WEEK 2: Becoming Mindful II ────────────────────────────────────────────────
const WEEK_2 = [
  skeletonWithLinks(2, 1, 'Hide The Zen'),
  skeletonWithLinks(2, 2, 'Will Meditation Kill My Edge?', [
    info('Practice "engaged listening" — following, "tell me more," summarizing. Watch the demonstrations below.', 'Process of the Week: Engaged Listening'),
    video('Positive demonstration', 'https://www.dropbox.com/scl/fi/btb2ildn7dyzw4c9c7csn/Positive-demo-1.2.2.mp4?rlkey=if11874qpoppckqir2ae8zbd8&dl=0'),
    video('Negative demonstration', 'https://www.dropbox.com/scl/fi/x9cq3zdw8c5wc22hwjps8/Negative-Demo-1.2.2.mp4?rlkey=sg9kf9gtjp6gxc3mpfrspslif&dl=0'),
  ]),
  skeletonWithLinks(2, 3, 'Don\'t Force It', [
    link('Listen: Cory Muscara — How to Be a Better Listener (podcast)', 'https://practicinghuman.buzzsprout.com/597910/12286715-how-to-be-a-better-listener?t=020th'),
  ]),
  skeletonWithLinks(2, 4, 'Presence v Mindfulness', [
    link('Read: Huffington Post — Do You Know How Powerful…', 'https://www.huffpost.com/entry/do-you-know-how-powerful_b_4705523'),
  ]),
  skeletonWithLinks(2, 5, 'Non-Attachment to Results', [
    video('Daron Larson — Don\'t try to be mindful (TEDx Columbus)', 'https://www.dropbox.com/scl/fi/enz6ozk185320oydp802m/Don-t-try-to-be-mindful-Daron-Larson-TEDxColumbus.mp4?rlkey=z8dwmmdlqry6q2a4fp5r3ou19&dl=0'),
  ]),
  skeletonWithLinks(2, 6, 'Attachment vs. Love', [
    video('Jon Kabat-Zinn & Surgeon General Vivek Murthy on polarity', 'https://www.dropbox.com/scl/fi/qvhcl8w2pao0gf3xw1gs6/JKZ-VMurthy-on-polarity-5-19.mp4?rlkey=yf7f6gqr06j7nks25wujrjm2q&dl=0'),
    video('Observer demo', 'https://www.dropbox.com/scl/fi/y25epgoz9emt7ulpi904c/Observer-Demo-1.2.6.mp4?rlkey=l9ozkozp1e4ywvx6quqja8g68&dl=0'),
  ]),
  lesson(2, 7, 'The Case for Kindness', [
    info(HAPPIER_NOTE, 'Daily Practice'),
    ask('Daily Reflection', [
      'What stood out from today\'s meditation or reading?',
      'What did you notice about kindness this week—toward yourself and toward others?',
      'What do you want to carry forward into next week?',
    ]),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    youtube('Resource video', 'https://www.youtube.com/watch?v=vWesEj9gKCc'),
    youtube('Resource video', 'https://www.youtube.com/watch?v=8lgWA4DpbBA'),
    video('The Power of Mindfulness — Surgeon General Dr. Vivek Murthy & Jon Kabat-Zinn (full)', 'https://www.dropbox.com/scl/fi/g82i6jt1a814ggaepx6sd/Full-video-of-The-Power-of-Mindfulness-with-Surgeon-General-Dr.-Vivek-Murthy-and-Jon-Kabat-Zinn.mp4?rlkey=z2okuozs3h9ticnc7kaavm52m&dl=0'),
  ]),
];

// ─── WEEK 3: Exploring Habits I ─────────────────────────────────────────────────
const WEEK_3 = [
  skeletonWithLinks(3, 1, 'Learning from Strong Urges'),
  skeletonWithLinks(3, 2, 'Kindness for Judgy Thoughts', [
    info('Practice perception checking. Watch demonstrations and example practices.', 'Process of the Week: Perception Checking'),
    video('Positive demo', 'https://www.dropbox.com/scl/fi/fob4992l73hzmlkghgmtk/Positive-Demo-1.3.2.mp4?rlkey=6guxsjnivvmdj10si19i4ybng&dl=0'),
    video('Negative demo', 'https://www.dropbox.com/scl/fi/o0s04yr29us9hrwsngp76/Negative-Demo-1.3.2.mp4?rlkey=8ptxr5zu4jdcwx5rfnty3aoa7&dl=0'),
    video('Practice 1 — too much', 'https://www.dropbox.com/scl/fi/0yqqarnka975xjw26aw06/Practice-1-too-much.mp4?rlkey=ouqrbw881o30ate5ik7xehlzp&dl=0'),
    video('Practice 2 — parrot', 'https://www.dropbox.com/scl/fi/xeiubcunbc0c3zfcxhexg/Practice-2-parrot.mp4?rlkey=unznla6m394y8tglmau1jzlpe&dl=0'),
    video('Practice 3 — subtle evaluation', 'https://www.dropbox.com/scl/fi/n3klh3ccnbqdllh7r8rin/Practice-3-Subtile-Evaluation.mp4?rlkey=0qsk3h0bqt0b6l8ylif9mmfs9&dl=0'),
    video('Practice 4 — overt evaluation', 'https://www.dropbox.com/scl/fi/6qc70asxuh8algxh8l7ez/Practice-4-Overt-Evaluation.mp4?rlkey=ufo94a64ldom5n2brzw9dchtc&dl=0'),
    video('Practice 5 — talk about yourself', 'https://www.dropbox.com/scl/fi/hrmaei9ddp6o0n5ct9h3z/Practice-5-Talk-about-yourself.mp4?rlkey=p0ya0fweld5t215umnn4qg2yp&dl=0'),
    video('Practice 6 — wrong content', 'https://www.dropbox.com/scl/fi/tx220k5ufsd3goscqsxzt/Practice-6-wrong-content.mp4?rlkey=d6htutjztesy9qbp5ahvdk3h2&dl=0'),
    pdf('Answer sheet', 'https://www.dropbox.com/scl/fi/tkcpbx28264e1oj5ql5yo/Mod_1_Wk_3_Answer-Sheet.pdf?rlkey=4zv0celscwhp70otehh8d4wds&dl=0'),
  ]),
  skeletonWithLinks(3, 3, 'Understanding Desire', [
    video('Hacking Your Brain\'s "Reward System" to Change Habits', 'https://www.dropbox.com/s/yk54cz7lsaxgr2w/Hacking%20Your%20Brain%E2%80%99s%20%E2%80%9CReward%20System%E2%80%9D%20to%20Change%20Habits.mp4?dl=0'),
  ]),
  skeletonWithLinks(3, 4, 'Simple Body Scan'),
  skeletonWithLinks(3, 5, 'Dismantling Perfectionism'),
  skeletonWithLinks(3, 6, 'Going Deeper, Seeing Change', [
    info('Continue perception-checking practice with these demos.', 'Practice Demonstrations'),
    video('1.3.6 Practice 1', 'https://www.dropbox.com/scl/fi/2oa43y6ou8weihj18ph9b/1.3.6-Practice-1.mp4?rlkey=bgbe974ushd75ovjk3pftcutn&dl=0'),
    video('1.3.6 Practice 2', 'https://www.dropbox.com/scl/fi/w5cqhmv2yhiqrinagxp9z/1.3.6-Practice-2.mp4?rlkey=djp1g9ar18391vg79jcr123t6&dl=0'),
    video('1.3.6 Practice 3', 'https://www.dropbox.com/scl/fi/96v2vb56yzv8zrncwu1hy/1.3.6-practice-3.mp4?rlkey=a30du7oit26si8odvn0ossrfn&dl=0'),
    video('1.3.6 Practice 4', 'https://www.dropbox.com/scl/fi/hpjxjf9ad3hmpl7tqj3wx/1.3.6-Practice-4.mp4?rlkey=iqro77lpbq6nn5pfioqmu8z24&dl=0'),
    video('1.3.6 Practice 5', 'https://www.dropbox.com/scl/fi/k3bh6wsdhfpyrkiks220z/1.3.6-Practice-5.mp4?rlkey=det9rp0k0qng4vjx0z3bifdg2&dl=0'),
    video('1.3.6 Practice 6', 'https://www.dropbox.com/scl/fi/exl2u1vyclwon5de96787/1.3.6-Practice-6.mp4?rlkey=84hk3ouh5f21e1px0ksgb4mrb&dl=0'),
  ]),
  lesson(3, 7, 'Find Comfort in Self Compassion', [
    info(HAPPIER_NOTE, 'Daily Practice'),
    ask('Daily Reflection', [
      'What habit-loops did you notice this week?',
      'Where did self-compassion soften an old pattern?',
      'What do you want to carry forward into next week?',
    ]),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    youtube('Judson Brewer — TED talk on habit loops', 'https://www.youtube.com/watch?v=2teP3DJKxaA&list=PLbiVpU59JkVbNfFyAG4SrC8NGnC0-D4jg&index=3'),
    youtube('Judson Brewer — related talk', 'https://www.youtube.com/watch?v=noXzaSRHWuw&t=9s'),
    link('Dr Jud — A Simple Way to Break a Bad Habit', 'https://drjud.com/a-simple-way-to-break-a-bad-habit/'),
    link('Dr Jud — website', 'https://drjud.com/#home-third'),
  ]),
];

// ─── WEEK 4: Exploring Habits II ────────────────────────────────────────────────
const WEEK_4 = [
  skeletonWithLinks(4, 1, 'Body Scan for Deep Relaxation'),
  skeletonWithLinks(4, 2, 'Habits of Resistance or Aversion', [
    link('Optional: Insight Timer meditation', 'https://insig.ht/JZ1712GzqCb?utm_source=copy_link&utm_medium=content'),
    info('Practice perception checking — fine points. Watch the example videos.', 'Process of the Week: Perception Checking (fine points)'),
    video('1.4.2 – 1a (vehicle down)', 'https://www.dropbox.com/scl/fi/mfj3fvivrgclh742mzgd5/1.4.2-1a-VD.mp4?rlkey=dswbi9romc5pklyta6expzgwp&dl=0'),
    video('1.4.3 – 1a (vehicle up)', 'https://www.dropbox.com/scl/fi/evitg5nfz3kr2o6nyv1cy/1.4.3-1a-example-VU.mp4?rlkey=gcf7jdxjsmfu449kk6ld8kwr3&e=1&dl=0'),
    video('1.4.3 – 2 (down)', 'https://www.dropbox.com/scl/fi/jx6l2y3py71wx459otujj/1.4.3-2-example-VD.mp4?rlkey=aztrctzc3hnvzk1kvma3wb7yp&dl=0'),
    video('1.4.3 – 2 (up)', 'https://www.dropbox.com/scl/fi/zrf83ajppmvo0bkim5xqi/1.4.3-2-example-VU.mp4?rlkey=30o8j44s7u2g8n2nj3um3g84h&dl=0'),
    video('1.4.3 – 3 (down)', 'https://www.dropbox.com/scl/fi/nks09sl5a2srx3lf04a4k/1.4.3-3-example-VD.mp4?rlkey=44o3e9h7foo4jkl2z50rpvdlk&dl=0'),
    video('1.4.3 – 3 (up)', 'https://www.dropbox.com/scl/fi/qj81osmo0k4tgpuwgo7f7/1.4.3-3-example-VU.mp4?rlkey=cm23lf9yrttltoxx55vy3n5hm&dl=0'),
    video('1.4.3 – 4 (up)', 'https://www.dropbox.com/scl/fi/ex9uhp97nq0ff51a899aj/1.4.3-4-example-VU.mp4?rlkey=u68ss6evoej4i6gchjj7i4w14&dl=0'),
    video('1.4.3 – 4 (down)', 'https://www.dropbox.com/scl/fi/7eqtp7qscd00vvd6o6lfu/1.4.3-4-example-VD.mp4?rlkey=dha8g7b7n5hpnot2vfn5f8m9y&dl=0'),
  ]),
  skeletonWithLinks(4, 3, 'Polarization Fatigue', [
    link('Dr Jud — Good vs. Bad Habits', 'https://drjud.com/good-vs-bad-habits/'),
    link('Center for Healthy Minds (HMI)', 'https://hminnovations.org/'),
    link('Humin Wellbeing App', 'https://www.humin.org/wellbeing-tools/app'),
  ]),
  skeletonWithLinks(4, 4, 'Three Steps to Self-Compassion'),
  skeletonWithLinks(4, 5, 'I\'m Still Bored', [
    video('Tara Brach — Surrender to the Monkeys', 'https://www.dropbox.com/s/kg4viii5eqzljun/Tara%20and%20Monkeys.mp4?dl=0'),
  ]),
  skeletonWithLinks(4, 6, 'Loving Kindness for the Body', [
    video('Observer demo', 'https://www.dropbox.com/scl/fi/2kry70re0wrtzkbj45fxz/1.4.6-observer-demo.mp4?rlkey=mpydgbvf2otco85sx7g9cdkqb&dl=0'),
    link('🙏 Support Sacred Engagement (donate)', 'https://www.paypal.com/donate/?hosted_button_id=L2P56UX8FZ6M8'),
    link('Vanderbilt Brain Institute', 'https://medschool.vanderbilt.edu/brain-institute/'),
    link('RoundGlass Living', 'https://roundglassliving.com/'),
  ]),
  lesson(4, 7, 'Body Scan for Anxiety', [
    info(HAPPIER_NOTE, 'Daily Practice'),
    ask('Daily Reflection', [
      'What did you notice in your body during the scan?',
      'Where does anxiety tend to live for you?',
      'What do you want to carry forward into next week?',
    ]),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    link('Vimeo — supporting reflection', 'https://vimeo.com/39767361'),
    youtube('Resource video', 'https://www.youtube.com/watch?v=Gn7YvcOuCgY'),
    link('Tuesdays with Morrie — Mitch Albom (book)', 'https://www.amazon.com/Tuesdays-Morrie-Greatest-Lesson-Anniversary/dp/076790592X/'),
    video('Body Scan Meditation — Jon Kabat-Zinn', 'https://www.dropbox.com/scl/fi/3w4pvh5o7kb4bpmc46iu4/Body-Scan-Meditation-Jon-Kabat-Zinn.mp4?rlkey=txdlvzimmelbm9onl64qz4ec1&dl=0'),
  ]),
];

// ─── WEEK 5: Investigating Information from Emotions and Sensations I ──────────
const WEEK_5 = [
  skeletonWithLinks(5, 1, 'Self-Worth', [
    link('Humin Wellbeing App', 'https://www.humin.org/wellbeing-tools/app'),
  ]),
  skeletonWithLinks(5, 2, 'Valuing Friendship', [
    info('Practice working with challenges to perception checking.', 'Process of the Week'),
    video('Perception checking — interruption demo', 'https://www.dropbox.com/scl/fi/2p8cip7ilkfgd84g7if1o/Demo-1.5.2-interruption.mp4?rlkey=i08erfy1amp63rio8t29usoya&dl=0'),
  ]),
  skeletonWithLinks(5, 3, 'Receiving Kindness', [
    audio('Ice Cube Exercise (guided audio)', 'https://www.dropbox.com/scl/fi/kmwbiaf9c2ch0pqj8ooic/IceCube-Exercise.mp3?rlkey=pjyyszqr58hi5vwahqplhg3s5&dl=0'),
  ]),
  skeletonWithLinks(5, 4, 'Kindness Outside Our Circle', [
    video('Joan Rosenberg — Tools for Emotional Mastery', 'https://www.dropbox.com/scl/fi/1a1vipwuurba3rvkn3nnb/Joan-Rosenberg.mp4?rlkey=w5rv94xztoc9ez5h9mtqnf8d1&st=pn09nerk&dl=0'),
  ]),
  skeletonWithLinks(5, 5, 'Kindness Is Natural', [
    video('Five-finger exercise', 'https://www.dropbox.com/scl/fi/p9ht2rju0fi8oicg03ut7/Five-finger-exercise.mp4?rlkey=qg6w2iqhn6elrufcuemt45x2r&dl=0'),
  ]),
  skeletonWithLinks(5, 6, 'Compassion for Strangers', [
    link('🙏 Support Sacred Engagement (donate)', 'https://www.paypal.com/donate/?hosted_button_id=L2P56UX8FZ6M8'),
  ]),
  lesson(5, 7, 'Compassion for all Beings', [
    info(HAPPIER_NOTE, 'Daily Practice'),
    ask('Daily Reflection', [
      'How have kindness and compassion shown up for you this week?',
      'What did you notice when you turned compassion toward yourself?',
      'What do you want to carry forward into next week?',
    ]),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    link('Dharma Lab podcast', 'https://podcasts.apple.com/us/podcast/dharma-lab/id1829330676?i=1000743179099'),
    youtube('Related talk', 'https://www.youtube.com/watch?v=7CBfCW67xT8&t=604s'),
    link('Washington Post — Stress, Chronic Illness, Aging', 'https://www.washingtonpost.com/health/interactive/2023/stress-chronic-illness-aging/'),
    link('NYT Opinion — Social Skills, Connection', 'https://www.nytimes.com/2023/10/19/opinion/social-skills-connection.html'),
    link('The One You Feed — Unlock the Power of Deeper Connections', 'https://omny.fm/shows/the-one-you-feed/how-to-unlock-the-power-of-deeper-connections-with'),
    video('Richie Davidson — Science of Joy (Mission JOY excerpt)', 'https://www.dropbox.com/s/q7x5s25p6pnuwtw/Richie%20Davidson%20on%20the%20Science%20of%20Joy%20%E2%80%A2%20Mission%20JOY%20%E2%80%A2%20Documentary%20Excerpt.mp4?dl=0'),
    video('Tara Brach — Guided RAIN meditation', 'https://www.dropbox.com/s/flxsczw8y6k3ikm/Tara%20Brach%20leads%20a%20Guided%20Meditation%20The%20Practice%20of%20RAIN.mp4?dl=0'),
  ]),
];

// ─── WEEK 6: Investigating Information from Emotions and Sensations II ─────────
const WEEK_6 = [
  skeletonWithLinks(6, 1, 'It\'s Just Experience'),
  skeletonWithLinks(6, 2, 'Observing Inner Experience', [
    info('Perception Checking with strong emotions — listen to these example tracks.', 'Practice Audio'),
    audio('Irresponsible — Version A', 'https://www.dropbox.com/scl/fi/x9yzoi2qlfddj46i73fnd/Irresponsible-A.m4a?rlkey=rwn4wexecuxmzicep1up7jqfy&dl=0'),
    audio('Irresponsible — Version B', 'https://www.dropbox.com/scl/fi/j44brbdkwfnusk995o5gc/Irresponsible-B.m4a?rlkey=7uw6vhjkpopa28tryauh9bbjj&dl=0'),
  ]),
  skeletonWithLinks(6, 3, 'What Are Thoughts Made Of', [
    info('David Whyte — Beautiful Questions, Part 1', 'Beautiful Questions'),
    audio('Solace Part 1 — audio', 'https://www.dropbox.com/scl/fi/zzkbb1cbso0l7j58u39at/Solace.Part-1.mp3?rlkey=l0lno4qfai10ytlasllamdcuj&dl=0'),
    pdf('Solace Part 1 — text', 'https://www.dropbox.com/scl/fi/aawtnx0vb1ggk4m8p1nxp/Solace.Part-1.pdf?rlkey=17fep1ifqvxzpuyz5srmdddp3&dl=0'),
  ]),
  skeletonWithLinks(6, 4, 'Exploring Emotions', [
    info('David Whyte — Beautiful Questions, Part 2', 'Beautiful Questions'),
    audio('Solace Part 2 — audio', 'https://www.dropbox.com/scl/fi/2pcr8o3sq3ccszjjjxq0v/Solace.Part-2.mp3?rlkey=li868m3dpi6cbvrx5x591o8nb&dl=0'),
    pdf('Solace Part 2 — text', 'https://www.dropbox.com/scl/fi/9rsd1vk48vshiw50nvko8/Solace.Part-2.pdf?rlkey=clue2j73v5ku31jy30rdymuaq&dl=0'),
  ]),
  skeletonWithLinks(6, 5, 'The Push and Pull of Emotions', [
    audio('David Whyte — Tobar Phadriac', 'https://www.dropbox.com/scl/fi/it12e38dcm8m3vvwh67w6/Tobar-Phadriac-by-David-Whyte-2.mp3?rlkey=1neomvqniad2ckb0d0osdxtya&dl=0'),
  ]),
  skeletonWithLinks(6, 6, 'The Calm Presence of Awareness', [
    link('Zoom — Alumni Gathering', 'https://us02web.zoom.us/j/89198025042'),
    link('🙏 Support Sacred Engagement (donate)', 'https://www.paypal.com/donate/?hosted_button_id=L2P56UX8FZ6M8'),
  ]),
  lesson(6, 7, 'Lovingkindness', [
    info(HAPPIER_NOTE, 'Daily Practice'),
    video('Sharon Salzberg — Lovingkindness meditation', 'https://www.dropbox.com/scl/fi/da66gmdrglu88edixzwq2/Meditation-sharon-M1W6.mp4?rlkey=m6lkob97udf47n377br8fxrrh&dl=0'),
    ask('Closing Reflection', [
      'Looking back across these six weeks, what has shifted in you—even slightly?',
      'What practices do you want to keep going?',
      'What feels worth carrying into Module 2?',
    ]),
    info('Sacred Engagement is a multi-module journey. When you\'re ready, Module 2 deepens this work into "Clearing Away" — meeting the inner patterns and voices that shape how you engage.', 'Next Steps'),
    link('sacredengagement.org', 'http://sacredengagement.org/'),
    info('Optional material to deepen understanding:', 'Additional Resources'),
    link('Ellen Langer — Pursuit of Happiness', 'https://www.pursuit-of-happiness.org/history-of-happiness/ellen-langer/'),
    link('TED — David Whyte: A Lyrical Bridge', 'https://www.ted.com/talks/david_whyte_a_lyrical_bridge_between_past_present_and_future?language=en'),
    link('Talk Easy — Ava DuVernay', 'https://talkeasypod.com/ava-duvernay/'),
    link('Hidden Brain — Finding Focus', 'https://hiddenbrain.org/podcast/finding-focus'),
    info('Meditation apps you might explore:', 'Apps & Practice Resources'),
    link('Ten Percent Happier', 'https://www.tenpercent.com/'),
    link('Healthy Minds Innovations app', 'https://hminnovations.org/meditation-app'),
    link('Dan Harris membership app', 'http://app.danharris.com/membership'),
    link('Tara Brach — guided meditations', 'https://www.tarabrach.com/guided-meditations/'),
    link('Calm', 'https://www.calm.com/'),
    link('Headspace', 'https://www.headspace.com/'),
    link('Insight Timer', 'https://insighttimer.com/'),
    link('Aura', 'https://www.aurahealth.io/'),
    link('Pause Breathe Reflect', 'https://www.pausebreathereflect.com/pages/pbrapp'),
    link('The Mindfulness App', 'https://www.themindfulnessapp.com/'),
    link('The Way', 'https://www.thewayapp.com/?source=uk_traffic'),
    link('Waking Up', 'https://www.wakingup.com/'),
    link('David Whyte — Solace (audio)', 'https://davidwhyte.com/store/audio/solace/'),
  ]),
];

module.exports = [...WEEK_1, ...WEEK_2, ...WEEK_3, ...WEEK_4, ...WEEK_5, ...WEEK_6];
