نظام الكاشير الذكي
Smart POS System


Figma UI/UX Design Specification — توثيق تصميم كامل



الإصدار 1.0  |  نظام مبيعات متكامل  |  Desktop + Tablet + Mobile
 
1. نظرة عامة على التصميم

هذا المستند يحتوي على المواصفات الكاملة لتصميم Figma لنظام الكاشير الذكي — نظام مبيعات متكامل يشمل نقطة البيع وإدارة المخزون والعملاء والتقارير.

🎯 أهداف التصميم
•	سرعة الاستخدام — الكاشير يكمل عملية بيع في أقل من 30 ثانية
•	وضوح المعلومات — الأرقام والأسعار تُقرأ من مسافة
•	تقليل الأخطاء — تأكيدات واضحة قبل كل عملية حساسة
•	دعم كامل للعربية — RTL + خط Cairo احترافي
•	Responsive — يعمل على Desktop 1920px وTablet 1024px وMobile 390px


🏗️ هيكل التطبيق
الشاشة	الوصف	الأولوية
Login	تسجيل الدخول بـ username + password	🔴 حرج
Dashboard	لوحة تحكم مع إحصائيات وتنبيهات	🔴 حرج
POS	نقطة البيع — بحث + سلة + دفع	🔴 حرج
Inventory	إدارة المنتجات والمخزون	🔴 حرج
Customers	إدارة العملاء والديون	🟡 مهم
Reports	تقارير المبيعات والإحصائيات	🟡 مهم
Purchases	المشتريات والموردين	🟡 مهم
Users	إدارة المستخدمين والصلاحيات	🟢 إضافي
Settings	إعدادات النظام	🟢 إضافي
 
2. Design System — نظام التصميم

🎨 Color Palette — لوحة الألوان
التصميم يعتمد Dark Theme مع أخضر كـ Primary وألوان semantic واضحة لكل حالة.

الألوان الأساسية:
#2ECC71	Primary — أخضر	الأزرار الرئيسية، Active states، النجاح

#12131A	Sidebar BG	خلفية السايدبار — أداكن عنصر في الشاشة

#161B2E	Page BG	خلفية الصفحة الرئيسية

#1E2640	Card BG	بطاقات المحتوى


الألوان Semantic (حسب المعنى):
#E74C3C	Danger — أحمر	🔴 الأخطاء، الحذف، التنبيهات الحرجة

#F1C40F	Warning — أصفر	🟡 التحذيرات، مخزون منخفض، آجل

#3498DB	Info — أزرق	🔵 المعلومات، روابط، حالة محايدة

#2ECC71	Success — أخضر	✅ النجاح، مكتمل، نقدي


ألوان النصوص:
الاسم	HEX	الاستخدام
Text/Primary	#FFFFFF	النصوص الرئيسية على خلفيات داكنة
Text/Secondary	#C0CDE0	نصوص ثانوية، تفاصيل
Text/Muted	#7A8CA0	placeholder، labels خافتة
Text/OnLight	#1A1A2E	نصوص على حقول بيضاء
Text/Warning	#1A1A2E	نصوص على خلفية صفراء


✍️ Typography — الخطوط
الخط الرسمي للتطبيق: Cairo — متاح مجاناً على Google Fonts، يدعم العربية بشكل ممتاز.
Google Fonts Link: fonts.google.com/specimen/Cairo

الاسم	الحجم	الوزن	الاستخدام
H1 / Title	32px	Bold 700	عناوين الصفحات الرئيسية
H2 / Heading	26px	Bold 700	عناوين الأقسام والبطاقات
H3 / Subheading	21px	SemiBold 600	عناوين فرعية
Body/LG	18px	Regular 400	نص كبير — مهم
Body/MD	16px	Regular 400	النص العادي
Body/SM	14px	Medium 500	نصوص جداول، تفاصيل
Caption	12px	Regular 400	ملاحظات، timestamps
Button	16px	Bold 700	نص الأزرار دايماً Bold
Price	21px	Bold 700	الأسعار والمبالغ


