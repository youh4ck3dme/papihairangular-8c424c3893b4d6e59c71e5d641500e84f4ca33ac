/**
 * Cenník – jediný zdroj cien (stránka /cennik, „od“ ceny na stránkach služieb).
 * Ceny sú orientačné; konečnú cenu upresní salón pri konzultácii.
 */
export type PriceCategory = 'Dámske' | 'Pánske' | 'Farbenie' | 'Ostatné';

export interface PriceItem {
  name: string;
  price: number;
  /** minúty */
  duration: number;
  category: PriceCategory;
  description?: string;
}

export interface PriceGroup { title: string; items: PriceItem[]; }
export interface PriceList { id: 'damske' | 'panske'; title: string; groups: PriceGroup[]; }

export const PRICE_LISTS: PriceList[] = [
  {
    id: 'damske',
    title: "Dámsky cenník",
    groups: [
      {
        title: "Strih & Styling",
        items: [
          { name: "Dámsky strih", price: 30, duration: 60, category: 'Dámske', description: "Kompletný servis zahrňujúci odbornú konzultáciu, umývanie vlasov, relaxačnú masáž hlavy, precízny strih na mieru a záverečný styling. (Služba zahŕňa: umytie, strihanie a styling)" },
          { name: "Fúkaná dlhé vlasy", price: 30, duration: 45, category: 'Dámske', description: "Profesionálna úprava dlhých vlasov (pod ramená) fúkaním cez guľatú kefu pre maximálny objem, lesk a dlhotrvajúci tvar. (Služba zahŕňa: umytie a styling)" },
          { name: "Fúkaná polodlhé vlasy", price: 20, duration: 45, category: 'Dámske', description: "Profesionálna úprava polodlhých vlasov (po ramená) fúkaním. Zaručuje zdravý lesk a objem. (Služba zahŕňa: umytie a styling)" },
          { name: "Finálny styling", price: 20, duration: 30, category: 'Dámske', description: "Dokonalá bodka za vaším účesom. Profesionálna úprava vlasov pomocou kulmy, žehličky alebo náročný styling pre výnimočné príležitosti. (Služba zahŕňa: profesionálny styling vlasov)" },
        ],
      },
      {
        title: "Farbenie",
        items: [
          { name: "Farbenie odrastov so strihom", price: 60, duration: 120, category: 'Farbenie', description: "Profesionálne dofarbenie odrastov s následným strihom a konečnou úpravou pre zjednotený a svieži vzhľad. (Služba zahŕňa: farbenie, umytie, strihanie a styling)" },
          { name: "Farbenie odrastov", price: 45, duration: 90, category: 'Farbenie', description: "Precízna aplikácia farby na odrastenú časť vlasov pre plynulý prechod a dokonalé krytie pri zachovaní zdravia vlasov. (Služba zahŕňa: farbenie, umytie a styling)" },
          { name: "Kompletné farbenie", price: 70, duration: 90, category: 'Farbenie', description: "Zmena alebo oživenie odtieňa v celej dĺžke vlasov pomocou šetrných a vysoko kvalitných farieb Gold Haircare pre žiarivý lesk. (Služba zahŕňa: farbenie, umytie a styling)" },
          { name: "Kompletné farbenie so strihom", price: 90, duration: 120, category: 'Farbenie', description: "Celková zmena farby vlasov doplnená o profesionálny strih, ktorý podčiarkne váš nový odtieň a osobný štýl. (Služba zahŕňa: farbenie, umytie, strihanie a styling)" },
        ],
      },
      {
        title: "Balayage & Melír",
        items: [
          { name: "Balayage komplet", price: 150, duration: 240, category: 'Farbenie', description: "Moderná technika farbenia vytvárajúca prirodzené prechody. Zahŕňa konzultáciu, zosvetlenie, tónovanie a hĺbkovú regeneráciu. (Služba zahŕňa: balayage, umytie a styling)" },
          { name: "Balayage dorábka", price: 120, duration: 180, category: 'Farbenie', description: "Obnova a oživenie vašej balayage techniky, zameraná na oživenie odrastov a prejasnenie končekov. (Služba zahŕňa: balayage, umytie a styling)" },
          { name: "Melír dorábka", price: 120, duration: 180, category: 'Farbenie', description: "Klasická technika zosvetľovania prameňov zameraná na odrastenú časť vlasov pre zachovanie prirodzeného blond efektu. (Služba zahŕňa: melír, umytie a styling)" },
          { name: "Melír komplet", price: 150, duration: 240, category: 'Farbenie', description: "Zosvetľovanie prameňov po celej dĺžke vlasov pre dosiahnutie multidimenzionálneho a žiarivého blond vzhľadu. (Služba zahŕňa: melír, umytie a styling)" },
        ],
      },
      {
        title: "Odfarbovanie & Regenerácia",
        items: [
          { name: "Gumovanie alebo čistenie farby", price: 100, duration: 150, category: 'Farbenie', description: "Neutralizácia nežiaducich odtieňov a dodanie vysokého lesku pomocou jemných tónovacích prelivov bez amoniaku. (Služba zahŕňa: gumovanie, umytie a styling)" },
          { name: "Sťahovanie farby", price: 160, duration: 240, category: 'Farbenie', description: "Odborné a šetrné odstránenie starého tmavého pigmentu z vlasov pre prípravu na nový, svetlejší odtieň. (Služba zahŕňa: odfarbovanie, farbenie, umytie a styling)" },
          { name: "Methamorphyc - rýchla kúra", price: 35, duration: 45, category: 'Ostatné', description: "Expresná regeneračná kúra, ktorá dodá vlasom okamžitú výživu, hebkosť a lesk v rekordne krátkom čase. (Služba zahŕňa: ošetrenie a styling)" },
          { name: "Methamorphyc - exkluzívna kúra", price: 50, duration: 60, category: 'Ostatné', description: "Luxusná hĺbková rekonštrukcia vlasového vlákna pomocou prémiových produktov pre maximálne zdravie a vitalitu vašich vlasov. (Služba zahŕňa: ošetrenie a styling)" },
          { name: "Brazílsky keratín", price: 130, duration: 180, category: 'Ostatné', description: "Profesionálne vyhladenie a hĺbková regenerácia vlasov s výsledkom dokonale rovných, lesklých a zdravých vlasov na 3-5 mesiacov. (Služba zahŕňa: hĺbkovú regeneráciu a vyhladenie vlasov)" },
        ],
      },
      {
        title: "Predlžovanie & Účesy",
        items: [
          { name: "Aplikácia Tape-in", price: 40, duration: 60, category: 'Ostatné', description: "Profesionálne predĺženie alebo zahustenie vlasov pomocou diskrétnej a šetrnej páskovej metódy s mimoriadne prirodzeným efektom. (Služba zahŕňa: profesionálnu aplikáciu vlasových pások)" },
          { name: "Prepojenie Tape-in", price: 120, duration: 150, category: 'Ostatné', description: "Odborná úprava a posunutie spojov pri Tape-in metóde po odrastení vlasov, zahŕňajúca čistenie a opätovnú aplikáciu. (Služba zahŕňa: odborné prepojenie vlasových pások)" },
          { name: "Zapletané vrkôčiky", price: 30, duration: 180, category: 'Ostatné', description: "Štýlové a precízne zapletanie vlasov rôznymi technikami (boxerské vrkoče, priberané vrkôčiky) pre moderný look. (Služba zahŕňa: precízne zapletanie vlasov; trvanie 45 - 180 min)" },
          { name: "Spoločenský účes", price: 40, duration: 60, category: 'Ostatné', description: "Elegantná a trvácna úprava vlasov pre svadby, plesy a iné výnimočné spoločenské príležitosti, vytvorená na mieru vašim šatám. (Služba zahŕňa: styling pre spoločenské príležitosti)" },
        ],
      },
    ],
  },
  {
    id: 'panske',
    title: "Pánsky cenník",
    groups: [
      {
        title: "Vlasy",
        items: [
          { name: "Strih Junior (do 15r.)", price: 15, duration: 45, category: 'Pánske', description: "Moderný a štýlový strih pre našich mladých zákazníkov do 15 rokov, prispôsobený ich vlasom a aktuálnym trendom. (Služba zahŕňa: umytie, strihanie, umytie a styling)" },
          { name: "Pánsky strih", price: 19, duration: 60, category: 'Pánske', description: "Kompletný pánsky strih zahŕňajúci konzultáciu, umývanie vlasov pred aj po strihaní a finálny styling s použitím prémiových produktov. (Služba zahŕňa: umytie, strihanie, umytie a styling)" },
        ],
      },
      {
        title: "Brada & Kombinácie",
        items: [
          { name: "Úprava brady", price: 12, duration: 30, category: 'Pánske', description: "Kompletný servis pre vašu bradu: tvarovanie, skracovanie strojčekom aj nožnicami, ošetrenie kontúr a aplikácia vyživujúceho oleja alebo balzamu. (Služba zahŕňa: úpravu brady, umytie a ošetrenie/styling)" },
          { name: "Kombinácia vlasy a brada", price: 27, duration: 60, category: 'Pánske', description: "Kompletný servis zahŕňajúci profesionálny strih vlasov a komplexnú úpravu brady pre dokonale upravený mužský vzhľad. (Služba zahŕňa: umytie, strihanie vlasov, úpravu brady, umytie a styling)" },
          { name: "Pánsky špeciál", price: 50, duration: 90, category: 'Pánske', description: "Prémiový balíček zahŕňajúci strih, kompletnú úpravu brady, naparovanie, relaxačnú masáž hlavy a ošetrenie pleti. (Komplexný balíček: umytie, strihanie, úprava brady, depilácia, ušné sviečky, umytie, masáž vlasovej pokožky, čierna maska, peeling a styling)" },
        ],
      },
      {
        title: "Farbenie",
        items: [
          { name: "Trvalá", price: 40, duration: 90, category: 'Farbenie', description: "Profesionálna trvalá ondulácia pre pánov. Získajte požadovaný objem, vlny alebo kučery s dlhotrvajúcim efektom a šetrným prístupom k vašim vlasom. (Služba zahŕňa: trvalú onduláciu vlasov)" },
          { name: "Zosvetlenie vlasov", price: 40, duration: 90, category: 'Farbenie', description: "Odborné zosvetlenie pánskych vlasov o niekoľko odtieňov. Ideálne pre dosiahnutie moderného looku pri zachovaní kvality vlasov. (Služba zahŕňa: zosvetlenie, tónovanie, umytie a styling)" },
          { name: "Farbenie brady", price: 10, duration: 30, category: 'Farbenie', description: "Korekcia farby brady pre zjednotenie odtieňa alebo prirodzené zakrytie šedín pomocou šetrných prípravkov. (Služba zahŕňa: farbenie brady, umytie a styling)" },
          { name: "Tónovanie sedín", price: 10, duration: 30, category: 'Farbenie', description: "Diskrétne a prirodzené prekrytie šedín u pánov (kamufláž), ktoré prirodzene odrastá bez viditeľných prechodov. (Služba zahŕňa: tónovanie, umytie a styling)" },
        ],
      },
      {
        title: "Doplnkové služby",
        items: [
          { name: "Depilácia nosa aj uši", price: 5, duration: 10, category: 'Ostatné', description: "Rýchle a takmer bezbolestné odstránenie nežiaducich chĺpkov v oblasti nosa a uší pomocou teplého vosku. (Služba zahŕňa: depiláciu nosa alebo uší)" },
          { name: "Ušné sviečky", price: 10, duration: 10, category: 'Ostatné', description: "Relaxačná a tradičná metóda čistenia uší, ktorá pomáha pri tlaku v ušiach a prináša celkové uvoľnenie hlavy. (Služba zahŕňa: aplikáciu ušných sviečok)" },
          { name: "Čierna zlupovacia maska", price: 12, duration: 20, category: 'Ostatné', description: "Hĺbkové čistenie pleti zamerané na odstránenie nečistôt a čiernych bodiek pre sviežu a zdravú pokožku." },
        ],
      },
    ],
  },
];

/** Najnižšia cena položiek, ktorých názov vyhovuje regexu – pre „od X €“ na stránkach služieb. */
export function priceFrom(match: RegExp): number | null {
  const prices = PRICE_LISTS.flatMap(l => l.groups.flatMap(g => g.items)).filter(i => match.test(i.name)).map(i => i.price);
  return prices.length ? Math.min(...prices) : null;
}
