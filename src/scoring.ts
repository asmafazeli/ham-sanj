/**
 * HamSanj QC rubric — empathy + tone informed by cognitive-bias science.
 *
 * Why a curated list (not all ~180)? There is no single ISO count of cognitive
 * biases. Literature (Kahneman & Tversky; Thinking, Fast and Slow) plus the
 * Cognitive Bias Codex / Wikipedia typically catalogue ~180–200 named biases.
 * For support-chat TONE / empathy QC we only need biases that distort agent
 * wording toward blame, coldness, or emotional blindness — a practical subset
 * aligned with communication-QC practice, not a psychology encyclopedia.
 */

/** Compact finding — presence in Biases implies detected. */
export type BiasFinding = {
  id: string
  nameFa: string
  evidence: string
}

export type EmpathyResult = {
  Score: number
  Reason: string
  Tone: string
  Biases: BiasFinding[]
}

export type HistoryItem = EmpathyResult & {
  id: string
  preview: string
  at: string
}

/** Curated set for support-chat tone QC (~10 of ~180+ in the literature). */
export const TONE_BIAS_CATALOG = [
  {
    id: 'confirmation_bias',
    nameFa: 'سوگیری تأیید',
    nameEn: 'Confirmation Bias',
    definitionFa:
      'تمایل به شنیدن فقط آنچه فرض قبلی را تأیید می‌کند و نادیده گرفتن نگرانی کاربر.',
  },
  {
    id: 'fundamental_attribution_error',
    nameFa: 'خطای اسناد بنیادی',
    nameEn: 'Fundamental Attribution Error',
    definitionFa: 'نسبت دادن مشکل به شخصیت/رفتار کاربر به‌جای شرایط یا سیستم.',
  },
  {
    id: 'anchoring',
    nameFa: 'لنگراندازی',
    nameEn: 'Anchoring',
    definitionFa: 'چسبیدن به اولین فرض (مثلاً «اشتباه کاربر») و نشنیدن اطلاعات تازه.',
  },
  {
    id: 'negativity_bias',
    nameFa: 'سوگیری منفی‌نگری',
    nameEn: 'Negativity Bias',
    definitionFa: 'وزن بیش‌ازحد به لحن منفی، تند یا تهدیدآمیز نسبت به نشانه‌های مثبت.',
  },
  {
    id: 'empathy_gap',
    nameFa: 'شکاف همدلی',
    nameEn: 'Empathy Gap',
    definitionFa: 'کم‌برآورد کردن شدت احساس کاربر در لحظه و پاسخ کاملاً وظیفه‌محور.',
  },
  {
    id: 'availability_heuristic',
    nameFa: 'اکتشاف در دسترس‌بودن',
    nameEn: 'Availability Heuristic',
    definitionFa: 'تعمیم از موارد رایج («همیشه همین‌طور است») بدون بررسی مورد فعلی.',
  },
  {
    id: 'defensive_reactance',
    nameFa: 'واکنش دفاعی',
    nameEn: 'Psychological Reactance',
    definitionFa: 'دفاع از سازمان/خود به‌جای پذیرش احساس، وقتی کاربر اعتراض می‌کند.',
  },
  {
    id: 'framing_effect',
    nameFa: 'اثر قاب‌بندی',
    nameEn: 'Framing Effect',
    definitionFa: 'قاب‌بندی مشکل به‌عنوان تقصیر کاربر به‌جای مسئولیت مشترک یا سیستمی.',
  },
  {
    id: 'illusion_of_transparency',
    nameFa: 'توهم شفافیت',
    nameEn: 'Illusion of Transparency',
    definitionFa: 'فرض اینکه کاربر همه‌چیز را می‌فهمد؛ توضیح کوتاه و بدون همدلی.',
  },
  {
    id: 'action_bias',
    nameFa: 'سوگیری اقدام فوری',
    nameEn: 'Action Bias',
    definitionFa: 'پرش به لینک/فرم/دستورالعمل قبل از تأیید احساس کاربر.',
  },
] as const

export type ToneBiasId = (typeof TONE_BIAS_CATALOG)[number]['id']

const EMPATHY_MARKERS = [
  'متأسفم',
  'متاسفم',
  'درکتون',
  'درک می‌کنم',
  'درک ميکنم',
  'حق دارید',
  'حق داريد',
  'ناراحتی',
  'نگرانیتون',
  'کاملاً طبیعی',
  'کاملا طبیعی',
  'ممنون که گفتید',
  'ممنون از صبرتون',
]