📐 Spacing & Grid — الشبكة والمسافات
نظام مسافات مبني على 4px base unit:
الاسم	القيمة	الاستخدام
XS	6px	مسافات داخل العناصر الصغيرة
SM	10px	padding الأزرار الصغيرة
MD	14px	الفجوة بين العناصر
LG	20px	padding البطاقات الداخلي
XL	28px	المسافة بين الأقسام
XXL	36px	padding الصفحات
XXXL	52px	المسافات الكبيرة

Grid: 12-column grid | Gutter: 20px | Margin: 28px


🧩 Components — المكونات
الأزرار:
النوع	اللون	الارتفاع	Radius	الاستخدام
Primary	#2ECC71	42px	8px	الإجراء الرئيسي
Success	#2ECC71	42px	8px	حفظ، تأكيد
Danger	#E74C3C	42px	8px	حذف، إلغاء
Warning	#F1C40F	42px	8px	تحذير، تعليق
Info	#3498DB	42px	8px	معلومات، تصدير
Ghost	Transparent	42px	8px	إجراءات ثانوية
Large	#2ECC71	50px	8px	CTA رئيسي


حقول الإدخال (Inputs):
•	خلفية: أبيض #FFFFFF — تتميز بوضوح عن الخلفية الداكنة
•	حدود: 1px رمادي #CCCCCC — عادي | أخضر #2ECC71 عند Focus
•	نص: داكن #1A1A2E — قراءة واضحة على الأبيض
•	Placeholder: رمادي #9CA3AF
•	الارتفاع: 42px عادي | 48px كبير
•	Radius: 8px
•	Padding أفقي: 14px


 
3. Screen Specifications — مواصفات الشاشات

🗂️ Layout العام
العنصر	الحجم	التفاصيل
Sidebar	220px عرض	ثابت على اليمين (RTL) | BG #12131A
Header	64px ارتفاع	اسم الصفحة + ساعة + مستخدم | BG #161B2E
Content	الباقي	BG #161B2E | Padding 28px
Active Sidebar Item	220px	BG #1A3A2A | نص أخضر #2ECC71
Card	متغير	BG #1E2640 | Radius 10px | Padding 20px


🔐 Login Screen — شاشة الدخول
شاشة مقسومة نصين: يسار للعلامة التجارية، يمين لنموذج الدخول.

المكونات الرئيسية:
•	يسار (42%): Logo + اسم التطبيق + قائمة 5 ميزات + version
•	يمين (58%): بطاقة مركزية 420px عرض
•	حقل: اسم المستخدم (Input أبيض H=46px)
•	حقل: كلمة المرور + زر إظهار/إخفاء 👁
•	زر الدخول: Primary أخضر H=50px عرض كامل
•	شريط أخضر 5px في أعلى البطاقة
•	رسالة خطأ باللون الأحمر تحت الحقول

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	Split Layout 42/58
Tablet	1024 × 768px	Split Layout 40/60
Mobile	390 × 844px	Stack — يسار فوق، يمين تحت



📊 Dashboard — لوحة التحكم
الشاشة الرئيسية بعد الدخول — إحصائيات سريعة + تنبيهات + رسوم بيانية.

المكونات الرئيسية:
•	Header: اسم الصفحة + ساعة + اسم المستخدم + زر تسجيل خروج
•	Row 1 — KPI Cards (6 بطاقات): مبيعات اليوم، عدد الفواتير، إجمالي المخزون، إجمالي العملاء، ديون العملاء، أرباح الشهر
•	كل بطاقة KPI: أيقونة ملونة + رقم كبير + اسم + مقارنة بالأمس (%)
•	Row 2 يسار (65%): رسم بياني مبيعات 7 أيام (Line Chart)
•	Row 2 يمين (35%): أكثر 5 منتجات مبيعاً
•	Row 3 يسار (50%): آخر 10 فواتير مع الحالة
•	Row 3 يمين (50%): تنبيهات المخزون المنتهي أو المنخفض
•	Quick Action Buttons: + بيع جديد | + منتج | + عميل

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop 1920px	1920 × 1080px	6 cols KPI | 65/35 split
Desktop 1440px	1440 × 900px	3+3 cols KPI | 65/35 split
Tablet	1024 × 768px	2+2+2 cols KPI | Stack
Mobile	390 × 844px	1 col — Stack



