import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LANGS = [
  ['ar','Arabic'],['fr','French'],['es','Spanish'],['de','German'],
  ['zh','Chinese'],['tr','Turkish'],['pt','Portuguese'],['hi','Hindi'],['none','Off'],
];
const EMO_COL = { neutral:'#9ca3af', frustration:'#f59e0b', anger:'#ef4444', satisfaction:'#10b981', confusion:'#8b5cf6', urgency:'#f97316' };
const VIO_STYLE = {
  pci:       { bg:'#fee2e2', color:'#b91c1c', activeBg:'#dc2626', activeColor:'#fff' },
  policy:    { bg:'#fef9c3', color:'#854d0e', activeBg:'#d97706', activeColor:'#fff' },
  rude:      { bg:'#fff7ed', color:'#c2410c', activeBg:'#ea580c', activeColor:'#fff' },
  competitor:{ bg:'#dcfce7', color:'#166534', activeBg:'#16a34a', activeColor:'#fff' },
};
const ALERT_STYLE = {
  pci:       { bg:'#fef2f2', color:'#dc2626', icon:'🔴' },
  policy:    { bg:'#fffbeb', color:'#d97706', icon:'⚠️' },
  rude:      { bg:'#fff7ed', color:'#ea580c', icon:'🔶' },
  competitor:{ bg:'#f0fdf4', color:'#16a34a', icon:'💡' },
};

