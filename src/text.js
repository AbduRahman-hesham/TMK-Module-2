export const HERO_IMAGES = {
  boy: '/assets/aistudio/Boy_c0582b26.jpg',
  girl: '/assets/aistudio/Girl_1936987a.jpg',
};

export const TEXT = {
  ar: {
    title: 'مدينة البطل',
    prompt: 'اختر بطلك!',
    boy: 'البطل',
    girl: 'البطلة',
    langBtn: 'ع / EN',
    continueBtn: 'أكمل',
    missionBanner: (n) => `المهمة ${n}!`,
    next: 'التالي ▶',
    finalScore: (n) => `${n} / 9 ⭐`,
    tierPerfect: 'بطل مثالي!',
    tierGreat: 'عمل رائع!',
    tierMore: 'العب مرة أخرى لتجمع نجومًا أكثر!',
    playAgain: 'العب مرة أخرى',
    webglError: 'متصفحك لا يدعم تشغيل هذه اللعبة',
  },
  en: {
    title: 'Hero City',
    prompt: 'Pick your hero!',
    boy: 'Boy',
    girl: 'Girl',
    langBtn: 'ع / EN',
    continueBtn: 'Continue',
    missionBanner: (n) => `Mission ${n}!`,
    next: 'Next ▶',
    finalScore: (n) => `${n} / 9 ⭐`,
    tierPerfect: 'Perfect hero!',
    tierGreat: 'Great job!',
    tierMore: 'Play again to get more stars!',
    playAgain: 'Play again',
    webglError: "Your browser can't run this game",
  },
};