🛒 POS Screen — نقطة البيع
الشاشة الأهم — الكاشير يستخدمها طوال اليوم. أولوية السرعة والوضوح.

المكونات الرئيسية:
•	شريط إحصائيات علوي: مبيعات اليوم + عدد الفواتير + متوسط الفاتورة + الساعة
•	يسار (55%): حقل بحث كبير H=50px + dropdown نتائج ذكي + جدول السلة
•	جدول السلة: اسم المنتج | الكمية (+ / −) | السعر | الإجمالي | حذف
•	شريط الإجمالي السفلي: عدد الأصناف + مجموع الوحدات + الإجمالي + زر إتمام
•	يمين (45%): بطاقة العميل + الإجماليات + خصم + طريقة الدفع + ملاحظات
•	طريقة الدفع: نقدي (أخضر) / آجل (أصفر) — أزرار واضحة H=42px
•	حقل المدفوع + زر = للملء التلقائي + حقل الباقي
•	Keyboard shortcuts مرئية: F2 بحث | F4 تعليق | F9 استرجاع | F12 إتمام
•	Dialog إيصال بعد الإتمام: تاريخ عربي + بيانات الفاتورة + زر طباعة

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop 1920px	1920 × 1080px	55/45 Split
Desktop 1440px	1440 × 900px	55/45 Split
Tablet Landscape	1024 × 768px	55/45 Split مضغوط
Tablet Portrait	768 × 1024px	Stack — يسار فوق



📦 Inventory Screen — إدارة المخزون
عرض وإدارة كل المنتجات مع تنبيهات المخزون.

المكونات الرئيسية:
•	Header: عنوان + حقل بحث كبير + فلتر الفئة + زر إضافة منتج (أزرق)
•	شريط تنبيهات: منتجات منتهية | مخزون منخفض | منتهية الصلاحية
•	جدول المنتجات: اسم | باركود | مخزون (ملون حسب الحالة) | سعر بيع | سعر شراء | وحدة | تعديل
•	ألوان المخزون: أخضر = كافي | أصفر = منخفض | أحمر = نفد
•	Pagination: صفحة × / × | عدد المنتجات | أزرار السابق/التالي
•	Dialog إضافة/تعديل: 8 حقول في شبكة 2×4 + header ملون
•	حقل تاريخ الانتهاء مع DatePicker

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	Full Width Table
Tablet	1024 × 768px	Table مع Scroll أفقي
Mobile	390 × 844px	Cards بدل Table



👥 Customers Screen — إدارة العملاء
إدارة بيانات العملاء وتتبع الديون.

المكونات الرئيسية:
•	Header: عنوان + بحث + فلتر (كل العملاء / مديونين فقط) + إضافة
•	إحصائيات سريعة: إجمالي العملاء | إجمالي الديون | متوسط الدين
•	جدول: الاسم | التليفون | الدين (أحمر لو > 0) | حد الائتمان | آخر عملية | تعديل
•	Dialog العميل: اسم + تليفون + عنوان + حد ائتمان + ملاحظات
•	صفحة عميل مفصلة: بياناته + سجل معاملاته + إجمالي الديون

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	Table مع تفاصيل
Tablet	1024 × 768px	Table مضغوط
Mobile	390 × 844px	Cards



📈 Reports Screen — التقارير
تقارير شاملة مع إمكانية التصدير.

المكونات الرئيسية:
•	فلاتر: من تاريخ / إلى تاريخ + نوع التقرير (يومي/أسبوعي/شهري/مخصص)
•	أزرار: تقرير يومي (أخضر) | تقرير فترة (أزرق) | تصدير (برتقالي)
•	يسار (65%): بطاقة ملخص (عدد فواتير + إيراد + خصم + مرتجعات) + أكثر المنتجات
•	يمين (35%): تصدير سريع (اليوم / فترة / مخزون / مديونين)
•	رسم بياني: مبيعات اليوم بالساعة (Bar Chart)
•	جدول المبيعات التفصيلي مع pagination

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	65/35 Split
Tablet	1024 × 768px	Stack
Mobile	390 × 844px	Stack



🏪 Purchases Screen — المشتريات والموردين
تسجيل المشتريات وإدارة الموردين.