const SAMPLE_SEGS = [
  {
    id:0, s:0, e:18, spk:'agent', emo:'neutral', flag:null,
    en:[{w:'Good',t:0},{w:'afternoon,',t:1.2},{w:'thank',t:2.5},{w:'you',t:3.2},{w:'for',t:3.8},{w:'calling',t:4.5},{w:'support.',t:5.5},{w:'My',t:8},{w:'name',t:8.8},{w:'is',t:9.5},{w:'James,',t:10},{w:'how',t:11.5},{w:'can',t:12.2},{w:'I',t:12.8},{w:'help',t:13.2},{w:'you',t:14},{w:'today?',t:14.8}],
    tr:{
      ar:[{w:'مساء',t:0},{w:'الخير،',t:1.2},{w:'شكراً',t:2.5},{w:'لاتصالك.',t:4},{w:'اسمي',t:8},{w:'جيمس،',t:10},{w:'كيف',t:11.5},{w:'يمكنني',t:12.5},{w:'مساعدتك؟',t:13.5}],
      fr:[{w:'Bonne',t:0},{w:'après-midi,',t:1.2},{w:'merci',t:2.5},{w:'d\'appeler.',t:4},{w:'Je',t:8},{w:'m\'appelle',t:9},{w:'James,',t:10},{w:'comment',t:11.5},{w:'puis-je',t:12.5},{w:'vous',t:13.2},{w:'aider?',t:14}],
      es:[{w:'Buenas',t:0},{w:'tardes.',t:1.2},{w:'Soy',t:8},{w:'James,',t:10},{w:'¿cómo',t:11.5},{w:'puedo',t:12.5},{w:'ayudarle?',t:13.5}],
      de:[{w:'Guten',t:0},{w:'Nachmittag,',t:1.2},{w:'danke.',t:2.5},{w:'Ich',t:8},{w:'heiße',t:9},{w:'James,',t:10},{w:'wie',t:11.5},{w:'kann',t:12.2},{w:'ich',t:12.8},{w:'helfen?',t:13.5}],
      zh:[{w:'下午好，',t:0},{w:'感谢来电。',t:4},{w:'我叫詹姆斯，',t:10},{w:'有何需要？',t:13}],
      tr:[{w:'İyi',t:0},{w:'günler,',t:1.2},{w:'aradığınız',t:2.5},{w:'için',t:3.8},{w:'teşekkürler.',t:5},{w:'James,',t:10},{w:'nasıl',t:11.5},{w:'yardımcı',t:12.5},{w:'olabilirim?',t:13.5}],
      pt:[{w:'Boa',t:0},{w:'tarde,',t:1.2},{w:'obrigado.',t:2.5},{w:'Sou',t:8},{w:'James,',t:10},{w:'como',t:11.5},{w:'posso',t:12.5},{w:'ajudar?',t:13.5}],
      hi:[{w:'शुभ',t:0},{w:'दोपहर,',t:1.2},{w:'कॉल',t:2.5},{w:'के',t:3.5},{w:'लिए',t:4},{w:'धन्यवाद।',t:5},{w:'मेरा',t:8},{w:'नाम',t:8.8},{w:'जेम्स',t:9.5},{w:'है।',t:10},{w:'कैसे',t:12},{w:'मदद',t:13},{w:'करूं?',t:14}],
    }
  },
  {
    id:1, s:18, e:70, spk:'customer', emo:'frustration', flag:null,
    en:[{w:'Hi.',t:18},{w:'I',t:20},{w:'have',t:20.8},{w:'a',t:21.5},{w:'charge',t:22},{w:'of',t:23},{w:'£89',t:23.5},{w:'on',t:24.5},{w:'my',t:25},{w:'account',t:25.5},{w:'and',t:27},{w:'I',t:28},{w:'cancelled',t:28.5},{w:'my',t:30},{w:'subscription',t:30.5},{w:'two',t:32},{w:'weeks',t:32.8},{w:'ago.',t:33.5},{w:'I',t:50},{w:'have',t:50.8},{w:'the',t:51.5},{w:'confirmation',t:52},{w:'email',t:54},{w:'right',t:55.5},{w:'here.',t:56.5}],
    tr:{
      ar:[{w:'مرحباً.',t:18},{w:'لدي',t:20},{w:'رسوم',t:22},{w:'£89',t:23.5},{w:'على',t:25},{w:'حسابي.',t:25.5},{w:'ألغيت',t:28.5},{w:'اشتراكي',t:30.5},{w:'منذ',t:32},{w:'أسبوعين.',t:33.5},{w:'بريد',t:52},{w:'التأكيد',t:53},{w:'معي.',t:56.5}],
      fr:[{w:'Bonjour.',t:18},{w:'J\'ai',t:20},{w:'un',t:21.5},{w:'prélèvement',t:22},{w:'de',t:23},{w:'89£',t:23.5},{w:'et',t:27},{w:'j\'ai',t:28},{w:'annulé',t:28.5},{w:'il',t:32},{w:'y',t:32.5},{w:'a',t:32.8},{w:'deux',t:33},{w:'semaines.',t:33.5},{w:'J\'ai',t:50},{w:'l\'email',t:52},{w:'ici.',t:56.5}],
      es:[{w:'Hola.',t:18},{w:'Tengo',t:20},{w:'un',t:21.5},{w:'cargo',t:22},{w:'de',t:23},{w:'£89',t:23.5},{w:'y',t:27},{w:'cancelé',t:28.5},{w:'hace',t:32},{w:'dos',t:32.8},{w:'semanas.',t:33.5},{w:'Tengo',t:50},{w:'el',t:51.5},{w:'correo',t:52},{w:'aquí.',t:56.5}],
      de:[{w:'Hallo.',t:18},{w:'Ich',t:20},{w:'habe',t:20.8},{w:'eine',t:21.5},{w:'Abbuchung',t:22},{w:'von',t:23},{w:'89£.',t:23.5},{w:'Ich',t:28},{w:'habe',t:28.5},{w:'vor',t:32},{w:'zwei',t:32.8},{w:'Wochen',t:33},{w:'gekündigt.',t:33.5},{w:'Die',t:51.5},{w:'Bestätigungsmail',t:52},{w:'ist',t:55.5},{w:'hier.',t:56.5}],
      zh:[{w:'你好。',t:18},{w:'我账户上有',t:22},{w:'89英镑',t:23.5},{w:'的收费，',t:25.5},{w:'两周前',t:28.5},{w:'取消了',t:30.5},{w:'订阅。',t:33.5},{w:'确认邮件',t:52},{w:'在这。',t:56.5}],
      tr:[{w:'Merhaba.',t:18},{w:'89£',t:23.5},{w:'tutarında',t:22},{w:'ücret',t:22.5},{w:'var.',t:25.5},{w:'İki',t:32},{w:'hafta',t:32.8},{w:'önce',t:33},{w:'iptal',t:28.5},{w:'ettim.',t:30.5},{w:'Onay',t:50},{w:'e-postam',t:52},{w:'burada.',t:56.5}],
      pt:[{w:'Olá.',t:18},{w:'Tenho',t:20},{w:'uma',t:21.5},{w:'cobrança',t:22},{w:'de',t:23},{w:'£89',t:23.5},{w:'e',t:27},{w:'cancelei',t:28.5},{w:'há',t:32},{w:'duas',t:32.8},{w:'semanas.',t:33.5},{w:'Tenho',t:50},{w:'o',t:51.5},{w:'e-mail',t:52},{w:'aqui.',t:56.5}],
      hi:[{w:'नमस्ते।',t:18},{w:'मेरे',t:20},{w:'खाते',t:22},{w:'पर',t:23},{w:'£89',t:23.5},{w:'का',t:24},{w:'चार्ज',t:24.5},{w:'है',t:25},{w:'और',t:27},{w:'मैंने',t:28},{w:'दो',t:32},{w:'हफ्ते',t:32.8},{w:'पहले',t:33},{w:'रद्द',t:28.5},{w:'किया।',t:33.5},{w:'पुष्टि',t:52},{w:'ईमेल',t:53},{w:'यहाँ',t:55.5},{w:'है।',t:56.5}],
    }
  },
  {
    id:2, s:70, e:154, spk:'agent', emo:'neutral',
    flag:{type:'policy',msg:'Wrong policy stated — agent said 30-day notice required. Actual policy is 7 days. Highlighted in BOTH transcript and translation.'},
    en:[
      {w:'I',t:70},{w:'can',t:70.8},{w:'see',t:71.5},{w:'your',t:72},{w:'account',t:72.8},{w:'here.',t:73.5},
      {w:'Our',t:76},{w:'records',t:76.8},{w:'show',t:77.8},{w:'the',t:78.5},{w:'subscription',t:79},{w:'was',t:81},{w:'never',t:81.8},{w:'formally',t:82.5},{w:'cancelled.',t:83.5},
      {w:'You',t:93,vio:'policy'},{w:'would',t:93.8,vio:'policy'},{w:'need',t:94.5,vio:'policy'},{w:'to',t:95,vio:'policy'},{w:'call',t:95.5,vio:'policy'},{w:'us',t:96,vio:'policy'},{w:'within',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'days',t:98.2,vio:'policy'},{w:'to',t:99,vio:'policy'},{w:'cancel.',t:99.8,vio:'policy'},
      {w:'Without',t:110},{w:'a',t:111},{w:'reference',t:111.5},{w:'I',t:113},{w:'cannot',t:113.5},{w:'process',t:114.5},{w:'a',t:115.5},{w:'refund.',t:116}
    ],
    tr:{
      ar:[{w:'يمكنني',t:70},{w:'رؤية',t:71.5},{w:'حسابك.',t:73.5},{w:'سجلاتنا',t:76.8},{w:'تُظهر',t:77.8},{w:'أنه',t:79},{w:'لم',t:81},{w:'يُلغَ.',t:83.5},{w:'كان',t:93,vio:'policy'},{w:'يجب',t:94,vio:'policy'},{w:'الاتصال',t:95.5,vio:'policy'},{w:'خلال',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'يوماً.',t:99.8,vio:'policy'},{w:'بدون',t:110},{w:'رقم',t:111.5},{w:'مرجعي',t:112},{w:'لا',t:113},{w:'أستطيع',t:113.5},{w:'الاسترداد.',t:116}],
      fr:[{w:'Je',t:70},{w:'vois',t:71.5},{w:'votre',t:72},{w:'compte.',t:73.5},{w:'Nos',t:76},{w:'dossiers',t:76.8},{w:'montrent',t:77.8},{w:'qu\'il',t:79},{w:'n\'a',t:81},{w:'jamais',t:81.8},{w:'été',t:82.5},{w:'annulé.',t:83.5},{w:'Vous',t:93,vio:'policy'},{w:'auriez',t:93.8,vio:'policy'},{w:'dû',t:94.5,vio:'policy'},{w:'appeler',t:95.5,vio:'policy'},{w:'dans',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'jours.',t:99.8,vio:'policy'},{w:'Sans',t:110},{w:'référence,',t:111.5},{w:'je',t:113},{w:'ne',t:113.5},{w:'peux',t:114},{w:'rembourser.',t:116}],
      es:[{w:'Veo',t:71.5},{w:'su',t:72},{w:'cuenta.',t:73.5},{w:'Nuestros',t:76},{w:'registros',t:76.8},{w:'muestran',t:77.8},{w:'que',t:79},{w:'nunca',t:81.8},{w:'se',t:82.5},{w:'canceló.',t:83.5},{w:'Debería',t:93,vio:'policy'},{w:'haber',t:93.8,vio:'policy'},{w:'llamado',t:95.5,vio:'policy'},{w:'en',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'días.',t:99.8,vio:'policy'},{w:'Sin',t:110},{w:'referencia',t:111.5},{w:'no',t:113.5},{w:'puedo',t:114.5},{w:'reembolsar.',t:116}],
      de:[{w:'Ich',t:70},{w:'sehe',t:71.5},{w:'Ihr',t:72},{w:'Konto.',t:73.5},{w:'Unsere',t:76},{w:'Aufzeichnungen',t:76.8},{w:'zeigen',t:77.8},{w:'keine',t:81.8},{w:'Kündigung.',t:83.5},{w:'Sie',t:93,vio:'policy'},{w:'hätten',t:93.8,vio:'policy'},{w:'innerhalb',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'Tagen',t:98.2,vio:'policy'},{w:'anrufen',t:95.5,vio:'policy'},{w:'müssen.',t:99.8,vio:'policy'},{w:'Ohne',t:110},{w:'Referenz',t:111.5},{w:'kann',t:113.5},{w:'ich',t:114},{w:'nicht',t:114.5},{w:'erstatten.',t:116}],
      zh:[{w:'我能',t:70},{w:'看到',t:71.5},{w:'您的',t:72},{w:'账户。',t:73.5},{w:'记录显示',t:79},{w:'从未',t:81.8},{w:'正式取消。',t:83.5},{w:'您需要',t:93,vio:'policy'},{w:'在30天内',t:97.5,vio:'policy'},{w:'致电',t:95.5,vio:'policy'},{w:'才能取消。',t:99.8,vio:'policy'},{w:'没有',t:110},{w:'参考号',t:111.5},{w:'无法',t:113.5},{w:'退款。',t:116}],
      tr:[{w:'Hesabınızı',t:72},{w:'görüyorum.',t:73.5},{w:'Kayıtlarımız',t:76.8},{w:'aboneliğin',t:79},{w:'hiç',t:81},{w:'iptal',t:81.8},{w:'edilmediğini',t:82.5},{w:'gösteriyor.',t:83.5},{w:'30',t:97.5,vio:'policy'},{w:'gün',t:98.2,vio:'policy'},{w:'içinde',t:96.8,vio:'policy'},{w:'aramanız',t:95.5,vio:'policy'},{w:'gerekiyordu.',t:99.8,vio:'policy'},{w:'Referans',t:111.5},{w:'olmadan',t:110},{w:'iade',t:114.5},{w:'yapamam.',t:116}],
      pt:[{w:'Vejo',t:70},{w:'a',t:72},{w:'sua',t:72.2},{w:'conta.',t:73.5},{w:'Nossos',t:76},{w:'registros',t:76.8},{w:'mostram',t:77.8},{w:'que',t:79},{w:'nunca',t:81.8},{w:'foi',t:82.5},{w:'cancelado.',t:83.5},{w:'Deveria',t:93,vio:'policy'},{w:'ter',t:93.8,vio:'policy'},{w:'ligado',t:95.5,vio:'policy'},{w:'em',t:96.8,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'dias.',t:99.8,vio:'policy'},{w:'Sem',t:110},{w:'referência',t:111.5},{w:'não',t:113.5},{w:'posso',t:114.5},{w:'reembolsar.',t:116}],
      hi:[{w:'मैं',t:70},{w:'आपका',t:72},{w:'खाता',t:72.8},{w:'देख',t:71.5},{w:'सकता',t:71.8},{w:'हूं।',t:73.5},{w:'हमारे',t:76},{w:'रिकॉर्ड',t:76.8},{w:'दिखाते',t:77.8},{w:'हैं',t:78.5},{w:'कि',t:79},{w:'सदस्यता',t:79.5},{w:'कभी',t:81.8},{w:'रद्द',t:82.5},{w:'नहीं',t:83},{w:'हुई।',t:83.5},{w:'आपको',t:93,vio:'policy'},{w:'30',t:97.5,vio:'policy'},{w:'दिनों',t:98.2,vio:'policy'},{w:'के',t:99,vio:'policy'},{w:'भीतर',t:96.8,vio:'policy'},{w:'कॉल',t:95.5,vio:'policy'},{w:'करना',t:95.8,vio:'policy'},{w:'था।',t:99.8,vio:'policy'}],
    }
  },
  {
    id:3, s:252, e:310, spk:'agent', emo:'neutral',
    flag:{type:'pci',msg:'CRITICAL PCI-DSS VIOLATION — Agent requesting card number to be spoken aloud. Will be captured in recording. Highlighted in BOTH lines.'},
    en:[
      {w:'I',t:252},{w:'need',t:252.8},{w:'to',t:253.5},{w:'verify',t:254},{w:'your',t:255},{w:'identity.',t:255.8},
      {w:'Can',t:258},{w:'you',t:258.8},{w:'confirm',t:259.5},{w:'the',t:260.5},
      {w:'card',t:261,vio:'pci'},{w:'number',t:262,vio:'pci'},{w:'on',t:263,vio:'pci'},{w:'the',t:263.5,vio:'pci'},{w:'account?',t:264,vio:'pci'},
      {w:'The',t:267},{w:'16',t:267.8,vio:'pci'},{w:'digits',t:268.5,vio:'pci'},{w:'on',t:269.5,vio:'pci'},{w:'the',t:270,vio:'pci'},{w:'front.',t:270.5,vio:'pci'}
    ],
    tr:{
      ar:[{w:'أحتاج',t:252},{w:'التحقق',t:254},{w:'من',t:255},{w:'هويتك.',t:255.8},{w:'هل',t:258},{w:'يمكنك',t:258.8},{w:'تأكيد',t:259.5},{w:'رقم',t:261,vio:'pci'},{w:'البطاقة',t:262,vio:'pci'},{w:'على',t:263,vio:'pci'},{w:'الحساب؟',t:264,vio:'pci'},{w:'الـ',t:267},{w:'16',t:267.8,vio:'pci'},{w:'رقماً',t:268.5,vio:'pci'},{w:'على',t:269.5,vio:'pci'},{w:'الواجهة.',t:270.5,vio:'pci'}],
      fr:[{w:'Je',t:252},{w:'dois',t:252.8},{w:'vérifier',t:254},{w:'votre',t:255},{w:'identité.',t:255.8},{w:'Pouvez-vous',t:258},{w:'confirmer',t:259.5},{w:'le',t:260.5},{w:'numéro',t:261,vio:'pci'},{w:'de',t:261.8,vio:'pci'},{w:'carte',t:262,vio:'pci'},{w:'du',t:263.5,vio:'pci'},{w:'compte?',t:264,vio:'pci'},{w:'Les',t:267},{w:'16',t:267.8,vio:'pci'},{w:'chiffres',t:268.5,vio:'pci'},{w:'au',t:269.5,vio:'pci'},{w:'recto.',t:270.5,vio:'pci'}],
      es:[{w:'Necesito',t:252},{w:'verificar',t:254},{w:'su',t:255},{w:'identidad.',t:255.8},{w:'¿Puede',t:258},{w:'confirmar',t:259.5},{w:'el',t:260.5},{w:'número',t:261,vio:'pci'},{w:'de',t:261.8,vio:'pci'},{w:'tarjeta',t:262,vio:'pci'},{w:'del',t:263.5,vio:'pci'},{w:'cuenta?',t:264,vio:'pci'},{w:'Los',t:267},{w:'16',t:267.8,vio:'pci'},{w:'dígitos',t:268.5,vio:'pci'},{w:'al',t:269.5,vio:'pci'},{w:'frente.',t:270.5,vio:'pci'}],
      de:[{w:'Ich',t:252},{w:'muss',t:252.8},{w:'Ihre',t:255},{w:'Identität',t:254},{w:'prüfen.',t:255.8},{w:'Können',t:258},{w:'Sie',t:258.8},{w:'die',t:260.5},{w:'Kartennummer',t:261,vio:'pci'},{w:'des',t:263.5,vio:'pci'},{w:'Kontos',t:264,vio:'pci'},{w:'bestätigen?',t:259.5},{w:'Die',t:267},{w:'16',t:267.8,vio:'pci'},{w:'Ziffern',t:268.5,vio:'pci'},{w:'vorne.',t:270.5,vio:'pci'}],
      zh:[{w:'我需要',t:252},{w:'验证',t:254},{w:'您的',t:255},{w:'身份。',t:255.8},{w:'请',t:258},{w:'确认',t:259.5},{w:'账户上的',t:261,vio:'pci'},{w:'卡号，',t:262,vio:'pci'},{w:'正面的',t:267,vio:'pci'},{w:'16位',t:267.8,vio:'pci'},{w:'数字。',t:270.5,vio:'pci'}],
      tr:[{w:'Kimliğinizi',t:254},{w:'doğrulamam',t:252.8},{w:'gerekiyor.',t:255.8},{w:'Hesaptaki',t:264,vio:'pci'},{w:'kart',t:261,vio:'pci'},{w:'numarasını',t:262,vio:'pci'},{w:'doğrulayabilir',t:259.5},{w:'misiniz?',t:259.8},{w:'Ön',t:270,vio:'pci'},{w:'yüzdeki',t:269.5,vio:'pci'},{w:'16',t:267.8,vio:'pci'},{w:'rakamı.',t:268.5,vio:'pci'}],
      pt:[{w:'Preciso',t:252},{w:'verificar',t:254},{w:'a',t:255},{w:'sua',t:255.2},{w:'identidade.',t:255.8},{w:'Pode',t:258},{w:'confirmar',t:259.5},{w:'o',t:260.5},{w:'número',t:261,vio:'pci'},{w:'do',t:261.8,vio:'pci'},{w:'cartão',t:262,vio:'pci'},{w:'da',t:263.5,vio:'pci'},{w:'conta?',t:264,vio:'pci'},{w:'Os',t:267},{w:'16',t:267.8,vio:'pci'},{w:'dígitos',t:268.5,vio:'pci'},{w:'na',t:269.5,vio:'pci'},{w:'frente.',t:270.5,vio:'pci'}],
      hi:[{w:'मुझे',t:252},{w:'आपकी',t:255},{w:'पहचान',t:254},{w:'सत्यापित',t:254.5},{w:'करनी',t:255},{w:'है।',t:255.8},{w:'क्या',t:258},{w:'आप',t:258.8},{w:'खाते',t:264,vio:'pci'},{w:'का',t:261,vio:'pci'},{w:'कार्ड',t:261.2,vio:'pci'},{w:'नंबर',t:262,vio:'pci'},{w:'बता',t:259.5},{w:'सकते',t:259.8},{w:'हैं?',t:260.5},{w:'कार्ड',t:267},{w:'के',t:267.5,vio:'pci'},{w:'सामने',t:270,vio:'pci'},{w:'के',t:269.5,vio:'pci'},{w:'16',t:267.8,vio:'pci'},{w:'अंक।',t:270.5,vio:'pci'}],
    }
  },
  {
    id:4, s:310, e:390, spk:'customer', emo:'anger',
    flag:{type:'pci',msg:'CRITICAL — Card number 4532 1408 7162 3349 captured in recording. PCI-DSS breach confirmed. Mandatory incident report required.'},
    en:[
      {w:'Fine.',t:310},{w:'It\'s',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},
      {w:'Now',t:322},{w:'please',t:323},{w:'check',t:323.8},{w:'whether',t:324.5},{w:'I',t:325.5},{w:'cancelled.',t:326},
      {w:'I',t:340},{w:'am',t:340.8},{w:'going',t:341.5},{w:'to',t:342},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'if',t:346},{w:'this',t:346.8},{w:'isn\'t',t:347.5},{w:'resolved.',t:348.5}
    ],
    tr:{
      ar:[{w:'حسناً.',t:310},{w:'إنه',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'الآن',t:322},{w:'تحقق',t:323.8},{w:'إذا',t:324.5},{w:'ألغيت.',t:326},{w:'سأذهب',t:340},{w:'إلى',t:342},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'إن',t:346},{w:'لم',t:347.5},{w:'يُحل.',t:348.5}],
      fr:[{w:'Bien.',t:310},{w:'C\'est',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'Vérifiez',t:323.8},{w:'si',t:324.5},{w:'j\'ai',t:325.5},{w:'annulé.',t:326},{w:'Je',t:340},{w:'vais',t:341.5},{w:'chez',t:342},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'sinon.',t:348.5}],
      es:[{w:'Bien.',t:310},{w:'Es',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'Compruebe',t:323.8},{w:'si',t:324.5},{w:'cancelé.',t:326},{w:'Me',t:340},{w:'voy',t:341.5},{w:'a',t:342},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'si',t:346},{w:'no',t:347.5},{w:'se',t:348},{w:'resuelve.',t:348.5}],
      de:[{w:'Gut.',t:310},{w:'Es',t:312},{w:'ist',t:312.5},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'Prüfen',t:323.8},{w:'Sie',t:324},{w:'bitte.',t:326},{w:'Ich',t:340},{w:'gehe',t:341.5},{w:'zu',t:342},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'wenn',t:346},{w:'nicht',t:347.5},{w:'gelöst.',t:348.5}],
      zh:[{w:'好吧。',t:310},{w:'是',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349。',t:318.5,vio:'pci'},{w:'现在',t:322},{w:'请检查',t:323.8},{w:'是否',t:325.5},{w:'取消了。',t:326},{w:'不解决',t:347.5},{w:'就去',t:340},{w:'CompetitorX。',t:342.5,vio:'competitor'}],
      tr:[{w:'Tamam.',t:310},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'İptal',t:326},{w:'edip',t:325.5},{w:'etmediğimi',t:325.8},{w:'kontrol',t:323.8},{w:'edin.',t:324.5},{w:'Çözülmezse',t:348.5},{w:'CompetitorX\'e',t:342.5,vio:'competitor'},{w:'gidiyorum.',t:348.5}],
      pt:[{w:'Certo.',t:310},{w:'É',t:312},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'Verifique',t:323.8},{w:'se',t:324.5},{w:'cancelei.',t:326},{w:'Vou',t:340},{w:'para',t:342},{w:'o',t:342.2},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'se',t:346},{w:'não',t:347.5},{w:'resolver.',t:348.5}],
      hi:[{w:'ठीक',t:310},{w:'है।',t:310.8},{w:'4532',t:314,vio:'pci'},{w:'1408',t:315.5,vio:'pci'},{w:'7162',t:317,vio:'pci'},{w:'3349.',t:318.5,vio:'pci'},{w:'अब',t:322},{w:'देखें',t:323.8},{w:'कि',t:324.5},{w:'रद्द',t:326},{w:'किया',t:326.5},{w:'या',t:326.8},{w:'नहीं।',t:327},{w:'अगर',t:346},{w:'हल',t:347.5},{w:'नहीं',t:348},{w:'हुआ',t:348.2},{w:'तो',t:348.3},{w:'CompetitorX',t:342.5,vio:'competitor'},{w:'जाऊंगी।',t:348.5}],
    }
  },
  {
    id:5, s:390, e:462, spk:'agent', emo:'neutral', flag:null,
    en:[{w:'I',t:390},{w:'can',t:390.8},{w:'see',t:391.5},{w:'the',t:392},{w:'cancellation',t:392.5},{w:'—',t:394},{w:'a',t:394.5},{w:'system',t:395},{w:'error',t:396},{w:'occurred.',t:396.8},{w:'I\'m',t:405},{w:'escalating',t:406},{w:'this',t:407.5},{w:'to',t:408},{w:'billing.',t:408.5},{w:'They',t:418},{w:'will',t:419},{w:'contact',t:419.8},{w:'you',t:421},{w:'within',t:421.8},{w:'24',t:422.5},{w:'hours.',t:423}],
    tr:{
      ar:[{w:'أرى',t:391.5},{w:'طلب',t:392.5},{w:'الإلغاء،',t:393},{w:'حدث',t:395},{w:'خطأ',t:396},{w:'في',t:396.5},{w:'النظام.',t:396.8},{w:'سأصعِّد',t:406},{w:'للفوترة.',t:408.5},{w:'سيتواصلون',t:418},{w:'خلال',t:421.8},{w:'24',t:422.5},{w:'ساعة.',t:423}],
      fr:[{w:'Je',t:390},{w:'vois',t:391.5},{w:'la',t:392},{w:'demande',t:392.5},{w:'—',t:394},{w:'une',t:394.5},{w:'erreur',t:396},{w:'système',t:395},{w:'est',t:396.5},{w:'survenue.',t:396.8},{w:'Je',t:405},{w:'transmets',t:406},{w:'à',t:408},{w:'la',t:408.2},{w:'facturation.',t:408.5},{w:'Ils',t:418},{w:'vous',t:421},{w:'contacteront',t:419.8},{w:'dans',t:421.8},{w:'24',t:422.5},{w:'heures.',t:423}],
      es:[{w:'Veo',t:391.5},{w:'la',t:392},{w:'solicitud',t:392.5},{w:'—',t:394},{w:'ocurrió',t:396.8},{w:'un',t:394.5},{w:'error',t:396},{w:'del',t:395},{w:'sistema.',t:396.8},{w:'Voy',t:406},{w:'a',t:407.5},{w:'escalar',t:406},{w:'a',t:408},{w:'facturación.',t:408.5},{w:'Le',t:418},{w:'contactarán',t:419.8},{w:'en',t:421.8},{w:'24',t:422.5},{w:'horas.',t:423}],
      de:[{w:'Ich',t:390},{w:'sehe',t:391.5},{w:'die',t:392},{w:'Stornierung',t:392.5},{w:'—',t:394},{w:'ein',t:394.5},{w:'Systemfehler',t:396},{w:'ist',t:396.5},{w:'aufgetreten.',t:396.8},{w:'Ich',t:405},{w:'leite',t:406},{w:'weiter',t:407.5},{w:'an',t:408},{w:'Abrechnung.',t:408.5},{w:'Sie',t:418},{w:'melden',t:419.8},{w:'sich',t:421},{w:'in',t:421.8},{w:'24',t:422.5},{w:'Stunden.',t:423}],
      zh:[{w:'我看到',t:391.5},{w:'取消请求',t:392.5},{w:'——',t:394},{w:'发生了',t:396.8},{w:'系统',t:395},{w:'错误。',t:396.8},{w:'我会',t:405},{w:'升级到',t:406},{w:'账单部门。',t:408.5},{w:'他们会在',t:418},{w:'24小时内',t:422.5},{w:'联系您。',t:423}],
      tr:[{w:'İptal',t:392.5},{w:'talebini',t:393},{w:'görüyorum',t:391.5},{w:'—',t:394},{w:'sistem',t:395},{w:'hatası',t:396},{w:'oluştu.',t:396.8},{w:'Fatura',t:408.5},{w:'ekibine',t:408},{w:'iletiyorum.',t:406},{w:'24',t:422.5},{w:'saat',t:423},{w:'içinde',t:421.8},{w:'sizi',t:421},{w:'arayacaklar.',t:423}],
      pt:[{w:'Vejo',t:390},{w:'o',t:392},{w:'pedido',t:392.5},{w:'—',t:394},{w:'ocorreu',t:396.8},{w:'um',t:394.5},{w:'erro',t:396},{w:'de',t:395.5},{w:'sistema.',t:396.8},{w:'Vou',t:406},{w:'escalar',t:406},{w:'para',t:408},{w:'o',t:408.2},{w:'faturamento.',t:408.5},{w:'Entrarão',t:418},{w:'em',t:419.8},{w:'contato',t:420},{w:'em',t:421.8},{w:'24',t:422.5},{w:'horas.',t:423}],
      hi:[{w:'मैं',t:390},{w:'कैंसिलेशन',t:392.5},{w:'देख',t:391.5},{w:'सकता',t:391.8},{w:'हूं',t:392},{w:'—',t:394},{w:'सिस्टम',t:395},{w:'एरर',t:396},{w:'हुई।',t:396.8},{w:'मैं',t:405},{w:'इसे',t:407.5},{w:'बिलिंग',t:408.5},{w:'टीम',t:408.2},{w:'को',t:408},{w:'भेज',t:406},{w:'रहा',t:406.5},{w:'हूं।',t:407},{w:'वे',t:418},{w:'24',t:422.5},{w:'घंटों',t:423},{w:'में',t:421.8},{w:'संपर्क',t:419.8},{w:'करेंगे।',t:423}],
    }
  }
];