export const MISSIONS = [
  {
    lot: 0,
    emoji: '🏭',
    ar: {
      title: 'ما الذي يجعل الناتج المحلي ينمو؟',
      lesson: 'الناتج المحلي = كل ما تنتجه المدينة.',
      choices: [
        ['🏭', 'ننتج سلعًا وخدمات أكثر', true],
        ['💵', 'نطبع نقودًا أكثر', false, 'نقود أكثر لا تعني أشياء أكثر.'],
        ['🛍️', 'نشتري أكثر من مدن أخرى', false, 'هذا يزيد ناتجهم هم، لا ناتجنا.'],
      ],
    },
    en: {
      title: 'What makes our GDP grow?',
      lesson: 'GDP = everything a city makes.',
      choices: [
        ['🏭', 'Make more goods and services', true],
        ['💵', 'Print more money', false, "More money doesn't mean more things."],
        ['🛍️', 'Buy more from other cities', false, 'That grows THEIR GDP, not ours.'],
      ],
    },
  },
  {
    lot: 1,
    emoji: '🏷️',
    ar: {
      title: 'الأسعار ترتفع. ما الحل؟',
      lesson: 'التوفير يساعد على تهدئة الأسعار.',
      choices: [
        ['🏦', 'البنك يكافئ التوفير', true],
        ['💵', 'نعطي الجميع نقودًا أكثر', false, 'النقود الكثيرة ترفع الأسعار أكثر!', 'inflate'],
        ['🛒', 'الكل يشتري أكثر الآن', false, 'الشراء الكثير يرفع الأسعار.'],
      ],
    },
    en: {
      title: 'Prices keep rising. What helps?',
      lesson: 'Saving more can slow rising prices.',
      choices: [
        ['🏦', 'Bank rewards saving', true],
        ['💵', 'Give everyone more money', false, 'More money makes prices go higher!', 'inflate'],
        ['🛒', 'Everyone buys more now', false, 'More buying pushes prices up.'],
      ],
    },
  },
  {
    lot: 2,
    emoji: '🛠️',
    ar: {
      title: 'كيف نعيد الوظائف؟',
      lesson: 'شركات أكثر = وظائف أكثر.',
      choices: [
        ['🏗️', 'نساعد الشركات لتفتح وتوظف', true],
        ['🤖', 'نستخدم الروبوتات في كل شيء', false, 'هكذا يخسر الناس وظائف أكثر.'],
        ['🧾', 'نرفع الضرائب على المحلات', false, 'المحلات تملك نقودًا أقل للتوظيف.'],
      ],
    },
    en: {
      title: 'How do we bring jobs back?',
      lesson: 'More businesses = more jobs.',
      choices: [
        ['🏗️', 'Help businesses open and hire', true],
        ['🤖', 'Use robots for all work', false, 'Then people lose even more jobs.'],
        ['🧾', 'Raise taxes on shops', false, 'Shops get less money to hire.'],
      ],
    },
  },
  {
    lot: 3,
    emoji: '🏪',
    ar: {
      title: 'أصحاب المحلات خائفون. كيف نساعدهم؟',
      lesson: 'عندما يثق أصحاب الأعمال بالمستقبل، يفتحون ويكبرون.',
      choices: [
        ['🏦', 'قروض سهلة وقواعد واضحة', true],
        ['🏠', 'نرفع إيجار المحلات', false, 'التكاليف الأعلى تزيد خوفهم.'],
        ['⏳', 'ننتظر حتى العام القادم', false, 'الانتظار لا يصنع الثقة.'],
      ],
    },
    en: {
      title: 'Owners are afraid to open. Why help?',
      lesson: 'When owners trust the future, they open and grow.',
      choices: [
        ['🏦', 'Easy loans and clear rules', true],
        ['🏠', 'Raise the shop rent', false, 'Higher costs make owners more worried.'],
        ['⏳', 'Wait until next year', false, "Waiting doesn't build confidence."],
      ],
    },
  },
  {
    lot: 4,
    emoji: '🏠',
    ar: {
      title: 'البيوت قليلة فارتفع سعرها. ما الحل؟',
      lesson: 'بيوت أكثر = أسعار أعدل.',
      choices: [
        ['🏠', 'نبني بيوتًا أكثر', true],
        ['💵', 'نعطي العائلات نقودًا أكثر', false, 'نفس البيوت القليلة، والسعر يرتفع أكثر.'],
        ['🏢', 'نبني مكاتب أكثر', false, 'المكاتب ليست بيوتًا للعائلات.'],
      ],
    },
    en: {
      title: 'Houses are few, so prices rose. Fix it?',
      lesson: 'More houses = fairer prices.',
      choices: [
        ['🏠', 'Build more houses', true],
        ['💵', 'Give families more money', false, 'Same few houses, prices go higher.'],
        ['🏢', 'Build more offices', false, "Offices aren't homes for families."],
      ],
    },
  },
  {
    lot: 5,
    emoji: '📊',
    ar: {
      title: 'كيف نتوقع نمو العام القادم؟',
      lesson: 'أرقام كثيرة عبر الوقت تساعدنا نتوقع.',
      choices: [
        ['📊', 'ندرس الأرقام لعدة شهور', true],
        ['📅', 'ننظر إلى يوم واحد فقط', false, 'يوم واحد لا يكفي لنعرف.'],
        ['🗣️', 'نسأل شخصًا واحدًا', false, 'رأي واحد ليس بيانات حقيقية.'],
      ],
    },
    en: {
      title: "How do we guess next year's growth?",
      lesson: 'Many numbers over time help us predict.',
      choices: [
        ['📊', 'Study numbers over many months', true],
        ['📅', 'Look at one day only', false, 'One day is too little to know.'],
        ['🗣️', 'Ask one person', false, "One opinion isn't real data."],
      ],
    },
  },
  {
    lot: 6,
    emoji: '🩺',
    ar: {
      title: 'أي 3 علامات تُظهر صحة مدينتنا؟',
      lesson: 'المؤشرات هي فحص صحة المدينة.',
      choices: [
        ['💼', 'الوظائف والأسعار والناتج', true],
        ['🌦️', 'الطقس والزحام والحدائق', false, 'جميلة، لكنها لا تقيس الاقتصاد.'],
        ['📱', 'الهواتف والألعاب المباعة', false, 'صغيرة جدًا لتُظهر المدينة كلها.'],
      ],
    },
    en: {
      title: "Which 3 signs show our city's health?",
      lesson: "Indicators are the city's health check.",
      choices: [
        ['💼', 'Jobs, prices, GDP', true],
        ['🌦️', 'Weather, traffic, parks', false, "Nice, but they don't measure the economy."],
        ['📱', 'Phones, games, toys sold', false, 'Too small to show the whole city.'],
      ],
    },
  },
  {
    lot: 7,
    emoji: '🎓',
    ar: {
      title: 'ما الذي يجعل المدينة تنمو لسنوات؟',
      lesson: 'التعلم + العمل + الأدوات = نمو.',
      choices: [
        ['🎓', 'مدارس ومهارات وأدوات', true],
        ['🛒', 'نصرف كل التوفير الآن', false, 'ممتع اليوم، لكن لا شيء للغد.'],
        ['🚧', 'نوقف التجارة مع الآخرين', false, 'التجارة تساعد المدن على النمو معًا.'],
      ],
    },
    en: {
      title: 'What helps a city grow for years?',
      lesson: 'Learning + work + tools = growth.',
      choices: [
        ['🎓', 'Schools, skills and tools', true],
        ['🛒', 'Spend all savings now', false, 'Fun today, nothing left for tomorrow.'],
        ['🚧', 'Stop trading with others', false, 'Trading helps cities grow together.'],
      ],
    },
  },
  {
    lot: 8,
    emoji: '📅',
    ar: {
      title: 'لماذا نتابع التقويم الاقتصادي؟',
      lesson: 'التقويم يخبرنا بموعد الأخبار الاقتصادية المهمة.',
      choices: [
        ['📅', 'نعرف موعد الأخبار المهمة', true],
        ['📈', 'يخبرنا بالأسعار القادمة بالضبط', false, 'لا أحد يعرف المستقبل بالضبط.'],
        ['🏖️', 'لنعرف مواعيد الإجازات', false, 'إنه للأخبار الاقتصادية، لا للإجازات.'],
      ],
    },
    en: {
      title: 'Why check the economic calendar?',
      lesson: 'The calendar shows when big economic news comes.',
      choices: [
        ['📅', 'Know when big news comes', true],
        ['📈', 'It shows exact future prices', false, 'No one knows the future exactly.'],
        ['🏖️', 'To find holiday dates', false, "It's for economic news, not holidays."],
      ],
    },
  },
];
