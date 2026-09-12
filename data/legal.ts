import type { Locale } from '@/lib/i18n/config';

/**
 * Textes légaux.
 *
 * Ils décrivent uniquement le fonctionnement réel du site (données collectées,
 * usage, conservation). Aucune mention d'entité juridique, de numéro
 * d'autorisation, d'ordre professionnel ou de juridiction n'y figure : ces
 * éléments seront ajoutés par la pharmacie une fois communiqués.
 */
export type LegalSection = { heading: string; body: string[] };
export type LegalPage = { title: string; intro: string; sections: LegalSection[]; pending: string };

const PENDING = {
  fr: "Les mentions légales complètes (raison sociale, numéro d'enregistrement, autorité de tutelle, responsable de la publication) seront publiées dès leur communication par la pharmacie.",
  ar: 'ستُنشر البيانات القانونية الكاملة (الاسم التجاري ورقم التسجيل والجهة الوصية ومدير النشر) فور تزويدنا بها من طرف الصيدلية.',
  en: 'Full legal details (registered name, registration number, supervisory authority, publication manager) will be published once provided by the pharmacy.',
};

export const privacyPage: Record<Locale, LegalPage> = {
  fr: {
    title: 'Politique de confidentialité',
    intro:
      "Cette page décrit les données que ce site collecte, la raison pour laquelle elles sont collectées et la façon dont elles sont protégées.",
    pending: PENDING.fr,
    sections: [
      {
        heading: 'Données collectées',
        body: [
          "Demande de disponibilité : nom, téléphone et liste des produits que vous saisissez. Ces informations composent le message envoyé à la pharmacie ; elles ne sont pas transmises à des tiers.",
          "Ordonnance : le fichier que vous téléversez, votre nom et votre téléphone. Une ordonnance est une donnée de santé et fait l'objet d'une protection renforcée.",
          "Formulaire de contact : nom, téléphone éventuel et contenu du message.",
        ],
      },
      {
        heading: 'Ordonnances',
        body: [
          "Les ordonnances sont stockées dans un espace privé, hors de tout accès public. Aucune URL publique ne permet d'y accéder.",
          "Seuls les comptes appartenant à l'équipe de la pharmacie peuvent les consulter, via un lien temporaire signé.",
          "Elles ne sont ni indexées par les moteurs de recherche, ni partagées avec des tiers.",
        ],
      },
      {
        heading: 'WhatsApp',
        body: [
          "Lorsque vous envoyez votre demande par WhatsApp, le message quitte ce site et est traité par WhatsApp selon ses propres conditions. Le site n'enregistre pas le contenu de cet échange.",
        ],
      },
      {
        heading: 'Stockage local',
        body: [
          "Votre liste « Ma demande » est conservée dans votre navigateur (localStorage) afin de ne pas être perdue. Elle n'est jamais envoyée automatiquement et vous pouvez la vider à tout moment.",
        ],
      },
      {
        heading: 'Vos droits',
        body: [
          "Vous pouvez demander l'accès, la rectification ou la suppression des données vous concernant en contactant la pharmacie par téléphone.",
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    intro: 'توضّح هذه الصفحة البيانات التي يجمعها الموقع، وسبب جمعها، وكيفية حمايتها.',
    pending: PENDING.ar,
    sections: [
      {
        heading: 'البيانات المجموعة',
        body: [
          'طلب التوفّر: الاسم ورقم الهاتف وقائمة المنتجات التي تدخلها. تُكوّن هذه المعلومات الرسالة المُرسلة إلى الصيدلية، ولا تُنقل إلى أطراف أخرى.',
          'الوصفة الطبية: الملف الذي ترفعه واسمك ورقم هاتفك. الوصفة الطبية بيانات صحّية تحظى بحماية مشدّدة.',
          'نموذج الاتصال: الاسم ورقم الهاتف إن وُجد ومحتوى الرسالة.',
        ],
      },
      {
        heading: 'الوصفات الطبية',
        body: [
          'تُحفظ الوصفات في مساحة خاصة بعيداً عن أي وصول عمومي، ولا يوجد رابط عام يتيح الاطّلاع عليها.',
          'لا يمكن الاطّلاع عليها إلا لحسابات فريق الصيدلية، عبر رابط مؤقّت موقّع.',
          'لا تُفهرس في محرّكات البحث ولا تُشارك مع أي طرف ثالث.',
        ],
      },
      {
        heading: 'واتساب',
        body: [
          'عند إرسال طلبك عبر واتساب، تغادر الرسالة هذا الموقع ويعالجها واتساب وفق شروطه الخاصة. لا يسجّل الموقع محتوى تلك المحادثة.',
        ],
      },
      {
        heading: 'التخزين المحلي',
        body: [
          'تُحفظ قائمة «طلبي» داخل متصفّحك (localStorage) حتى لا تضيع. لا تُرسل تلقائياً، ويمكنك إفراغها في أي وقت.',
        ],
      },
      {
        heading: 'حقوقك',
        body: [
          'يمكنك طلب الاطّلاع على بياناتك أو تصحيحها أو حذفها بالتواصل مع الصيدلية هاتفياً.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    intro:
      'This page explains what data this website collects, why it is collected and how it is protected.',
    pending: PENDING.en,
    sections: [
      {
        heading: 'Data collected',
        body: [
          'Availability request: the name, phone number and product list you enter. This makes up the message sent to the pharmacy and is not shared with third parties.',
          'Prescription: the file you upload, your name and your phone number. A prescription is health data and receives stronger protection.',
          'Contact form: name, optional phone number and the message content.',
        ],
      },
      {
        heading: 'Prescriptions',
        body: [
          'Prescriptions are stored in a private area, outside any public access. No public URL can reach them.',
          'Only accounts belonging to the pharmacy team can view them, through a short-lived signed link.',
          'They are neither indexed by search engines nor shared with third parties.',
        ],
      },
      {
        heading: 'WhatsApp',
        body: [
          'When you send your request over WhatsApp, the message leaves this site and is handled by WhatsApp under its own terms. This site does not record that conversation.',
        ],
      },
      {
        heading: 'Local storage',
        body: [
          'Your "My request" list is kept in your browser (localStorage) so it is not lost. It is never sent automatically and you can clear it at any time.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request access to, correction of, or deletion of your data by contacting the pharmacy by phone.',
        ],
      },
    ],
  },
};

export const termsPage: Record<Locale, LegalPage> = {
  fr: {
    title: "Conditions d'utilisation",
    intro: "Ces conditions décrivent ce que ce site permet de faire, et ce qu'il ne permet pas.",
    pending: PENDING.fr,
    sections: [
      {
        heading: 'Nature du service',
        body: [
          "Ce site présente une sélection de produits et permet d'adresser une demande de disponibilité à la pharmacie. Il ne s'agit pas d'une vente en ligne : aucun paiement n'est effectué sur le site et aucune commande n'est ferme tant que la pharmacie ne l'a pas confirmée.",
        ],
      },
      {
        heading: 'Médicaments',
        body: [
          "Certains produits peuvent nécessiter une ordonnance ou la validation d'un pharmacien. Pour ces produits, le site ne propose pas d'ajout direct à une commande : il oriente vers un échange avec l'équipe.",
          "La délivrance reste soumise à l'appréciation du pharmacien et à la réglementation applicable.",
        ],
      },
      {
        heading: 'Informations produits',
        body: [
          "Les informations affichées se limitent à ce qui figure sur l'emballage ou à ce qui a été vérifié. Lorsqu'une donnée n'est pas confirmée, le site l'indique explicitement plutôt que de la supposer.",
          "Aucune posologie, indication ni contre-indication n'est publiée sur ce site.",
        ],
      },
      {
        heading: 'Disponibilité et prix',
        body: [
          "La disponibilité affichée est indicative et peut évoluer. Le prix applicable est celui confirmé par la pharmacie au moment de la demande.",
        ],
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    intro: 'توضّح هذه الشروط ما يتيحه هذا الموقع وما لا يتيحه.',
    pending: PENDING.ar,
    sections: [
      {
        heading: 'طبيعة الخدمة',
        body: [
          'يعرض هذا الموقع مجموعة مختارة من المنتجات ويتيح إرسال طلب استفسار عن التوفّر إلى الصيدلية. وهو ليس بيعاً إلكترونياً: لا يتم أي دفع عبر الموقع، ولا يُعدّ أي طلب نهائياً ما لم تؤكّده الصيدلية.',
        ],
      },
      {
        heading: 'الأدوية',
        body: [
          'قد تتطلّب بعض المنتجات وصفة طبية أو موافقة الصيدلي. ولهذه المنتجات لا يتيح الموقع الإضافة المباشرة إلى الطلب، بل يوجّه إلى التواصل مع الفريق.',
          'يبقى الصرف خاضعاً لتقدير الصيدلي وللأنظمة المعمول بها.',
        ],
      },
      {
        heading: 'معلومات المنتجات',
        body: [
          'تقتصر المعلومات المعروضة على ما هو مدوّن على العبوة أو ما تم التحقّق منه. وعندما لا تكون المعلومة مؤكّدة، يوضّح الموقع ذلك صراحةً بدل افتراضها.',
          'لا يُنشر في هذا الموقع أي جرعة أو دواعي استعمال أو موانع استعمال.',
        ],
      },
      {
        heading: 'التوفّر والأسعار',
        body: [
          'التوفّر المعروض إرشادي وقابل للتغيير. والسعر المعتمد هو الذي تؤكّده الصيدلية عند الطلب.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of use',
    intro: 'These terms describe what this website allows, and what it does not.',
    pending: PENDING.en,
    sections: [
      {
        heading: 'Nature of the service',
        body: [
          'This site presents a selection of products and lets you send an availability request to the pharmacy. It is not an online sale: no payment is made on the site, and no order is firm until the pharmacy confirms it.',
        ],
      },
      {
        heading: 'Medicines',
        body: [
          'Some products may require a prescription or pharmacist validation. For those products the site offers no direct add-to-order: it directs you to a conversation with the team.',
          'Dispensing remains subject to the pharmacist’s judgement and to applicable regulations.',
        ],
      },
      {
        heading: 'Product information',
        body: [
          'Displayed information is limited to what appears on the packaging or has been verified. Where a detail is unconfirmed, the site says so explicitly rather than assuming it.',
          'No dosage, indication or contraindication is published on this site.',
        ],
      },
      {
        heading: 'Availability and pricing',
        body: [
          'Displayed availability is indicative and may change. The applicable price is the one confirmed by the pharmacy at the time of the request.',
        ],
      },
    ],
  },
};