const COLD_MARKERS = [
  'خودتون مشکل دارید',
  'تقصیر شماست',
  'دیگه پیام ندید',
  'نمی‌تونم کاری کنم',
  'نمیتونم کاری کنم',
  'این مشکل ما نیست',
  'برو سایت',
  'فقط صبر کنید',
]

const POLITE_MARKERS = [
  'لطفاً',
  'لطفا',
  'خواهش می‌کنم',
  'در خدمتم',
  'خوشحال می‌شم',
  'حتماً پیگیری',
  'حتما پیگیری',
]

/** Persian / mixed markers that signal each curated bias in agent replies. */
const BIAS_MARKERS: Record<ToneBiasId, string[]> = {
  confirmation_bias: [
    'همون‌طور که گفتم',
    'همان طور که گفتم',
    'قبلاً گفتم',
    'واضحه که',
    'واضح است که',
    'حتماً اشتباه کردید',
    'حتما اشتباه کردید',
    'نیازی به تکرار نیست',
  ],
  fundamental_attribution_error: [
    'خودتون مشکل دارید',
    'تقصیر شماست',
    'اشتباه شماست',
    'خودت باعث شدی',
    'خودتون باعث شدید',
    'بی‌دقتی شما',
    'بی دقتی شما',
    'اشتباه وارد کردید',
  ],
  anchoring: [
    'حتماً آدرس اشتباه',
    'حتما آدرس اشتباه',
    'قطعاً کد اشتباه',
    'قطعا کد اشتباه',
    'از اول اشتباه بوده',
    'فقط همون مشکل قبلی',
    'همان مشکل قبلی',
  ],
  negativity_bias: [
    'دیگه پیام ندید',
    'خسته کردید',
    'اعصاب‌خردی',
    'اعصاب خرد',
    'دیگر پیگیری نمی‌شود',
    'دیگه پیگیری نمیشه',
    'آخرین اخطار',
  ],
  empathy_gap: [
    'فقط صبر کنید',
    'نگران نباشید بی‌خوده',
    'نگران نباشید بیخوده',
    'اینقدر جدی نیست',
    'اینقدر بزرگش نکنید',
    'عادیه دیگه',
    'عادی است دیگر',
  ],
  availability_heuristic: [
    'همیشه همین‌طور است',
    'همیشه همینطوره',
    'همه همین مشکل را دارند',
    'همه همین مشکل رو دارن',
    'معمولاً همین است',
    'معمولا همینه',
    'مثل بقیه صبر کنید',
  ],
  defensive_reactance: [
    'مشکل از ما نیست',
    'این مشکل ما نیست',
    'سیستم ما مشکلی ندارد',
    'سیستم ما مشکلی نداره',
    'ما مقصر نیستیم',
    'حق شکایت ندارید',
    'بی‌دلیل عصبانی نشوید',
    'بی دلیل عصبانی نشوید',
  ],
  framing_effect: [
    'شما باید درست می‌کردید',
    'شما باید درست ميکرديد',
    'اگر درست زده بودید',
    'تقصیر سمت شماست',
    'مسئولیت با شماست',
    'خودتون باید چک می‌کردید',
    'خودتون باید چک ميکرديد',
  ],
  illusion_of_transparency: [
    'که معلومه',
    'که مشخصه',
    'واضح بود',
    'خودتون می‌دونید',
    'خودتون ميدونيد',
    'نیازی به توضیح نیست',
    'همان روال همیشگی',
  ],
  action_bias: [
    'برو سایت',
    'لینک را باز کنید',
    'لینک را باز کنيد',
    'فرم را پر کنید',
    'کد پیگیری بفرستید',
    'تیکت بزنید',
    'اپ را آپدیت کنید',
  ],
}

function agentLines(chat: string): string[] {
  const lines = chat
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const labeled = lines.filter((line) =>
    /^(اپراتور|کارشناس|پشتیبان|agent|support|ادمین)\s*[:：]/i.test(line),
  )

  if (labeled.length > 0) {
    return labeled.map((line) => line.replace(/^[^:：]+[:：]\s*/, ''))
  }

  return lines
}

function countHits(text: string, markers: string[]): number {
  return markers.reduce((count, marker) => (text.includes(marker) ? count + 1 : count), 0)
}

