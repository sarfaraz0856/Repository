// Per-segment choreography on the real Protean pages. L = line timings (seconds, relative to segment start).
// Personal details used are fictional; email & mobile are blurred after typing. The form is never submitted.
const s = (L, i, off = 0) => L[i].start + off;
const e = (L, i, off = 0) => L[i].end + off;

module.exports = {
  B: (L) => ({
    url: 'https://tinpan.proteantech.in/services/pan/pan-index.html',
    typeUrl: { a: s(L, 0, 0.3), z: s(L, 0, 2.1) },
    cursorFrom: s(L, 0, 2.4),
    steps: [{ at: s(L, 0, 2.4), v: ['STEP 1', 'Official Website'] }],
    scrolls: [{ a: s(L, 1, 0), z: s(L, 1, 0.9), sel: 'p:has-text("With effect from April 01, 2026")', frac: 0.3 }],
    hl: [
      { a: s(L, 1, 0.9), z: e(L, 1, 0.3), sel: 'p:has-text("With effect from April 01, 2026")' },
      { a: s(L, 2, 0.1), z: e(L, 2, 0.3), sel: 'text=Application for allotment of New PAN (Form No. 93' },
      { a: s(L, 3, 0.1), z: e(L, 3, 0.4), sel: 'p:has-text("This form should be used when the applicant has never applied")' },
    ],
    calls: [
      { a: s(L, 1, 1.2), z: e(L, 1, 0.3), sel: 'p:has-text("With effect from April 01, 2026")', pos: 'below', html: '1 April 2026 se naye PAN forms' },
      { a: s(L, 2, 0.4), z: e(L, 2, 0.3), sel: 'text=Application for allotment of New PAN (Form No. 93', pos: 'below', cls: 'g', html: 'Form No. 93 = Indian Citizen' },
      { a: s(L, 3, 0.4), z: e(L, 3, 0.4), sel: 'p:has-text("This form should be used when the applicant has never applied")', pos: 'below', html: 'Pehli baar PAN ke liye hi' },
    ],
    cursor: [
      { at: s(L, 1, 0.9), sel: 'p:has-text("With effect from April 01, 2026")', dx: 300 },
      { at: s(L, 2, 0), sel: 'text=Application for allotment of New PAN (Form No. 93', dx: 260 },
      { at: s(L, 3, 0), sel: 'p:has-text("This form should be used when the applicant has never applied")', dx: 330 },
    ],
  }),

  C: (L) => ({
    url: 'https://tinpan.proteantech.in/services/pan/documents-form_93-form_94.html',
    steps: [{ at: 0.2, v: ['STEP 2', 'Documents Required'] }],
    scrolls: [
      { a: s(L, 0, 0.4), z: s(L, 0, 1.4), sel: 'text=FORM 93 – FOR INDIVIDUAL', frac: 0.12 },
      { a: s(L, 5, 0), z: s(L, 5, 1.0), sel: 'tr:has-text("Matriculation certificate")', frac: 0.5 },
    ],
    hl: [
      { a: s(L, 1, 0.1), z: e(L, 1, 0.3), sel: 'tr:has-text("Proof of Identity")' },
      { a: s(L, 2, 0.1), z: e(L, 3, 0.3), sel: 'tr:has-text("AADHAAR Card issued")', color: '#0B7A3E' },
      { a: s(L, 3, 0.1), z: e(L, 3, 0.3), sel: 'tr:has-text("AADHAAR Card issued") >> td >> nth=4', pad: 3 },
      { a: s(L, 4, 0.1), z: e(L, 4, 0.3), sel: ['tr:has-text("Indian Passport;") >> nth=0', 'tr:has-text("Driving licence;")', 'tr:has-text("Elector")'], color: '#0B7A3E' },
      { a: s(L, 5, 1.0), z: e(L, 5, 0.4), sel: 'tr:has-text("Matriculation certificate")', color: '#0B7A3E' },
    ],
    calls: [
      { a: s(L, 2, 0.4), z: e(L, 2, 0.2), sel: 'tr:has-text("AADHAAR Card issued")', pos: 'below', ox: 300, cls: 'g', html: 'Aadhaar: Identity ✔  Address ✔' },
      { a: s(L, 3, 0.3), z: e(L, 3, 0.3), sel: 'tr:has-text("AADHAAR Card issued")', pos: 'below', ox: 300, html: 'Date of Birth proof: NO<small>Aadhaar DOB proof nahi hai</small>' },
      { a: s(L, 4, 0.4), z: e(L, 4, 0.3), sel: 'tr:has-text("Elector")', pos: 'below', ox: 300, cls: 'g', html: 'DOB proof: Passport / DL / Voter ID' },
      { a: s(L, 5, 1.2), z: e(L, 5, 0.4), sel: 'tr:has-text("Matriculation certificate")', pos: 'below', ox: 300, cls: 'g', html: '10th marksheet bhi chalti hai' },
    ],
    cursor: [
      { at: s(L, 1, 0), sel: 'tr:has-text("Proof of Identity") >> th >> nth=2' },
      { at: s(L, 2, 0), sel: 'tr:has-text("AADHAAR Card issued") >> td >> nth=2' },
      { at: s(L, 3, 0), sel: 'tr:has-text("AADHAAR Card issued") >> td >> nth=4' },
      { at: s(L, 4, 0), sel: 'tr:has-text("Driving licence;") >> td >> nth=4' },
      { at: s(L, 5, 1.0), sel: 'tr:has-text("Matriculation certificate") >> td >> nth=4' },
    ],
  }),

  D: (L) => ({
    url: 'https://tinpan.proteantech.in/services/pan/pan-introduction.html',
    steps: [{ at: 0.2, v: ['STEP 3', 'Processing Fee'] }],
    scrolls: [
      { a: s(L, 0, 0.2), z: s(L, 0, 1.2), sel: 'text=If Physical PAN Card is required', frac: 0.1 },
      { a: s(L, 2, 0), z: s(L, 2, 0.8), sel: 'tr:has(td:text-is("101")) >> nth=0', frac: 0.45 },
      { a: s(L, 3, 0), z: s(L, 3, 0.9), sel: 'text=If Physical PAN Card is not required', frac: 0.1 },
      { a: s(L, 5, 0), z: s(L, 5, 0.8), sel: 'text=eSign charges Rs. 5.90 >> nth=0', frac: 0.5 },
    ],
    hl: [
      { a: s(L, 1, 0.2), z: e(L, 1, 0.3), sel: 'tr:has(td:text-is("107")) >> nth=1' },
      { a: s(L, 2, 0.2), z: e(L, 2, 0.3), sel: 'tr:has(td:text-is("101")) >> nth=0' },
      { a: s(L, 3, 1.0), z: e(L, 3, 0.3), sel: 'tr:has(td:text-is("72")) >> nth=1' },
      { a: s(L, 4, 0.1), z: e(L, 4, 0.3), sel: 'tr:has(td:text-is("66")) >> nth=0' },
      { a: s(L, 5, 0.8), z: e(L, 5, 0.4), sel: 'text=eSign charges Rs. 5.90 >> nth=0' },
    ],
    calls: [
      { a: s(L, 1, 0.5), z: e(L, 1, 0.3), sel: 'tr:has(td:text-is("107")) >> nth=1', pos: 'below', ox: 250, cls: 'g', html: '₹107 – Physical mode<small>Physical PAN card (India)</small>' },
      { a: s(L, 2, 0.5), z: e(L, 2, 0.3), sel: 'tr:has(td:text-is("101")) >> nth=0', pos: 'below', ox: 250, cls: 'g', html: '₹101 – Paperless (e-KYC & e-Sign)' },
      { a: s(L, 3, 1.2), z: e(L, 3, 0.3), sel: 'tr:has(td:text-is("72")) >> nth=1', pos: 'below', ox: 250, cls: 'g', html: '₹72 – Sirf e-PAN (Physical mode)' },
      { a: s(L, 4, 0.3), z: e(L, 4, 0.3), sel: 'tr:has(td:text-is("66")) >> nth=0', pos: 'below', ox: 250, cls: 'g', html: '₹66 – Sirf e-PAN (Paperless)' },
      { a: s(L, 5, 1.0), z: e(L, 5, 0.4), sel: 'text=eSign charges Rs. 5.90 >> nth=0', pos: 'below', html: '+ ₹5.90 e-Sign charge' },
    ],
    cursor: [
      { at: s(L, 1, 0), sel: 'tr:has(td:text-is("107")) >> nth=1 >> td >> nth=3' },
      { at: s(L, 2, 0), sel: 'tr:has(td:text-is("101")) >> nth=0 >> td >> nth=3' },
      { at: s(L, 3, 1.0), sel: 'tr:has(td:text-is("72")) >> nth=1 >> td >> nth=3' },
      { at: s(L, 4, 0), sel: 'tr:has(td:text-is("66")) >> nth=0 >> td >> nth=3' },
      { at: s(L, 5, 0.8), sel: 'text=eSign charges Rs. 5.90 >> nth=0', dx: 160 },
    ],
  }),

  E: (L) => {
    const SUBMIT = 'button:has-text("Submit"), input[value="Submit"]';
    return {
      url: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html',
      steps: [
        { at: 0.2, v: ['STEP 4', 'Select Form No. 93'] },
        { at: s(L, 4, 0), v: ['STEP 5', 'Applicant Information'] },
        { at: s(L, 10, 0), v: ['STEP 6', 'Consent, Captcha & Submit'] },
      ],
      actions: [
        { at: s(L, 1, 1.6), click: '.select2-selection', wait: 450 },
        { at: e(L, 2, -0.1), click: '.select2-results__option:has-text("Form No. 93")', dx: 140, wait: 600 },
        { at: s(L, 10, 1.0), click: '#consent' },
      ],
      scrolls: [
        { a: s(L, 4, 0), z: s(L, 4, 0.8), sel: '#f_name_end', frac: 0.45 },
        { a: s(L, 5, 0), z: s(L, 5, 0.9), y: 0 },
        { a: s(L, 8, 0), z: s(L, 8, 0.8), sel: '#date_of_birth_reg', frac: 0.45 },
        { a: s(L, 10, 0), z: s(L, 10, 0.9), sel: '#consent', frac: 0.3 },
        { a: s(L, 13, 0), z: s(L, 13, 0.9), sel: 'text=Resume Application', frac: 0.35 },
      ],
      type: [
        { at: s(L, 4, 0.9), sel: '#f_name_end', text: 'AMIT', gap: 0.12 },
        { at: s(L, 4, 2.0), sel: '#m_name_end', text: 'KUMAR', gap: 0.11 },
        { at: s(L, 4, 3.2), sel: '#l_name_end', text: 'VERMA', gap: 0.11 },
        { at: s(L, 8, 0.9), sel: '#date_of_birth_reg', text: '12/04/1996', gap: 0.08, esc: true },
        { at: s(L, 8, 2.2), sel: '#email_id2', text: 'amit.verma1996@gmail.com', gap: 0.04, blur: true },
        { at: s(L, 8, 3.7), sel: '#rvContactNo', text: '9876543210', gap: 0.06, blur: true },
      ],
      hl: [
        { a: 0.4, z: s(L, 1, 0), sel: 'text=Online PAN application' },
        { a: s(L, 2, 0.1), z: e(L, 2, -0.1), sel: '.select2-results__option:has-text("Form No. 93")', pad: 2 },
        { a: s(L, 3, 0.1), z: e(L, 3, 0.3), sel: '.select2-selection' },
        { a: s(L, 5, 0.9), z: e(L, 7, 0.3), sel: 'p:has-text("If Name as per Aadhaar contains initials"), div:has-text("If Name as per Aadhaar contains initials") >> nth=-1' },
        { a: s(L, 9, 0.1), z: e(L, 9, 0.3), sel: ['#email_id2', '#rvContactNo'] },
        { a: s(L, 11, 0.1), z: s(L, 11, 1.6), sel: 'text=Validate reCAPTCHA' },
        { a: s(L, 11, 1.6), z: e(L, 12, 0.4), sel: SUBMIT },
        { a: s(L, 13, 0.9), z: e(L, 13, 0.4), sel: 'text=Resume Application' },
      ],
      calls: [
        { a: s(L, 3, 0.6), z: e(L, 3, 0.3), sel: '.select2-selection', pos: 'right', html: '"Applicant Category" hat gaya<small>Form 93 sirf Indian individual ke liye</small>' },
        { a: s(L, 6, 0), z: e(L, 6, 0.2), sel: 'text=Online PAN application', pos: 'below', ox: 420, html: 'Aadhaar mein initials? Poora naam likhein' },
        { a: s(L, 7, 0), z: e(L, 7, 0.3), sel: 'text=Online PAN application', pos: 'below', ox: 420, cls: 'g', html: 'Name as per Aadhaar → PAN card par chhapta hai' },
        { a: s(L, 9, 0.3), z: e(L, 9, 0.3), sel: '#rvContactNo', pos: 'below', ox: -60, cls: 'b', html: 'Apna hi Email & Mobile<small>Token number aur updates yahin aate hain</small>' },
        { a: s(L, 11, 0.3), z: s(L, 11, 1.6), sel: 'text=Validate reCAPTCHA', pos: 'right', html: 'Yahan Captcha bhariye' },
        { a: s(L, 12, 0.1), z: e(L, 12, 0.4), sel: SUBMIT, pos: 'right', cls: 'g', html: 'Submit → Token Number<small>Screen par + email par</small>' },
        { a: s(L, 13, 1.1), z: e(L, 13, 0.4), sel: 'text=Resume Application', pos: 'right', cls: 'b', html: 'Token number se form baad mein poora karein' },
      ],
      cursor: [
        { at: 0.3, sel: 'text=Online PAN application', dx: 260 },
        { at: s(L, 1, 0.2), sel: '.select2-selection' },
        { at: s(L, 2, 0.1), sel: '.select2-results__option:has-text("Form No. 93")', dx: 140 },
        { at: s(L, 3, 0.4), sel: '.select2-selection', dx: 360, dy: 40 },
        { at: s(L, 5, 0.9), sel: 'text=If Name as per Aadhaar contains initials', dx: 520 },
        { at: s(L, 9, 0.2), sel: '#rvContactNo', dx: 200 },
        { at: s(L, 10, 0.4), sel: '#consent' },
        { at: s(L, 11, 0.1), sel: 'text=Validate reCAPTCHA', dx: 60 },
        { at: s(L, 11, 1.6), sel: SUBMIT },
        { at: s(L, 13, 0.9), sel: 'text=Resume Application' },
      ],
      extraActions: [],
    };
  },

  G: (L) => ({
    url: 'https://tinpan.proteantech.in/services/pan/pan-aocode.html',
    steps: [{ at: 0.2, v: ['STEP 7', 'AO Code'] }],
    scrolls: [{ a: s(L, 0, 0.2), z: s(L, 0, 1.1), sel: 'text=Search Your AO Code', frac: 0.15 }],
    hl: [
      { a: s(L, 0, 1.0), z: e(L, 0, 0.3), sel: 'text=Search Your AO Code' },
      { a: s(L, 1, 0.1), z: e(L, 1, 0.5), sel: 'ul:has(a:has-text("PAN AO Codes- International Taxation Charge"))', color: '#0B7A3E' },
    ],
    calls: [{ a: s(L, 1, 0.4), z: e(L, 1, 0.5), sel: 'ul:has(a:has-text("PAN AO Codes- International Taxation Charge"))', pos: 'below', cls: 'g', html: 'Apne shehar ki list kholiye' }],
    cursor: [
      { at: s(L, 0, 1.0), sel: 'text=Search Your AO Code', dx: 200 },
      { at: s(L, 1, 0.3), sel: 'a:has-text("Other than International Taxation Charge (other than Mumbai")', dx: 120 },
    ],
  }),

  H: (L) => ({
    url: 'https://tin.tin.proteantech.in/pantan/StatusTrack.html',
    steps: [{ at: 0.2, v: ['STEP 9', 'Track Status'] }],
    actions: [
      { at: s(L, 1, 0.9), click: '[name=ST_SEARCH_TYPE]', fake: true, run: (p) => p.selectOption('[name=ST_SEARCH_TYPE]', { label: 'PAN - New / Change Request' }) },
      { at: s(L, 2, 0.2), click: '[name=ST_SEARCH_OPTION]' },
    ],
    type: [{ at: s(L, 2, 0.8), sel: '[name=ST_ACK_NUM]', text: '881030219876543', gap: 0.06, blur: true }],
    hl: [
      { a: s(L, 0, 0.4), z: e(L, 0, 0.3), sel: 'text=Track your PAN/TAN Application Status' },
      { a: s(L, 1, 0.3), z: e(L, 1, 0.4), sel: '[name=ST_SEARCH_TYPE]' },
      { a: s(L, 2, 2.0), z: e(L, 2, 0.6), sel: 'input[type=submit]' },
    ],
    calls: [
      { a: s(L, 0, 1.2), z: e(L, 0, 0.3), sel: 'text=Track your PAN/TAN Application Status', pos: 'below', cls: 'g', html: 'Apply ke 3 din baad<small>15 digit Acknowledgement Number se</small>' },
      { a: s(L, 2, 2.2), z: e(L, 2, 0.6), sel: 'input[type=submit]', pos: 'right', cls: 'g', html: 'Submit → Status' },
    ],
    cursor: [
      { at: s(L, 0, 0.4), sel: 'text=Track your PAN/TAN Application Status', dx: 200 },
      { at: s(L, 1, 0.2), sel: '[name=ST_SEARCH_TYPE]' },
      { at: s(L, 2, 0.0), sel: '[name=ST_SEARCH_OPTION]' },
      { at: s(L, 2, 2.0), sel: 'input[type=submit]' },
    ],
  }),
};