المكونات الرئيسية:
•	Header: عنوان + بحث + فلتر التاريخ + إضافة فاتورة شراء
•	جدول الموردين: الاسم | التليفون | إجمالي المشتريات | آخر عملية
•	جدول المشتريات: رقم الفاتورة | المورد | التاريخ | الإجمالي | الحالة
•	Dialog إضافة مشتريات: اختيار مورد + جدول منتجات + إجمالي
•	حالات الفاتورة: مدفوعة (أخضر) | معلقة (أصفر) | ملغية (أحمر)

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	Full Width
Tablet	1024 × 768px	مضغوط
Mobile	390 × 844px	Cards



🔒 Users Screen — المستخدمين والصلاحيات
إدارة حسابات المستخدمين وصلاحياتهم.

المكونات الرئيسية:
•	جدول: الاسم | اسم المستخدم | الدور (Admin/Manager/Cashier) | الحالة | آخر دخول | إدارة
•	أدوار ملونة: Admin أحمر | Manager أزرق | Cashier أخضر
•	Dialog المستخدم: username + كلمة مرور + الاسم الكامل + الدور + نشط/متوقف
•	زر تفعيل/إيقاف منفصل
•	إعادة تعيين كلمة المرور

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	Full Width
Tablet	1024 × 768px	مضغوط
Mobile	390 × 844px	Cards



⚙️ Settings Screen — الإعدادات
إعدادات النظام منظمة في بطاقات.

المكونات الرئيسية:
•	بطاقة بيانات المحل: اسم المحل + عنوان + تليفون + لوجو
•	بطاقة الطابعة: اختيار الطابعة + اختبار الطباعة + إعدادات الإيصال
•	بطاقة النسخ الاحتياطي: مجلد الحفظ + نسخ الآن + جدولة تلقائية
•	بطاقة المظهر: Dark/Light toggle + حجم الخط + اللغة
•	بطاقة الضرائب: نسبة الضريبة + تفعيل/إيقاف
•	كل بطاقة: header ملون + محتوى + زر حفظ

أبعاد الشاشات:
الجهاز	العرض × الارتفاع	Layout
Desktop	1440 × 900px	بطاقات في Grid 2×3
Tablet	1024 × 768px	بطاقات في Grid 1×6
Mobile	390 × 844px	Stack



 
4. Responsive Design — التصميم المتجاوب

📱 Breakpoints
الاسم	العرض	Layout	Sidebar
Mobile SM	< 390px	1 Column Stack	Hidden — Drawer
Mobile	390-767px	1 Column Stack	Hidden — Drawer
Tablet	768-1023px	2 Columns	Collapsed Icons
Desktop SM	1024-1439px	Full Layout	220px
Desktop	1440-1919px	Full Layout	220px
Desktop LG	1920px+	Full Layout + Wide	220px


📲 Mobile Adaptations
•	Sidebar يتحول لـ Bottom Navigation Bar مع 5 أيقونات
•	POS Screen: بحث فوق + سلة في Tab + دفع في Tab
•	الجداول تتحول لـ Cards بـ Swipe للتعديل
•	الأزرار تكبر لـ 48px لسهولة اللمس (min touch target)
•	Input font-size >= 16px لمنع الـ zoom في iOS


 
5. UX Flows — تدفقات المستخدم

🛒 Flow 1: إتمام عملية بيع
#	الخطوة	الوصف	الوقت المتوقع
1	فتح شاشة POS	تلقائياً مع بداية الشيفت	0 ثانية
2	إدخال الباركود	Scan أو كتابة → Enter	2 ثانية
3	تكرار للمنتجات الباقية	كل منتج 2 ثانية	× عدد المنتجات
4	إدخال المبلغ المدفوع	الكاشير يكتب المبلغ	3 ثانية
5	F12 أو زر الإتمام	Dialog تأكيد الفاتورة	1 ثانية
6	طباعة الإيصال	Thermal Printer	3 ثانية

⏱️ إجمالي عملية بيع 3 منتجات: ~15 ثانية