function findEvidence(text: string, markers: string[]): string {
  const hit = markers.find((marker) => text.includes(marker))
  return hit ?? ''
}

function detectBiases(
  source: string,
  empathyHits: number,
  coldHits: number,
): BiasFinding[] {
  const rushed = /[!]{2,}/.test(source) || /فوراً|سریع باش/i.test(source)
  const solutionOnly =
    empathyHits === 0 &&
    /(لینک|کد پیگیری|تیکت|فرم|سایت|اپ)/.test(source) &&
    source.length > 40

  const findings: BiasFinding[] = []

  for (const bias of TONE_BIAS_CATALOG) {
    const markers = BIAS_MARKERS[bias.id]
    let evidence = findEvidence(source, markers)
    let detected = evidence.length > 0

    // Soft heuristics when markers miss but pattern is clear
    if (!detected && bias.id === 'empathy_gap' && empathyHits === 0 && coldHits === 0) {
      if (solutionOnly || /(صبر کنید|پیگیری می‌شود|پیگیری ميشود)/.test(source)) {
        detected = true
        evidence = 'پاسخ وظیفه‌محور بدون تأیید احساس'
      }
    }
    if (!detected && bias.id === 'action_bias' && solutionOnly) {
      detected = true
      evidence = 'راه‌حل/دستور قبل از همدلی'
    }
    if (!detected && bias.id === 'negativity_bias' && (coldHits >= 2 || rushed)) {
      detected = true
      evidence = rushed ? 'لحن عجله‌دار/تند' : 'چند نشانه سردی/سرزنش'
    }
    if (
      !detected &&
      bias.id === 'fundamental_attribution_error' &&
      /تقصیر|اشتباه شما|خودتون مشکل/.test(source)
    ) {
      detected = true
      evidence = findEvidence(source, markers) || 'نسبت دادن مشکل به کاربر'
    }

    if (detected) {
      findings.push({
        id: bias.id,
        nameFa: bias.nameFa,
        evidence,
      })
    }
  }

  return findings
}

function toneLabel(
  score: number,
  biases: BiasFinding[],
  coldHits: number,
): string {
  const detected = new Set(biases.map((b) => b.id))

  if (
    detected.has('fundamental_attribution_error') ||
    detected.has('framing_effect') ||
    coldHits >= 2
  ) {
    return 'سرزنش‌گر'
  }
  if (detected.has('negativity_bias') || detected.has('defensive_reactance')) {
    return 'تدافعی / تند'
  }
  if (detected.has('empathy_gap') && detected.has('action_bias')) {
    return 'وظیفه‌محورِ سرد'
  }
  if (detected.has('action_bias') || detected.has('empathy_gap')) {
    return 'وظیفه‌محور'
  }
  if (score >= 8) return 'همدلانه و متعادل'
  if (score >= 6) return 'مؤدب با همدلی متوسط'
  if (score >= 4) return 'خنثی / خشک'
  return 'سرد و کم‌همدل'
}

