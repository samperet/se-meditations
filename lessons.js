module.exports = [

  // ─── SECTION 1 ───────────────────────────────────────────────────────────────

  {
    id: 's1_l1', sectionId: 1, lessonNumber: 1, isCompanion: false,
    title: 'Exploring Basic Goodness',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L1_Touching_What_Is_Here_DK.m4a' },
    blocks: [
      { type: 'info', content: "You're beginning with the most fundamental thing—not what needs to change, but what might already be good in you." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What did you touch into, even briefly?' },
        { id: 'med2', label: 'What felt most alive or most resistant?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'How does your sense of worth tend to shift between a day when things go well and a day when they don\'t?' }
      ]},
      { type: 'questions', title: 'Practice: The Earning Question',
        intro: 'Think of a recent moment when you felt good about yourself—maybe you accomplished something, helped someone, or handled a situation well.',
        questions: [
          { id: 'p1', label: 'What made you feel worthy in that moment?' },
          { id: 'p2', label: 'What would have happened to that good feeling if you had failed or messed up?' }
        ]
      },
      { type: 'questions', intro: 'Now think of the flip side. Recall a recent moment when you felt bad about yourself.', questions: [
        { id: 'p3', label: 'What did you believe about your worth in that moment?' },
        { id: 'p4', label: 'Did you feel like you had lost something? If so, what?' },
        { id: 'p5', label: 'What do you notice as you look at what you\'ve written? Is there a pattern here—a system of "earning" that\'s been running quietly? What did you find?' }
      ]},
      { type: 'questions', title: 'Touching Basic Goodness',
        intro: 'Close your eyes. Think of yourself as a very young child—maybe 2 or 3 years old. Before you learned about achievement, before you knew about success or failure, before you understood earning or deserving—you were simply alive, simply here. Consider the possibility that this child had inherent worth. Not because of what they accomplished. Simply because they existed.',
        questions: [
          { id: 'tbg', label: 'What happens inside when you consider that you\'re okay — right now, as you are? What arises when you try to touch this?' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'Today, practice noticing when the conditional worth story shows up: "I am good because…" "I am worthy when…" When you notice it, pause. Say quietly: "My goodness is not earned." You don\'t have to believe it fully. Just practice touching the possibility.' }
    ]
  },

  {
    id: 's1_l2', sectionId: 1, lessonNumber: 2, isCompanion: false,
    title: 'The Weather and The Sky',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L2_You_Are_The_Sky_BW.m4a' },
    blocks: [
      { type: 'info', content: "Yesterday you touched your basic goodness. Today you explore perspective—what if you are made of something that can hold any experience." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What are you experiencing right now? (Thoughts? Emotions? Body sensations?)' },
        { id: 'med2', label: 'What was it like to have some silence?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Think of a strong emotion from the past few days. While it was happening, was there any part of you that was simply watching it?' }
      ]},
      { type: 'questions', title: 'Practice: Sky Gazing',
        intro: 'Step 1 — Close your eyes and notice what is present: what thoughts, emotions, sensations. Name each one: "Worry is here. Tension is here. Planning is here."',
        questions: [
          { id: 'p1', label: 'Write the internal weather report — what is present right now?' }
        ]
      },
      { type: 'info', content: 'Step 2 — Ask: What is aware of all this? What is your sense of the spaciousness that holds all these experiences?\n\nStep 3 — Rest as Sky: If possible, go outside and watch the clouds for 5–10 minutes. As you watch, notice: the sky holds everything. The weather changes. The sky is just, there.\n\nStep 4 — Take a contemplative 3–5 minutes to rest as the spaciousness that holds everything. Not trying to change your weather. Just being the space in which it appears.' },
      { type: 'questions', questions: [
        { id: 'p2', label: 'What did you notice during this rest? (thoughts, feelings, sensations)' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, when strong emotion arises, pause. Say silently: "This is weather. I am the sky." You don\'t have to make the emotion disappear. See if you can touch the possibility: you might be the space that can hold it.' }
    ]
  },

  {
    id: 's1_l3', sectionId: 1, lessonNumber: 3, isCompanion: false,
    title: 'What Self-Compassion Actually Means',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L3_ Meeting_Yourself_With_Kindness_DK.m4a' },
    blocks: [
      { type: 'info', content: "You've touched your basic value and discovered yourself as the sky. Now you try something different: what happens when you meet yourself with compassion instead of criticism—especially when things are difficult?" },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What arose when you encountered yourself?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'When you\'re going through something hard, what do you typically say to yourself? How does that compare to what you\'d say to a friend in the same situation?' }
      ]},
      { type: 'questions', title: 'Practice: The Compassion Gap', questions: [
        { id: 'p1', label: 'Think of someone you care about who is struggling. What would you say to them?' },
        { id: 'p2', label: 'Now think of yourself struggling similarly. What do you actually say to yourself?' },
        { id: 'p3', label: 'What might make it easier to be compassionate toward others than toward yourself?' }
      ]},
      { type: 'questions', title: 'After Watching the Video',
        intro: 'Watch the Kristin Neff 4-minute video on self-compassion, then return here.',
        questions: [
          { id: 'v1', label: 'What resonated?' },
          { id: 'v2', label: 'What challenged you?' }
        ]
      },
      { type: 'questions', title: 'Practice Drill: The Self-Compassion Break',
        intro: 'Do these steps one-at-a-time:\n1. Think of something mildly difficult right now.\n2. Notice where you feel it in your body. Place your hand there.\n3. Speak the following three phrases slowly:\n   a. "This is hard." or "This is a moment of difficulty."\n   b. "Difficulty is part of life." or "I am not alone in this."\n   c. "May I be kind to myself." or "May I give myself compassion."\n4. Repeat 2–3 times.',
        questions: [
          { id: 'p4', label: 'What happened for you?' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'Today, when you catch yourself being harsh, pause and ask: "What would I say to a friend?" Try saying that to yourself instead.' }
    ]
  },

  {
    id: 's1_l4', sectionId: 1, lessonNumber: 4, isCompanion: false,
    title: 'Your Needs Matter',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L4_Listening_To_What_Is_Needed_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've been building resources: goodness, perspective, compassion. Now you turn to something you may not have looked at closely: your needs." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What showed up during this meditation, if anything?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Where are you running on empty right now?' }
      ]},
      { type: 'questions', title: 'Practice: What Do You Need?',
        intro: 'List and comment on what you genuinely need more of right now:',
        questions: [
          { id: 'p1', label: 'Physical needs (e.g. sleep, movement, rest):' },
          { id: 'p2', label: 'Emotional needs (e.g. to be heard, to express):' },
          { id: 'p3', label: 'Relational needs (e.g. connection, solitude, boundaries):' },
          { id: 'p4', label: 'Creative/Spiritual needs (e.g. meaning, beauty, purpose):' },
          { id: 'p5', label: '"Today I will honor my need for _____ by _____." (choose one need and name one concrete action)' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'Today, do the one thing you named above. Not as self-indulgence but as basic self-care.' }
    ]
  },

  {
    id: 's1_l5', sectionId: 1, lessonNumber: 5, isCompanion: false,
    title: 'Befriending Your Inner Landscape',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L5_Welcoming_What_Is_Here_DK.m4a' },
    blocks: [
      { type: 'info', content: "You've been gathering resources. Now you explore a way of being with yourself that many people find helps: befriending instead of fighting." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What kept showing up?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Is there something in yourself you\'ve been trying to change for a long time—and how is that going?' }
      ]},
      { type: 'questions', title: 'Practice: What Do You Fight?', questions: [
        { id: 'p1', label: 'List 2–3 things you typically judge harshly in yourself (and for each, note how long you\'ve been fighting it):' },
        { id: 'p2', label: 'How well has being hard on yourself actually worked?' }
      ]},
      { type: 'questions', title: 'Meeting One Pattern With Curiosity',
        intro: 'Choose one of the patterns you listed above. Instead of the old voice of criticism, try to apply curiosity:',
        questions: [
          { id: 'c1', label: 'What do you actually notice when this pattern shows up?' },
          { id: 'c2', label: 'When did this pattern first develop?' },
          { id: 'c3', label: 'What might it be trying to protect me from?' },
          { id: 'c4', label: 'What would befriending (vs. fighting) this pattern look like?' },
          { id: 'c5', label: 'If this pattern could speak, what might it say that it needs?' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'Today, when you notice something that you\'d usually judge, try asking it: "What are you trying to tell me?"' }
    ]
  },

  {
    id: 's1_l6', sectionId: 1, lessonNumber: 6, isCompanion: false,
    title: 'The Body Holds Everything',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L6_Your_Body_As_Cup_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've been exploring goodness, perspective, compassion, needs, and befriending. You may already know where you carry all of this — in your body." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What stood out about your body\'s carrying capacity?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'When did you last feel genuinely alive in your body—and when did you last feel drained? What was the difference?' }
      ]},
      { type: 'questions', title: 'Practice: What Fills Your Cup?',
        intro: 'Think of 3–4 activities that consistently make you feel more alive—not just happy in your thoughts, but physically energized, nourished, full. For each, close your eyes and recall the last time you did it. Where in your body do you feel the energy?',
        questions: [
          { id: 'p1', label: 'Activity 1 — and where / how it feels in your body:' },
          { id: 'p2', label: 'Activity 2 — and where / how it feels in your body:' },
          { id: 'p3', label: 'Activity 3 — and where / how it feels in your body:' },
          { id: 'p4', label: 'Activity 4 — and where / how it feels in your body:' }
        ]
      },
      { type: 'info', content: 'This is your cup-filling menu. Keep this list somewhere you can see it. Today, choose one activity from your list and do it for 20–30 minutes.' },
      { type: 'questions', questions: [
        { id: 'post', label: 'After doing the activity, how does your body feel? Describe the experience:' }
      ]},
      { type: 'info', title: 'Transition', content: 'Tomorrow you\'ll explore specific practices of restoration—rhythms that keep your cup full.' }
    ]
  },

  {
    id: 's1_l7', sectionId: 1, lessonNumber: 7, isCompanion: false,
    title: 'Practices of Restoration',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L7_ Receiving Restoration_DK.m4a' },
    blocks: [
      { type: 'info', content: "Yesterday you identified what fills your cup. Today you explore the rhythms that keep it full." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What showed up for you during the meditation?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'When you\'re genuinely depleted, what do you actually reach for? How does it restore you?' }
      ]},
      { type: 'info', title: 'Four Pathways to Restoration', content: '1. Rest — Not just sleep. True rest: doing nothing, lying down, sitting quietly, letting your system fully settle.\n\n2. Nature — Being outside. Sky, trees, water, earth, air. Even 10 minutes in sunlight.\n\n3. Beauty — Art, music, poetry, sunsets. Anything that makes you pause and say "that is beautiful."\n\n4. Stillness — Quiet. Silence. Prayer. Meditation. The space where you can hear yourself again.' },
      { type: 'questions', questions: [
        { id: 'p1', label: 'Which pathway do you need most today? Why?' },
        { id: 'p2', label: 'What is one specific way you could receive this today?' },
        { id: 'p3', label: 'When will you do it today? (Make a real plan, not just a checkbox.)' }
      ]},
      { type: 'info', content: 'Do your chosen restoration practice for 15–30 minutes. Afterward, notice what shifted.' },
      { type: 'questions', questions: [
        { id: 'post', label: 'After your restoration practice, what shifted? Make notes here:' }
      ]},
      { type: 'info', title: 'Transition', content: 'Tomorrow you\'ll explore another essential resource: connection and belonging.' }
    ]
  },

  {
    id: 's1_l8', sectionId: 1, lessonNumber: 8, isCompanion: false,
    title: 'You Are Not Alone',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L8_Belonging_and_Connection_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've been building resources on your own. Now you turn toward something you may already sense but haven't yet named: you are not alone." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What happened as you sat with whatever appeared?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Who in your life leaves you feeling more like yourself after you\'ve spent time with them?' }
      ]},
      { type: 'questions', title: 'Practice: Your People', questions: [
        { id: 'p1', label: 'List 2–3 people in your life who actually fill your cup when you spend time with them:' },
        { id: 'p2', label: 'The person you will reach out to:' },
        { id: 'p3', label: 'How you will connect:' },
        { id: 'p4', label: 'When:' }
      ]},
      { type: 'info', content: 'Today, actually reach out—make the call, send the text, meet for coffee. Even 10 minutes of genuine connection matters.' },
      { type: 'questions', questions: [
        { id: 'post', label: 'Afterward, notice what changed. Make notes here:' }
      ]},
      { type: 'info', title: 'Transition', content: 'Tomorrow you\'ll explore aliveness through joy.' }
    ]
  },

  {
    id: 's1_l9', sectionId: 1, lessonNumber: 9, isCompanion: false,
    title: 'Aliveness Through Joy',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L9_Touching_Joy_DK.m4a' },
    blocks: [
      { type: 'info', content: "You're nearing the end of Section 1 and you've added some valuable things to your pack. Today you explore something that we often overlook — joy." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What makes you come alive? When do you feel most joyful?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'When did you last lose track of time in a good way? Recall it here.' }
      ]},
      { type: 'questions', title: 'Practice: Joy',
        intro: 'Think about the past few weeks:',
        questions: [
          { id: 'p1', label: 'When did you laugh?' },
          { id: 'p2', label: 'When did time disappear?' },
          { id: 'p3', label: 'When did you feel light, playful, delighted?' },
          { id: 'p4', label: 'List 3–4 activities that you know bring you genuine joy, play, or aliveness:' },
          { id: 'p5', label: 'Today I will: (choose one joyful thing you can do today)' },
          { id: 'p6', label: 'When and for how long:' }
        ]
      },
      { type: 'info', content: 'Close this guide and let yourself experience it — dance, doodle, play, sing, be silly. 15–30 minutes, or more.' },
      { type: 'questions', questions: [
        { id: 'post', label: 'After your joyful experience: Where do you feel aliveness? How did it feel in your body?' }
      ]},
      { type: 'info', title: 'Transition', content: 'Tomorrow, in the final lesson, you\'ll integrate everything you\'ve been exploring in this section.' }
    ]
  },

  {
    id: 's1_l10', sectionId: 1, lessonNumber: 10, isCompanion: false,
    title: 'Standing on Your Goodness',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Lessons', file: 'S1_L10_Standing_On_Your_Goodness_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've reached the final lesson of Section 1. Today you return to everything you've gathered—and feel what it's like to stand on it." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What was that experience like for you?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'What feels even slightly different about how you are with yourself compared to when you began this section almost two weeks ago?' }
      ]},
      { type: 'questions', title: 'Practice: Checking Your Pack',
        intro: 'The ten lessons you explored in this section:\n1. Your Basic Goodness Is Not Earned\n2. Finding Your Footing Beneath the Waves\n3. What Self-Compassion Actually Means\n4. Your Needs Matter\n5. Befriending Your Inner Landscape\n6. The Body Holds Everything\n7. Practices of Restoration\n8. You Are Not Alone\n9. Aliveness Through Joy\n10. Standing on Your Goodness',
        questions: [
          { id: 'p1', label: 'Which lesson had the biggest impact on you? How?' }
        ]
      },
      { type: 'questions', title: 'Your Resource Menu',
        intro: 'Create a simple menu you can return to—especially when things get challenging:',
        questions: [
          { id: 'r1', label: 'When I need to remember my goodness, I will:' },
          { id: 'r2', label: 'When I need perspective, I will remember:' },
          { id: 'r3', label: 'When I am being harsh with myself, I will:' },
          { id: 'r4', label: 'One need I intend to honor regularly:' },
          { id: 'r5', label: 'To fill my cup, I will (list 3–4 activities):' }
        ]
      },
      { type: 'questions', title: 'Affirmation: Your Readiness',
        intro: 'Place your hand on your heart. Say aloud or silently: "I am standing on my goodness. I have what I need. I am ready."',
        questions: [
          { id: 'aff', label: 'What do you notice?' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'You\'ve completed Section 1. You\'ve gathered your resources and tended to your cup.\n\nSection 2 awaits: you\'ll begin to explore who shows up when you show up—the inner voices that have been shaping your life from behind the scenes. You have everything you need to meet them with compassion and curiosity.\n\nRest well. You are ready.' }
    ]
  },

  // ─── SECTION 1 COMPANIONS ───────────────────────────────────────────────────

  {
    id: 's1_c1', sectionId: 1, lessonNumber: 1, isCompanion: true,
    title: 'Companion Meditation 1',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Companions', file: 'S1_Companion_1_DK.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 1. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's1_c2', sectionId: 1, lessonNumber: 2, isCompanion: true,
    title: 'Companion Meditation 2',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Companions', file: 'S1_Companion_2_BW.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 1. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's1_c3', sectionId: 1, lessonNumber: 3, isCompanion: true,
    title: 'Companion Meditation 3',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Companions', file: 'S1_Companion_3_DK.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 1. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's1_c4', sectionId: 1, lessonNumber: 4, isCompanion: true,
    title: 'Companion Meditation 4',
    sectionTitle: 'Preparing for the Journey',
    audio: { section: 'Section_1', folder: 'Companions', file: 'S1_Companion_4_BW.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 1. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },

  // ─── SECTION 2 ───────────────────────────────────────────────────────────────

  {
    id: 's2_l1', sectionId: 2, lessonNumber: 1, isCompanion: false,
    title: 'Noticing Your Inner Patterns',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L1_Noticing_Your_Inner_Patterns_DK.m4a' },
    blocks: [
      { type: 'info', content: "In Section 1 you gathered your resources. Now you turn your attention toward who shows up when you show up." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What did you notice—in your thoughts, your body, your emotions?' },
        { id: 'med2', label: 'Were there any familiar voices or characters that made themselves known?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Think about how you showed up yesterday—in a conversation, at work, at home, or even alone. Was there a moment when you noticed yourself being a particular way—cautious, driven, guarded, generous, light-hearted? What was that like?' }
      ]},
      { type: 'questions', title: 'Practice: Recognizing Your Patterns',
        intro: 'Reflect on these questions: What thoughts repeat throughout your day? What emotions show up in similar situations? What behaviors feel automatic?\n\nIf you\'re stuck, consider what reliably unsettles you—being interrupted, overlooked, cut off in traffic, visited by a thought that won\'t leave. What happens inside you in those moments?',
        questions: [
          { id: 'p1', label: 'List 3–5 patterns that come most readily to mind:' }
        ]
      },
      { type: 'questions', questions: [
        { id: 'obs', label: 'Space for observations between now and Lesson 2 — when you notice a pattern, note what you observed (what stirred you up, where you felt it, what thoughts and impulses arose):' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, when a familiar pattern shows up, pause briefly and note what you noticed—what stirs you up, where you feel it in your body, what thoughts and impulses arise. No judgment. Just see it.' }
    ]
  },

  {
    id: 's2_l2', sectionId: 2, lessonNumber: 2, isCompanion: false,
    title: 'Slowing Down the Moment',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L2_Slowing_Down_The_Moment_BW.m4a' },
    blocks: [
      { type: 'info', content: "Yesterday you started noticing patterns. Today you'll work with one specific moment." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What showed up as you slowed down?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Think of a moment in the past few days when you felt a shift inside—a tightening, a rush of heat, a familiar frustration. What was happening right before the shift?' }
      ]},
      { type: 'questions', title: 'Practice: Slowing Down the Moment',
        intro: 'Choose a recent moment that stirred something in you. It doesn\'t need to be dramatic—what matters is that you felt a reaction. Work through these steps at your own pace.',
        questions: [
          { id: 'p1', label: 'What happened? Describe the situation briefly—where you were, what was said or done, the moment you felt the shift.' },
          { id: 'p2', label: 'Body: What did you notice first?' },
          { id: 'p3', label: 'Emotion: What feeling appeared first?' },
          { id: 'p4', label: 'Thought: What flashed through your mind?' },
          { id: 'p5', label: 'Impulse: What did you want to do?' }
        ]
      },
      { type: 'info', content: 'Pause here. How does your body feel right now? If you\'re steady—present, curious, perhaps a little tender—continue. If you notice overwhelm or numbness, take a break. You can return to the remaining steps another time.' },
      { type: 'questions', questions: [
        { id: 'p6', label: 'What did your body want to do—move toward, move away, or not move at all?' },
        { id: 'p7', label: 'Does this feeling seem familiar? Not just from this situation—does it feel older?' },
        { id: 'p8', label: 'If the reaction was trying to prevent something, what might it have been? If it had worked perfectly, what difficulty would it have kept you from feeling?' },
        { id: 'p9', label: 'What did the deeper part of you actually need in that moment?' },
        { id: 'p10', label: 'Give the reaction a voice. Let it speak freely—raw, unfiltered, no audience. Write what it would say. Then read it back, not to judge it, but to hear it.', large: true }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, see if you can catch even one piece of a stirred-up moment—a body sensation, an emotion, a thought—before the whole thing races past.' }
    ]
  },

  {
    id: 's2_l3', sectionId: 2, lessonNumber: 3, isCompanion: false,
    title: 'A Part of Me',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L3_A-Part_of_Me_DK.m4a' },
    blocks: [
      { type: 'info', content: "You've noticed patterns and slowed down a specific moment. Today we experiment with one small shift in language—and notice what it opens up." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What happened during the meditation?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Have you ever caught yourself saying "A part of me wants this, but…"? What was that part trying to do? And who was the "but"—the voice on the other side?' }
      ]},
      { type: 'questions', title: 'Practice: Identifying the Part', questions: [
        { id: 'p1', label: 'Return to the reactive part from yesterday—its voice, what was at stake underneath. Give it a name that feels accurate, not critical. My part\'s name:' },
        { id: 'p2', label: 'Where else in your life do you recognize this same reaction—the same body sensation, the same impulse, the same voice? How far back can you trace it?' },
        { id: 'p3', label: 'Think of two different situations where this trigger fires. How does the reaction land differently in each? What\'s different about the relationship—the trust, the history, the stakes? What does the difference tell you about what the part is actually reacting to?' },
        { id: 'p4', label: 'What does this part of you actually need? Say it as plainly as you can—not as a grievance about someone else, but as something true about yourself.' },
        { id: 'p5', label: 'What gets in the way of knowing this in the triggered moment? How long after the reaction fires does it take before the clear-thinking version of you is available again?' },
        { id: 'p6', label: 'As you look at what this part has done—perhaps over many periods of your life—describe what you see. How has this reaction served you?' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, when you notice a familiar pattern arising, try the phrase: "A part of me is…" Notice what happens.\n\nFork in the Road: If you notice distracting voices of additional parts competing for your attention, jumping to Lessons 7, 8, and 9 would be a good next step. If you feel really focused on the part you\'ve identified, continue with Lesson 4 in sequence. Either way, you\'ll complete every lesson.' }
    ]
  },

  {
    id: 's2_l4', sectionId: 2, lessonNumber: 4, isCompanion: false,
    title: 'Getting to Know Me',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L4_Getting_To_Know_Me_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've identified a part, named it, and found its unmet need. Today you'll fill in the details—the kind of knowing that comes from a long, relaxed conversation." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What did you notice today?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Think of someone you once knew only on the surface who you later came to know much more deeply. What changed in how you related to them once you understood their story?' }
      ]},
      { type: 'questions', title: 'Practice: Creating the Biography', questions: [
        { id: 'p1', label: 'Name of the part:' },
        { id: 'p2', label: 'Unmet Need:' },
        { id: 'p3', label: 'Purpose:' },
        { id: 'p4', label: 'Biography — explore any of these questions: What were the circumstances surrounding its formation? What was going on in your family when the part appeared? How did it shape your early friendships, school experience, connections with siblings? What view "about your world" did it create? What is this part\'s favorite "food" (what does it crave taking in)? What were its typical behaviors? What is its usual mood? What emotions does it express easily, and what is foreign to it? What beliefs does it hold about people, work, money, religion, time? Add anything else that shows up.', large: true }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, carry the biography with you. When the part appears, notice whether knowing its story changes how you experience it.' }
    ]
  },

  {
    id: 's2_l5', sectionId: 2, lessonNumber: 5, isCompanion: false,
    title: 'Dialog',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L5_Dialog_DK.m4a' },
    blocks: [
      { type: 'info', content: "You've built something real with this part. Today, instead of studying it, you speak with it." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What did you notice when you shifted into a more receptive or listening approach?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Have you ever had the experience of finally saying something out loud—something you\'d been carrying quietly—and feeling it shift just because someone really listened? What made that moment different?' }
      ]},
      { type: 'info', title: 'The Art of Listening Inward', content: '1. "Tell me more." When the part says something, resist the urge to interpret. Just ask: tell me more about that.\n\n2. Perception checking. Reflect back what you think you heard, without assuming you got it right. "It sounds like you\'re saying… Is that close?"\n\n3. Summarizing. After a stretch of listening, gather what you\'ve heard: "So what I\'m hearing is…"' },
      { type: 'questions', title: 'Practice: The Dialog',
        intro: 'Set aside 20–30 minutes in a quiet space. Write as a two-column dialogue (me / part), or speak aloud using a voice recording app.\n\nAddress the part by name. Acknowledge what you\'ve learned. Ask: "What do you most want me to understand?" or "What haven\'t I seen yet about you?" Let the part respond in its own voice. Practice "tell me more" before moving to the next question. If another part jumps in, acknowledge it: "I hear you too. I\'ll come back to you." Close by summarizing what you heard and thanking the part.',
        questions: [
          { id: 'p1', label: 'The Dialog — write your conversation here (or paste a summary if you spoke it aloud):', large: true },
          { id: 'p2', label: 'What surprised you?' },
          { id: 'p3', label: 'What did the part say that you hadn\'t expected?' },
          { id: 'p4', label: 'How did it feel to listen this way?' }
        ]
      },
      { type: 'info', title: 'Transition', content: 'Today, when you notice the part showing up, try speaking to it briefly: "I hear you. I\'m paying attention."' }
    ]
  },

  {
    id: 's2_l6', sectionId: 2, lessonNumber: 6, isCompanion: false,
    title: 'New Job Posting',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L6_New_Job_Posting_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've had a real conversation with this part. Today you renegotiate its role." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What appeared during your meditation, perhaps a fresh perspective?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Have you ever outgrown a role—at work, in a family, in a friendship—where the old expectations no longer fit who you\'d become? What made it possible to step into something new?' }
      ]},
      { type: 'questions', title: 'Practice: Thank You and What\'s Next', questions: [
        { id: 'p1', label: 'Write a letter of gratitude to the part. What did it protect you from? What situations did it navigate on your behalf?', large: true },
        { id: 'p2', label: 'Strengths to Keep: What strengths does this part carry that you genuinely value? When has its energy served you well? What would you lose if it vanished entirely?' },
        { id: 'p3', label: 'Duties to Hand Off: What does this part do on autopilot that creates problems? What outdated beliefs drive those reflexes? If you could keep the strength but hand off the reflex, what would change?' }
      ]},
      { type: 'questions', title: 'The New Job Description', questions: [
        { id: 'jd1', label: 'Title: A new name for the part\'s role going forward:' },
        { id: 'jd2', label: 'Primary responsibility: What you\'d like this part to contribute now:' },
        { id: 'jd3', label: 'Duties reassigned: What it no longer needs to do:' },
        { id: 'jd4', label: 'Reporting to: Whatever guides when and how this part contributes (you might call it the conductor, the witness, or the choosing part):' },
        { id: 'jd5', label: 'Working conditions: What this part needs from you in order to trust the new arrangement:' },
        { id: 'jd6', label: 'The Part Responds: Imagine the part reading this new job description. How does it respond?' }
      ]},
      { type: 'info', title: 'Transition', content: 'When the part reverts to its old role, gently redirect: "I know that\'s what you used to do. Here\'s what I\'m asking for now."' }
    ]
  },

  {
    id: 's2_l7', sectionId: 2, lessonNumber: 7, isCompanion: false,
    title: 'A Second Round',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L7_A_Second_Round_DK.m4a' },
    blocks: [
      { type: 'info', content: "Parts rarely show up alone. This lesson gives you the chance to meet a second one. After you complete Lessons 7, 8, and 9 you will be directed back to Lessons 4, 5, and 6 if you haven't completed them yet." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What was it like for you to widen your attention, instead of narrowing it?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'As you worked with your first part, who else showed up uninvited? A voice commenting from the sidelines, a feeling that kept nudging in?' }
      ]},
      { type: 'questions', title: 'Practice: A Second Investigation', questions: [
        { id: 'p1', label: 'Choose a recent experience where a different part seems to have been driving. Describe the moment:' },
        { id: 'p2', label: 'Slow it down. What happened externally? What was your inner experience—body, emotions, thoughts, impulse?' },
        { id: 'p3', label: '"A part of me that _____ showed up." Give it a respectful name:' },
        { id: 'p4', label: 'What did this part\'s younger self most want or need?' },
        { id: 'p5', label: 'Bring both parts to sit around the table. How do they relate? Describe their dynamic:' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, watch for moments when these two parts show up in the same situation. Notice the pattern between them.' }
    ]
  },

  {
    id: 's2_l8', sectionId: 2, lessonNumber: 8, isCompanion: false,
    title: 'How Parts Push and Pull',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L8_Just_Sounds_BW.m4a' },
    blocks: [
      { type: 'info', content: "Meeting a second part has shown you something new: these parts know each other. Today you'll see their dynamics in motion." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What was it like to become aware of perpetual movement?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Think of a decision you\'ve been going back and forth on. Can you hear the different voices weighing in? What is each one arguing for?' }
      ]},
      { type: 'info', title: 'Common Dynamics to Watch For', content: '• Opposition: Two parts want opposite things. You feel it as inner conflict or ambivalence.\n\n• Escalation: One pushes harder, the other digs in. The volume rises on both sides.\n\n• Sequencing: Parts take turns—you push hard, then collapse. You caretake, then withdraw.\n\n• Alliance: Two parts team up, creating an atmosphere that\'s hard to resist.\n\n• Suppression: One part dominates so thoroughly that another barely gets heard.' },
      { type: 'questions', title: 'Practice: Mapping the Dynamic', questions: [
        { id: 'p1', label: 'Describe how your two parts typically interact. When Part A speaks up, what does Part B do? Do they take turns? What triggers the shift?' },
        { id: 'p2', label: 'Choose a specific recent situation and trace the interplay: Which part responded first, did the other show up, and whose voice was loudest when you acted?' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, when you notice inner tension, silently name it: "Both are here."' }
    ]
  },

  {
    id: 's2_l9', sectionId: 2, lessonNumber: 9, isCompanion: false,
    title: 'Dissonance Between Parts',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L9_Dissonance_Between_Parts_DK.m4a' },
    blocks: [
      { type: 'info', content: "You've watched your parts push and pull. Today you'll look at the moments when the pattern between your parts falls apart—and notice how you find your way through." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What did you notice as you steadied yourself amid many thoughts and experiences?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'Can you recall a time when you felt genuinely torn—pulled hard in two directions at once? What did you do? And how did you decide?' }
      ]},
      { type: 'questions', title: 'Practice: Sitting With the Clash', questions: [
        { id: 'p1', label: 'Choose a moment when you felt genuinely split. Give voice to both sides—write what each part was saying. Let them be honest and even dramatic:', large: true },
        { id: 'p2', label: 'What happened next? How did the dissonance resolve? Did one part win? Did you go numb? Did something wiser emerge?' },
        { id: 'p3', label: 'Find the conductor: Something in you made a choice—or navigated through. Can you sense what that was? What was it drawing on?' },
        { id: 'p4', label: 'Reimagine the moment: With full conductor awareness, what might you have done differently?' }
      ]},
      { type: 'info', title: 'Transition', content: 'Today, watch for small moments of dissonance. When you notice the clash, pause. Name both voices. Then notice: who is doing the noticing?\n\nIf you skipped Lessons 4, 5, and 6, go back to do them now. Then return to Lesson 10.' }
    ]
  },

  {
    id: 's2_l10', sectionId: 2, lessonNumber: 10, isCompanion: false,
    title: 'The Orchestra Within',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Lessons', file: 'S2_L10_The_Orchestra_ Within_BW.m4a' },
    blocks: [
      { type: 'info', content: "You've arrived at the final lesson of Section 2. Today you step back to sense the whole." },
      { type: 'questions', title: 'After the Meditation', questions: [
        { id: 'med1', label: 'What happened as you widened your attention?' }
      ]},
      { type: 'info', title: 'Listen', content: 'Spend a few minutes with a piece of music where many voices come together. You might try Gustavo Dudamel conducting Beethoven\'s Fifth Symphony, or any music that stirs a sense of complexity resolving into coherence.' },
      { type: 'questions', questions: [
        { id: 'music', label: 'What occurred for you while listening?' }
      ]},
      { type: 'questions', title: 'First, A Question', questions: [
        { id: 'fq', label: 'What is one thing you know about your inner life now that you couldn\'t quite see when you began this module?' }
      ]},
      { type: 'questions', title: 'Practice: Taking Stock', questions: [
        { id: 'p1', label: 'Your ensemble: List the parts you\'ve met during this section. For each, write one sentence about what you now understand that you didn\'t before:', large: true },
        { id: 'p2', label: 'Which part feels more understood, accepted, or included than it did at the start?' },
        { id: 'p3', label: 'Which part still seems wary, loud, or misunderstood?' },
        { id: 'p4', label: 'Where did a reflex soften into something more like a choice?' },
        { id: 'p5', label: 'What surprised you most?' },
        { id: 'p6', label: 'The conductor\'s perspective: Close your eyes. Imagine standing at the podium. All your parts are there. You don\'t need to do anything. Just notice what it\'s like to stand here. What do you notice?' },
        { id: 'p7', label: 'A note to your orchestra: Write a brief message from the conductor to the ensemble. What do you want them to know?', large: true }
      ]},
      { type: 'info', title: 'Closing Thought', content: 'When the conductor steps off the podium, the orchestra does not vanish. You carry your parts with you into every conversation, every reaction, every day. They haven\'t been fixed or eliminated. They\'ve been seen—and you may already be noticing what that changes.\n\nYou began this section by noticing patterns you\'d lived inside for years. You slowed them down, named the parts that drive them, traced where they came from, and watched how they push and pull against each other. And somewhere in the midst of it all, you may have begun to sense a calmer part of yourself underneath it all.\n\nThat presence is what Section 3 builds on.' }
    ]
  },

  // ─── SECTION 2 COMPANIONS ───────────────────────────────────────────────────

  {
    id: 's2_c1', sectionId: 2, lessonNumber: 1, isCompanion: true,
    title: 'Companion Meditation 1',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Companions', file: 'S2_Companion_1_DK.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 2. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's2_c2', sectionId: 2, lessonNumber: 2, isCompanion: true,
    title: 'Companion Meditation 2',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Companions', file: 'S2_Companion_2_BW.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 2. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's2_c3', sectionId: 2, lessonNumber: 3, isCompanion: true,
    title: 'Companion Meditation 3',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Companions', file: 'S2_Companion_3_DK.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 2. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  },
  {
    id: 's2_c4', sectionId: 2, lessonNumber: 4, isCompanion: true,
    title: 'Companion Meditation 4',
    sectionTitle: 'Meeting the Voices Within',
    audio: { section: 'Section_2', folder: 'Companions', file: 'S2_Companion_4_BW.m4a' },
    blocks: [
      { type: 'info', content: 'This companion meditation is available to use at any time during the two weeks of Section 2. Use it whenever you need additional support, grounding, or restoration.' },
      { type: 'questions', title: 'Reflection (optional)', questions: [
        { id: 'notes', label: 'Any reflections, images, or feelings from this meditation you\'d like to capture:' }
      ]}
    ]
  }

];