const TOTAL = 462;
const WORD_DUR = 1.8;
const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

export default function PlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curT, setCurT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpd] = useState(1);
  const [lang, setLang] = useState('ar');
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const segs = SAMPLE_SEGS;

  useEffect(() => {
    drawWave();
    return () => clearInterval(timerRef.current);
  }, []);

  function drawWave() {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = canvas.offsetWidth; canvas.width = w * 2; canvas.height = 112;
    const ctx = canvas.getContext('2d'), bars = 160, bw = (w * 2) / bars;
    for (let i = 0; i < bars; i++) {
      const seed = Math.sin(i*.41)*Math.sin(i*.18)*Math.sin(i*.08);
      const h = Math.max(6, Math.abs(seed) * 90 + 8);
      const t = (i/bars)*TOTAL;
      const seg = segs.find(s=>t>=s.s&&t<s.e);
      ctx.fillStyle = (seg ? EMO_COL[seg.emo] : '#9ca3af') + 'bb';
      ctx.fillRect(i*bw, (112-h)/2, bw-1, h);
    }
  }

  const togglePlay = () => {
    setPlaying(p => {
      if (!p) {
        timerRef.current = setInterval(() => {
          setCurT(t => {
            const next = t + 0.18 * speed;
            if (next >= TOTAL) { clearInterval(timerRef.current); setPlaying(false); return TOTAL; }
            return next;
          });
        }, 180);
        return true;
      } else { clearInterval(timerRef.current); return false; }
    });
  };

  const seekTo = useCallback(t => setCurT(Math.max(0, Math.min(TOTAL, t))), []);
  const waveClick = e => {
    const rect = canvasRef.current?.parentElement?.getBoundingClientRect();
    if (rect) seekTo(((e.clientX - rect.left) / rect.width) * TOTAL);
  };

  const activeSeg = segs.find(s => curT >= s.s && curT < s.e);

  const renderWord = (wObj, idx, prefix) => {
    const inSeg = activeSeg && wObj.t >= activeSeg.s && wObj.t < activeSeg.e;
    const isCur = inSeg && curT >= wObj.t && curT < wObj.t + WORD_DUR;
    const isDone = curT >= wObj.t + WORD_DUR;
    const vs = wObj.vio ? VIO_STYLE[wObj.vio] : null;
    let bg = 'transparent', color = isDone ? '#60a5fa' : '#e5e7eb';
    if (vs) { bg = vs.bg; color = vs.color; }
    if (isCur && vs) { bg = vs.activeBg; color = vs.activeColor; }
    else if (isCur && !vs) { bg = '#3b82f6'; color = '#fff'; }
    return (
      <span key={`${prefix}-${idx}`} onClick={()=>seekTo(wObj.t)} style={{ background:bg, color, borderRadius:'3px', padding:'0 1px', cursor:'pointer', transition:'background .06s,color .06s', fontWeight:wObj.vio?600:400 }}>
        {wObj.w}{' '}
      </span>
    );
  };

  const alertInfo = activeSeg?.flag ? ALERT_STYLE[activeSeg.flag.type] : null;

  return (
    <div style={{padding:'20px',maxWidth:'900px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
        <button onClick={()=>navigate('/calls')} className="btn-secondary" style={{fontSize:'11px',padding:'4px 10px'}}>← Back</button>
        <div>
          <h1 style={{fontSize:'16px',fontWeight:600,color:'#fff'}}>Call {id?.slice(0,8)||'Demo'} — Word-Sync Diarization Player</h1>
          <div style={{fontSize:'11px',color:'#6b7280',marginTop:'2px'}}>Live transcription + translation + sentiment + violation detection · {fmt(TOTAL)} duration</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:'6px'}}>
          <span style={{background:'#fef2f2',color:'#dc2626',borderRadius:'8px',fontSize:'10px',padding:'2px 8px',fontWeight:500}}>🔴 PCI violation</span>
          <span style={{background:'#fffbeb',color:'#d97706',borderRadius:'8px',fontSize:'10px',padding:'2px 8px',fontWeight:500}}>84% churn risk</span>
        </div>
      </div>

      <div style={{position:'relative',height:'56px',background:'#111827',borderRadius:'10px',overflow:'hidden',cursor:'pointer',marginBottom:'8px'}} onClick={waveClick}>
        <canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} />
        <div style={{position:'absolute',top:0,left:0,height:'100%',background:'#3b82f6',opacity:.14,pointerEvents:'none',width:`${(curT/TOTAL*100).toFixed(2)}%`}} />
        <div style={{position:'absolute',top:0,height:'100%',width:'2px',background:'#3b82f6',pointerEvents:'none',left:`${(curT/TOTAL*100).toFixed(2)}%`}} />
      </div>

      <div style={{height:'7px',display:'flex',gap:'1px',borderRadius:'4px',overflow:'hidden',marginBottom:'6px'}}>
        {segs.map(seg=>(
          <div key={seg.id} onClick={()=>seekTo(seg.s)} style={{flex:`0 0 ${((seg.e-seg.s)/TOTAL*100).toFixed(2)}%`,background:EMO_COL[seg.emo],cursor:'pointer',opacity:.85,borderRadius:'2px'}} title={seg.emo} />
        ))}
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:10}}>
        {[['Neutral','#9ca3af'],['Frustration','#f59e0b'],['Anger','#ef4444'],['Satisfaction','#10b981']].map(([l,c])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#9ca3af'}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</div>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px',flexWrap:'wrap'}}>
        <button onClick={togglePlay} style={{width:'36px',height:'36px',borderRadius:'50%',border:'1px solid #374151',background:'#1f2937',cursor:'pointer',color:'#fff',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{fontFamily:'monospace',fontSize:'11px',color:'#9ca3af',minWidth:'80px'}}>{fmt(curT)} / {fmt(TOTAL)}</span>
        <select value={speed} onChange={e=>{setSpd(parseFloat(e.target.value)); clearInterval(timerRef.current); setPlaying(false);}} className="input" style={{width:'auto',padding:'3px 7px',fontSize:'11px'}}>
          {[.5,1,1.5,2,4].map(v=><option key={v} value={v}>{v}×</option>)}
        </select>
        <div style={{display:'flex',alignItems:'center',gap:'6px',marginLeft:'auto'}}>
          <span style={{fontSize:'11px',color:'#6b7280'}}>🔊</span>
          <input type="range" min="0" max="100" defaultValue="80" style={{width:'65px',cursor:'pointer'}} />
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 10px',background:'#111827',borderRadius:'10px',marginBottom:'10px',flexWrap:'wrap'}}>
        <span style={{fontSize:'11px',color:'#9ca3af',marginRight:'2px',fontWeight:500}}>🌐 Translate (dual-language diarization):</span>
        {LANGS.map(([code,label])=>(
          <button key={code} onClick={()=>setLang(code)} style={{fontSize:'11px',padding:'3px 10px',borderRadius:'6px',border:`1px solid ${lang===code?'#3b82f6':'#374151'}`,background:lang===code?'rgba(59,130,246,.2)':'transparent',color:lang===code?'#60a5fa':'#9ca3af',cursor:'pointer',transition:'all .1s'}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'10px'}}>
        {[['#fee2e2','#b91c1c','PCI / card data'],['#fef9c3','#854d0e','Wrong policy'],['#fff7ed','#c2410c','Rude / aggressive'],['#dcfce7','#166534','Competitor mention'],['#dbeafe','#1d4ed8','Current word'],['transparent','#60a5fa','Already spoken']].map(([bg,color,label])=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'10px',color:'#9ca3af'}}>
            <div style={{width:'12px',height:'12px',borderRadius:'3px',background:bg,border:`1px solid ${color}`,flexShrink:0}} />
            {label}
          </div>
        ))}
      </div>

      {alertInfo && activeSeg?.flag && (
        <div style={{display:'flex',alignItems:'start',gap:'8px',padding:'8px 12px',borderRadius:'10px',marginBottom:'10px',background:alertInfo.bg,color:alertInfo.color,fontSize:'11px',lineHeight:'1.5'}}>
          <span style={{fontSize:'15px',flexShrink:0}}>{alertInfo.icon}</span>
          <span>{activeSeg.flag.msg}</span>
        </div>
      )}

      <div style={{maxHeight:'340px',overflowY:'auto',paddingRight:'4px'}}>
        {segs.map(seg => {
          const isA = seg.spk === 'agent';
          const isActive = activeSeg?.id === seg.id;
          const trWords = lang !== 'none' ? (seg.tr[lang] || []) : [];
          return (
            <div key={seg.id} onClick={()=>seekTo(seg.s)} style={{padding:'10px 8px',borderBottom:'1px solid #1f2937',borderRadius:'8px',cursor:'pointer',background:isActive?'rgba(59,130,246,.08)':'transparent',transition:'background .1s'}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'5px'}}>
                <div style={{width:'26px',height:'26px',borderRadius:'50%',background:isA?'rgba(59,130,246,.2)':'rgba(245,158,11,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:600,color:isA?'#60a5fa':'#fbbf24',flexShrink:0}}>
                  {isA?'AG':'CU'}
                </div>
                <span style={{fontSize:'10px',fontWeight:500,color:isA?'#60a5fa':'#fbbf24'}}>{isA?'Agent (Speaker 1)':'Customer (Speaker 2)'}</span>
                <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'6px',background:`${EMO_COL[seg.emo]}22`,color:EMO_COL[seg.emo]}}>{seg.emo}</span>
                <span style={{fontSize:'10px',color:'#6b7280',fontFamily:'monospace',marginLeft:'auto'}}>{fmt(seg.s)}</span>
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.9',marginBottom:trWords.length?'3px':'0'}}>
                {seg.en.map((wObj,wi) => renderWord(wObj,wi,`en-${seg.id}`))}
              </div>
              {trWords.length > 0 && (
                <div style={{fontSize:'12px',lineHeight:'1.9',fontStyle:'italic',paddingLeft:'12px',borderLeft:'2px solid #1d4ed8',marginTop:'2px'}}>
                  {trWords.map((wObj,wi) => renderWord(wObj,wi,`tr-${seg.id}`))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginTop:'12px'}}>
        {[['Agent score','52','#f87171'],['Violations','3','#f87171'],['Interruptions','6×','#e5e7eb'],['CSAT pred.','40%','#f87171']].map(([l,v,c])=>(
          <div key={l} style={{background:'#111827',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:'18px',fontWeight:600,color:c}}>{v}</div>
            <div style={{fontSize:'10px',color:'#6b7280',marginTop:'2px'}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