export function scoreEmpathy(chat: string): EmpathyResult {
  const cleaned = chat.trim()
  if (!cleaned) {
    return {
      Score: 0,
      Reason: 'متن چت خالی است؛ امکان ارزیابی همدلی وجود ندارد.',
      Tone: 'نامشخص',
      Biases: [],
    }
  }

  const agentText = agentLines(cleaned).join(' ')
  const source = agentText || cleaned
  const lower = source.toLowerCase()

  let score = 5
  const notes: string[] = []

  const empathyHits = countHits(source, EMPATHY_MARKERS)
  const coldHits = countHits(source, COLD_MARKERS)
  const politeHits = countHits(source, POLITE_MARKERS)

  score += Math.min(3, empathyHits)
  score += Math.min(1, politeHits)
  score -= Math.min(4, coldHits * 2)

  if (/[!]{2,}/.test(source) || /فوراً|سریع باش/i.test(source)) {
    score -= 1
    notes.push('لحن عجله‌دار یا تند دیده شد')
  }

  const asksFeeling =
    /چطورید|چه حسی|نگران|ناراحت|آزار|اذیت/.test(source) || /احساس/.test(lower)
  if (asksFeeling) {
    score += 1
    notes.push('اشاره‌ای به احساس کاربر وجود دارد')
  }

  const solutionFirst =
    empathyHits === 0 &&
    /(لینک|کد پیگیری|تیکت|فرم|سایت|اپ)/.test(source) &&
    source.length > 40

  if (solutionFirst) {
    score -= 1
    notes.push('راه‌حل قبل از تأیید احساس آمده است')
  }

  const biases = detectBiases(source, empathyHits, coldHits)
  if (biases.length >= 3) {
    score -= 1
    notes.push(`${biases.length} الگوی سوگیری در لحن دیده شد`)
  }

  score = Math.max(0, Math.min(9, Math.round(score)))

  let reason: string
  if (score <= 2) {
    reason = `همدلی بسیار ضعیف؛ ${coldHits > 0 ? 'نشانه‌های بی‌اعتنایی/سرزنش وجود دارد' : 'لحن خشک و بدون درک احساس کاربر است'}.`
  } else if (score <= 4) {
    reason = 'همدلی ناکافی؛ پاسخ بیشتر وظیفه‌محور است و احساس کاربر به‌خوبی دیده نشده.'
  } else if (score <= 6) {
    reason = 'همدلی متوسط؛ مؤدب است اما تأیید احساس هنوز سطحی یا ناقص است.'
  } else if (score <= 8) {
    reason = 'همدلی مناسب؛ احساس کاربر دیده شده و لحن انسانی حفظ شده است.'
  } else {
    reason = 'همدلی عالی؛ تأیید احساس، لحن انسانی و کمک‌رسانی به‌خوبی متعادل شده‌اند.'
  }

  if (notes.length > 0) {
    reason = `${reason} (${notes.slice(0, 2).join('؛ ')})`
  }

  const Tone = toneLabel(score, biases, coldHits)

  return { Score: score, Reason: reason, Tone, Biases: biases }
}

export const EMPATHY_PROMPT = `تو یک ارزیاب QC برای چت پشتیبانی هستی.
روی «همدلی» و «لحن متأثر از سوگیری‌های شناختی» امتیاز بده، نه فقط حل فنی مشکل.

تعریف همدلی:
- تأیید احساس کاربر
- لحن محترمانه و انسانی
- اجتناب از سرزنش/عجله/بی‌اعتنایی
- نشان دادن درک قبل از دادن راه‌حل

سوگیری‌های مرتبط با لحن (زیرمجموعه عملی QC؛ نه هر ۱۸۰+ بایاس ادبیات علمی):
confirmation_bias, fundamental_attribution_error, anchoring, negativity_bias,
empathy_gap, availability_heuristic, defensive_reactance, framing_effect,
illusion_of_transparency, action_bias

ورودی: متن کامل یک گفتگوی Goftino.

خروجی را STRICTاً فقط به صورت JSON معتبر برگردان، بدون متن اضافه.
فقط سوگیری‌های تشخیص‌داده‌شده را در Biases بگذار (آرایه خالی اگر هیچ‌کدام نیست):
{
  "Score": 0-9,
  "Reason": "دلیل کوتاه به فارسی",
  "Tone": "برچسب کوتاه لحن به فارسی",
  "Biases": [
    {
      "id": "empathy_gap",
      "nameFa": "شکاف همدلی",
      "evidence": "عبارت یا الگوی کوتاه"
    }
  ]
}

قوانین امتیاز:
0-2: بی‌اعتنا / خشن / سرزنش‌گر
3-4: خشک و وظیفه‌محور بدون درک احساس
5-6: مؤدب اما همدلی سطحی
7-8: همدلی مناسب و متعادل
9: همدلی عالی بدون اغراق یا انحراف از هدف پشتیبانی`