📦 Flow 2: إضافة منتج جديد للمخزون
•	Inventory Screen → + إضافة منتج
•	Dialog: إدخال الاسم + سعر البيع (إلزاميان)
•	باقي الحقول اختيارية (باركود، سعر الشراء، مخزون، حد تنبيه، وحدة، تاريخ انتهاء)
•	حفظ → تحديث فوري للجدول + toast success


🔔 Flow 3: تنبيهات المخزون
•	🔴 منتج نفد: تنبيه أحمر في Dashboard + أيقونة في Inventory
•	🟡 مخزون منخفض (< حد التنبيه): تنبيه أصفر
•	🟠 منتج قارب على الانتهاء (< 30 يوم): تنبيه برتقالي
•	الكاشير يشوف التنبيهات في أعلى كل صفحة + Dashboard


 
6. Figma Setup — إعداد Figma

📁 هيكل الـ Pages في Figma
•	Page 1: 🎨 Design System (Colors + Typography + Components)
•	Page 2: 🖥️ Desktop Screens (1440px)
•	Page 3: 📱 Tablet Screens (1024px)
•	Page 4: 📲 Mobile Screens (390px)
•	Page 5: 🔄 User Flows & Diagrams
•	Page 6: 🧪 Prototype Connections


🔌 Plugins الضرورية
Plugin	الاستخدام
Iconify	مكتبة أيقونات ضخمة — مجانية
Auto Layout Helper	تسريع إنشاء المكونات
Figma Tokens	إدارة Design Tokens (الألوان والخطوط)
Arabic Text Fixer	إصلاح اتجاه النص العربي
Unsplash	صور مجانية للـ mockups
Color Palettes	استيراد الـ palette دفعة واحدة


⚙️ Figma Settings المهمة
•	Text Direction: Right to Left (RTL) لكل العناصر العربية
•	Grid: 12 columns | Gutter 20px | Margin 28px على Desktop
•	Font: Cairo — تحميل من Google Fonts أولاً
•	Frame Size: 1440×900 للـ Desktop الرئيسي
•	Color Styles: أنشئ Color Style لكل لون في الـ Palette
•	Text Styles: أنشئ Text Style لكل حجم خط
•	Component: اعمل كل Button وInput وCard كـ Component مع Variants


🎯 Auto Layout Rules
•	Direction: Horizontal أو Vertical حسب الـ layout
•	Spacing: استخدم قيم الـ Spacing System (6/10/14/20/28px)
•	Fill Container: للعناصر اللي لازم تمتد
•	Hug Contents: للعناصر اللي حجمها يعتمد على محتواها
•	Fixed Width/Height: للعناصر اللي ليها حجم ثابت (buttons, inputs)


 
7. Implementation Notes — ملاحظات التطبيق

🐍 تطبيق في CustomTkinter
•	استخدم theme.py كـ Single Source of Truth لكل الألوان
•	كل شاشة ترث fg_color=Colors.BG_DARK
•	الـ inputs دايماً fg_color=Colors.INPUT_BG (أبيض) + text_color=Colors.TEXT_DARK
•	الأزرار من StyleFactory — مش hard-coded colors
•	الخط دايماً من Fonts class — مش hard-coded
•	Spacing من Spacing class — مش hard-coded numbers


🎨 Color Usage Rules
الحالة	اللون المناسب
عملية ناجحة / حفظ / نقدي	✅ أخضر #2ECC71
خطأ / حذف / مشكلة	🔴 أحمر #E74C3C
تحذير / مخزون منخفض / آجل	🟡 أصفر #F1C40F
معلومات / تصدير / تفاصيل	🔵 أزرق #3498DB
إجراء ثانوي / Ghost	⬜ Transparent + border
نص على زر أصفر	⬛ أسود #1A1A2E (مش أبيض)
ديون العملاء	🔴 أحمر #E74C3C
مبالغ وأرباح	✅ أخضر #2ECC71


♿ Accessibility
•	Contrast Ratio: نص أبيض على أخضر ≥ 4.5:1 ✅
•	نص داكن على أصفر ≥ 4.5:1 ✅
•	Touch targets ≥ 42px على Desktop | ≥ 48px على Mobile
•	Focus states واضحة على كل العناصر التفاعلية
•	Keyboard navigation كاملة (Tab + Enter + F-keys)



نظام الكاشير الذكي — Figma Design Specification v1.0