export const SAMPLE_CHATS = [
  {
    id: 'good',
    label: 'نمونه خوب',
    text: `کاربر: برداشت کوینم برگشت خورده هنوز نیومده به حساب والکسم
کارشناس: بابت مورد پیش آمده متاسفم.
کارشناس: بازیابی و ریکاوری، برگشت برداشت کوین امکان دارد زمانبر باشد.
کارشناس: بنده مورد شما را جهت پیگیری و بررسی به بخش مربوطه ارجاع میدهم.`,
  },
  {
    id: 'weak',
    label: 'نمونه ضعیف',
    text: `کاربر: از صبح برداشت تومنم نیومده و خیلی نگرانم من چک دارم
کارشناس: کد پیگیری برداشت را بفرستید.
کاربر: اینه: TRK-9921. واقعا استرس دارم یه کاری کنید زودتر بیاد
کارشناس: واریز از سمت درگاه انجام میشود. امکان تسریع روند وجود ندارد فقط صبر کنید.`,
  },
  {
    id: 'harsh',
    label: 'نمونه تند',
    text: `کاربر: چرا کسی جوابمو نمی‌ده؟ این چه وضعشه چرا لیکوئید شدم بابا اعصاب آدمو بهم میریزید!!!!!!!
کارشناس: خودتون مشکل دارید که درست تحلیل نکردید! در تاریخچه تراکنش ها و نمودار داخلی میتونید بررسی کنید.مشکل از ما نیست.`,
  },
  {
    id: 'confirmation_bias',
    label: 'سوگیری تأیید',
    text: `کاربر: فکر می‌کنم پرداخت دوبار کسر شده؛ موجودی‌ام کم شده.
اپراتور: همون‌طور که گفتم، واضحه که اشتباه کردید. نیازی به تکرار نیست.`,
  },
  {
    id: 'fundamental_attribution_error',
    label: 'خطای اسناد',
    text: `کاربر: چرا سفارشم کنسل شده؟ من هیچ کاری نکردم.
اپراتور: تقصیر شماست؛ بی‌دقتی شما باعث شد. خودتون مشکل دارید.`,
  },
  {
    id: 'anchoring',
    label: 'لنگراندازی',
    text: `کاربر: آدرس را دوباره چک کردم، درسته. هنوز نرسیده.
اپراتور: حتماً آدرس اشتباه است. فقط همون مشکل قبلی؛ از اول اشتباه بوده.`,
  },
  {
    id: 'negativity_bias',
    label: 'منفی‌نگری',
    text: `کاربر: چند بار پیام دادم چون کسی جواب نداد.
اپراتور: خسته کردید. دیگه پیام ندید. آخرین اخطار؛ دیگر پیگیری نمی‌شود.`,
  },
  {
    id: 'empathy_gap',
    label: 'شکاف همدلی',
    text: `کاربر: مهمان دارم و خیلی استرسم؛ سفارشم سه‌روزه نرسیده.
اپراتور: اینقدر جدی نیست. عادیه دیگه. فقط صبر کنید.`,
  },
  {
    id: 'availability_heuristic',
    label: 'در دسترس‌بودن',
    text: `کاربر: وضعیت سفارشم فرق داره با بقیه؛ می‌شه چک کنید؟
اپراتور: همیشه همین‌طور است. همه همین مشکل را دارند؛ مثل بقیه صبر کنید.`,
  },
  {
    id: 'defensive_reactance',
    label: 'واکنش دفاعی',
    text: `کاربر: واقعاً عصبانی‌ام از این تأخیر؛ انتظار دارم جبران کنید.
اپراتور: مشکل از ما نیست. سیستم ما مشکلی ندارد. ما مقصر نیستیم؛ بی‌دلیل عصبانی نشوید.`,
  },
  {
    id: 'framing_effect',
    label: 'اثر قاب‌بندی',
    text: `کاربر: فکر می‌کنم سیستم خطا داده و مبلغ کم شده.
اپراتور: تقصیر سمت شماست. شما باید درست می‌کردید؛ خودتون باید چک می‌کردید.`,
  },
  {
    id: 'illusion_of_transparency',
    label: 'توهم شفافیت',
    text: `کاربر: نمی‌فهمم مرحله بعدی چیه؛ لطفاً توضیح بدید.
اپراتور: که معلومه. واضح بود؛ نیازی به توضیح نیست. همان روال همیشگی.`,
  },
  {
    id: 'action_bias',
    label: 'اقدام فوری',
    text: `کاربر: خیلی نگرانم؛ نمی‌دونم چی کار کنم.
اپراتور: برو سایت. لینک را باز کنید، فرم را پر کنید و تیکت بزنید.`,
  },
] as const

/** Short standards note for UI / README (no single ISO count exists). */
export const BIAS_STANDARDS_NOTE = `تعداد کل بایاس‌ها در ادبیات علمی حدود ۱۸۰+ است (Cognitive Bias Codex / منابع مبتنی بر Kahneman & Tversky)؛ استاندارد ایزوی واحدی برای «تعداد بایاس» وجود ندارد. این ابزار زیرمجموعه‌ای استاندارد برای QC لحن پشتیبانی را پوشش می‌دهد.`
