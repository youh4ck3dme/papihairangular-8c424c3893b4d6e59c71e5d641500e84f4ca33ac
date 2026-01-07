import { Injectable } from "@angular/core";
import { BlogPost, ContentBlock } from "../models/blog-post.interface";
import { Comment } from "../models/comment.interface";
import { Observable, from } from "rxjs";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: "root",
})
export class BlogService {
  private posts: BlogPost[] = [
    {
      id: "1",
      slug: "trendove-ucesy-2026",
      title: "Trendové účesy 2026: Kompletný sprievodca strihmi v Košiciach",
      subtitle: "Hľadáte zmenu? Objavte trendové účesy 2026, ktoré ovládnu ulice. Od Butterfly Cut po Liquid Bob – poradíme vám, čo sa nosí a ako to upraviť doma.",
      perex: "Aké sú trendové účesy 2026? Tento rok prináša revolúciu v prirodzenosti a 'tichom luxuse' (Quiet Luxury). V PAPI HAIR DESIGN Košice sme pre vás analyzovali svetové móla od Milána po New York. Zistite, či je pre vás vhodný Butterfly Cut, Italian Bob alebo návrat ofiny. Prinášame vám nielen inšpiráciu, ale aj praktické rady, ako tieto účesy nosiť každý deň.",
      content: [
        {
          type: 'paragraph',
          text: 'Svet kaderníctva sa neustále dynamicky mení a <strong>trendové účesy 2026</strong> nie sú výnimkou. Po rokoch divokého experimentovania a "shaggy" strihov prichádza éra, ktorú svetoví stylisti nazývajú "Quiet Luxury" (tichý luxus). Čo to znamená pre vaše vlasy? Dôraz sa kladie na <strong>absolútne zdravie, zrkadlový lesk a prirodzenú textúru</strong>. Už žiadne prehnané, prelakované stylingy, ktoré vyžadujú hodinu pred zrkadlom každé ráno. Rok 2026 je o inteligentných strihoch, ktoré "sedia" samé a vyzerajú drahocenne bez viditeľnej námahy.'
        },
        {
          type: 'paragraph',
          text: 'V našom salóne <strong>PAPI HAIR DESIGN v Košiciach</strong> už teraz vidíme, že klientky čoraz častejšie žiadajú účesy, ktoré sú praktické, multifunkčné, no zároveň extrémne ženské. Ak plánujete zmenu imidžu alebo len chcete oživiť svoj aktuálny look, ste na správnom mieste. Pripravili sme pre vás detailný, viac ako 800-slovný prehľad toho najlepšieho, čo rok 2026 ponúka, vrátane tipov na styling a starostlivosť.'
        },
        {
          type: 'heading',
          text: '1. Butterfly Cut: Objem pre trendové účesy 2026'
        },
        {
          type: 'paragraph',
          text: 'Ak máte dlhé vlasy a hľadáte spôsob, ako im vrátiť život, pohyb a objem bez drastickej straty dĺžky, <strong>Butterfly Cut</strong> (motýlí strih) je absolútnou jednotkou medzi trendovými účesmi 2026. Tento strih je silne inšpirovaný ikonami 70. a 90. rokov, ako bola legendárna Farrah Fawcett či supermodelky ako Cindy Crawford.'
        },
        {
          type: 'paragraph',
          text: 'Podstatou tohto strihu sú výrazné, strategicky umiestnené vrstvy, ktoré rámujú tvár a smerujú von, pripomínajúc roztiahnuté krídla motýľa. Kratšie vrstvy okolo tváre (tzv. face-framing layers) začínajú už pri lícnych kostiach, čím dodávajú objem a zvýrazňujú črty tváre, zatiaľ čo dĺžka vzadu zostáva zachovaná a plná.'
        },
        {
          type: 'heading-level-3',
          text: 'Pre koho je Butterfly Cut vhodný?'
        },
        {
          type: 'paragraph',
          text: 'Je to ideálna voľba pre ženy s hustými, ťažkými vlasmi, ktoré potrebujú odľahčiť. Na jemných vlasoch vytvorí optický klam objemu, ak sa správne vyfúka. Navyše, je to strih "dva v jednom" – ak si vlasy zopnete do štipca alebo copu, predné kratšie pramene vytvoria ilúziu, že máte krátky, štýlový bob.'
        },
        {
          type: 'heading',
          text: '2. Italian Bob: Sladká dominancia v roku 2026'
        },
        {
          type: 'paragraph',
          text: 'Kým minulým sezónam kraľoval krátky a strapatý francúzsky bob, rok 2026 patrí jeho sofistikovanejšej sestre. <strong>Italian Bob</strong> (taliansky bob) prináša do trendových účesov 2026 lesk, objem a neuveriteľnú zmyselnosť. Tento strih zvyčajne končí tesne pod bradou alebo sa jemne dotýka pliec.'
        },
        {
          type: 'paragraph',
          text: 'Jeho kúzlo spočíva v jemnom prestrihaní koncov (texturizing), ktoré však nestrácajú na svojej vizuálnej hustote. Taliansky bob je ťažší, plnší a pôsobí neuveriteľne luxusne, akoby ste práve vyšli z drahého butiku v Miláne. Je menej o "messy" vzhľade a viac o vyleštenej elegancii.'
        },
        {
          type: 'heading-level-3',
          text: 'Styling Talianskeho Bobu'
        },
        {
          type: 'paragraph',
          text: 'Tento strih je prekvapivo variabilný. Môžete ho nosiť uhladený za uši pre "wet look" efekt, vyfúkaný cez veľkú okrúhlu kefu pre objem "ala 90. roky", alebo ho necháte voľne uschnúť pre prirodzenú vlnu. Je to strih pre sebavedomé ženy, ktoré vedia, čo chcú a neboja sa ukázať krk a ramená.'
        },
        {
          type: 'heading',
          text: '3. Scandi Hairline: Svetlo, ktoré omladí'
        },
        {
          type: 'paragraph',
          text: 'Hoci technicky nejde o strih, <strong>Scandi Hairline</strong> (škandinávska vlasová línia) je neoddeliteľnou súčasťou trendov, ktoré definujú rok 2026. Táto technika farbenia sa zameriava na jemné "baby vlásky" priamo pri línii čela a okolo celej tváre.'
        },
        {
          type: 'paragraph',
          text: 'Ich zosvetlením o 1 až 2 odtiene oproti zvyšku vlasov dosiahneme efekt, akoby vašu tvár neustále osvetľovalo jemné, polnočné škandinávske slnko. Tento mikro-trend má obrovský vizuálny vplyv – tvár pôsobí jasnejšie, oddýchnutejšie a okamžite mladšie. Scandi Hairline sa perfektne kombinuje s technikami ako Balayage, AirTouch alebo babylights. V PAPI HAIR DESIGN túto techniku milujeme pre jej schopnosť rozžiariť pleť. Ak vás zaujíma rozdiel medzi Balayage a Ombre, prečítajte si náš <a href="/blog/balayage-vs-ombre-rozdiel" class="text-gold font-semibold hover:underline">kompletný sprievodca týmito technikami</a>.'
        },
        {
          type: 'heading',
          text: '4. Liquid Hair: Maximálny lesk je podmienkou'
        },
        {
          type: 'paragraph',
          text: 'Pojem <strong>Liquid Hair</strong> (tekuté vlasy) definuje kvalitu vlasov v roku 2026. Predstavte si hladinu pokojného jazera, ktorá odráža svetlo. Presne tak majú vyzerať vaše vlasy. Nejde len o strih, ale o finálnu úpravu a hĺbkovú starostlivosť. Vlasy musia byť také hydratované, hladké a lesklé, že pri pohybe pripomínajú tečúcu vodu.'
        },
        {
          type: 'paragraph',
          text: 'Dosiahnuť tento efekt doma len so šampónom je náročné. Kľúčom sú profesionálne salónne kúry ako brazílsky keratín, Nová Kúra na vlasy alebo laminácia vlasov. Trendové účesy 2026 si vyžadujú zdravý základ. Ak sú vlasy poškodené a matné, ani ten najlepší strih nevynikne.'
        },
        {
          type: 'heading',
          text: 'Najčastejšie otázky o trendoch 2026 (FAQ)'
        },
        {
          type: 'heading-level-3',
          text: 'Musím radikálne meniť dĺžku?'
        },
        {
          type: 'paragraph',
          text: 'Vôbec nie! Rok 2026 praje všetkým dĺžkam. Ak milujete svoje dlhé vlasy, zvoľte Butterfly Cut alebo pridajte ofinu (Curtain Bangs). Ak chcete zmenu, skúste Lob (lhý bob). Dôležitá je kondícia vlasov, nie ich dĺžka.'
        },
        {
          type: 'heading-level-3',
          text: 'Aká farba bude najviac IN?'
        },
        {
          type: 'paragraph',
          text: 'Vstupujeme do éry "drahých" farieb. Hľadajte odtiene ako "Expensive Brunette" (bohatá hnedá plná odleskov), "Cowboy Copper" (tlmená medená) alebo "Buttercream Blonde" (krémová, teplá blond). Studené, sivé blond odtiene sú na ústupe, preferuje sa teplo a prirodzenosť.'
        },
        {
          type: 'heading',
          text: 'Ako si udržať trendové účesy 2026 doma?'
        },
        {
          type: 'paragraph',
          text: 'Investícia do nového strihu u kaderníka je len začiatok. Aby váš účes vyzeral ako zo salónu 365 dní v roku, musíte mu venovať pozornosť aj v domácej kúpeľni. Základom je správna "hair routine".'
        },
        {
          type: 'heading-level-4',
          text: 'Náš 3-krokový systém:'
        },
        {
          type: 'list',
          items: [
            '<strong>Hodváb na spanie:</strong> Vymeňte bavlnené obliečky za hodvábne alebo saténové. Bavlna absorbuje vlhkosť a spôsobuje trenie, čo vedie k "rannému hniezdu". Satén vlasy chráni.',
            '<strong>Termoochrana:</strong> Nikdy nepoužívajte fén, kulmu ani žehličku bez ochranného spreja. Je to ako ísť na slnko bez SPF.',
            '<strong>Olejovanie:</strong> Každý večer aplikujte kvapku oleja na končeky vlasov. Poďakujú sa vám.'
          ]
        },
        {
          type: 'paragraph',
          text: 'Na základe našich skúseností odporúčame siahnuť po produktoch, ktoré podporujú prirodzenú textúru. Texturizačné spreje s morskou soľou sú out (vysušujú), nahrádzajú ich hydratačné cukrové spreje. Značka <strong>GOLD Haircare</strong> má v portfóliu "Smoothing Cream", ktorý je pre efekt Liquid Hair ako stvorený.'
        },
        {
          type: 'tip-box',
          data: 'Tip experta: Pre udržanie objemu Butterfly strihu používajte suchý šampón už do čerstvo umytých (a vysušených) vlasov – dodá im textúru a objem, ktorý vydrží celý deň, nielen keď sú mastné.'
        },
        {
          type: 'paragraph',
          text: 'Chcete zmenu, ktorá bude nielen trendová, ale aj prispôsobená vašej tvári, typu vlasov a životnému štýlu? <a href="/kontakt" class="text-gold font-semibold hover:underline">Rezervujte si termín v PAPI HAIR DESIGN</a> ešte dnes. Naši stylisti sú pravidelne školení v najnovších technikách strihu aj farbenia pre <strong>trendové účesy 2026</strong> a radi vám poradia.'
        }
      ],
      imageUrl: "assets/images/blog/trendove-ucesy-2026.png",
      author: "Róbert Papcun",
      authorRole: "Head Stylist",
      date: "2026-01-05",
      readingTime: 6,
      tags: ["trendové účesy 2026", "butterfly cut", "italian bob", "kaderníctvo košice", "strihy", "scandi hairline", "liquid hair"],
      faqs: [
        {
          question: "Musím pri trendových účesoch 2026 radikálne meniť dĺžku?",
          answer: "Vôbec nie! Rok 2026 praje všetkým dĺžkam. Ak milujete svoje dlhé vlasy, zvoľte Butterfly Cut alebo pridajte ofinu (Curtain Bangs)."
        },
        {
          question: "Aká farba vlasov bude v roku 2026 najviac IN?",
          answer: "Vstupujeme do éry 'drahých' farieb. Hľadajte odtiene ako 'Expensive Brunette', 'Cowboy Copper' alebo 'Buttercream Blonde'. Studené odtiene sú na ústupe."
        },
        {
          question: "Ako si udržať trendový účes doma?",
          answer: "Základom je správna rutina: spanie na hodvábnej obliečke, používanie termoochrany pri fénovaní a pravidelné olejovanie končekov."
        }
      ]
    },
    {
      id: "2",
      slug: "starostlivost-o-vlasy-v-zime",
      title: "Zimná starostlivosť o vlasy: 7 tipov pre zdravie a lesk",
      subtitle: "Mráz, vietor a ústredné kúrenie ničia vaše vlasy. Naučte sa, ako vyzerá správna zimná starostlivosť o vlasy, aby zostali hydratované, lesklé a bez statickej elektriny.",
      perex: "Trápi vás elektrizovanie, suché končeky a vlasy bez života? Zimná starostlivosť o vlasy si vyžaduje špeciálny prístup a zmenu produktov. Prečítajte si 7 overených tipov od profesionálov a domáci recept na masku.",
      content: [
        {
          type: 'paragraph',
          text: 'Zima je pre našu korunu krásy tým suverénne najnáročnejším obdobím v roku. Extrémne striedanie teplôt – treskúci mráz vonku prechádzajúci do suchého, často prekúreného vzduchu v interiéri – spôsobuje, že vlasové vlákno zažíva šok. <strong>Zimná starostlivosť o vlasy</strong> preto nie je len o drahšej kozmetike, je to absolútna nutnosť pre zachovanie ich zdravia. V tomto rozsiahlom sprievodcovi sa pozrieme na to, prečo vlasy v zime trpia, aké sú najčastejšie mýty a ako im reálne pomôcť.'
        },
        {
          type: 'paragraph',
          text: 'Mnoho našich klientiek v <strong>PAPI HAIR DESIGN v Košiciach</strong> prichádza v januári a februári so sťažnosťami na stratu lesku, zvýšenú lámavosť a nezvládnuteľnú statickú elektrinu. Dobrou správou je, že s pár cieľavedomými zmenami vo vašej rutine môžete týmto problémom predísť. Tu je našich 7 zlatých pravidiel pre zimné prežitie.'
        },
        {
          type: 'heading',
          text: '1. Hydratácia: Absolútny kľúč zimnej starostlivosti'
        },
        {
          type: 'paragraph',
          text: 'Kým v lete chránime vlasy pred UV žiarením, v zime musíme bojovať so suchom. Studený vzduch má prirodzene nízku vlhkosť a ústredné kúrenie v bytoch a kanceláriách situáciu ešte zhoršuje. Tento suchý vzduch doslova "vysáva" vodu z vašich vlasov aj pokožky. Bežný šampón preto na zimu nestačí.'
        },
        {
          type: 'paragraph',
          text: 'Základom efektívnej <strong>zimnej starostlivosti o vlasy</strong> je prechod na hydratačný rad produktov. Hľadajte šampóny a kondicionéry s obsahom humektantov ako glycerín, aloe vera, med, panthenol alebo kyselina hyalurónová. Tieto zložky fungujú ako magnet na vodu – viažu ju vo vnútri vlasu a zabraňujú jej odparovaniu.'
        },
        {
          type: 'heading',
          text: '2. Stop elektrizovaniu s vlasovým olejom'
        },
        {
          type: 'paragraph',
          text: 'Poznáte to: dáte si dole čiapku a vlasy vám stoja dupkom ako po zásahu prúdom. Statická elektrina vzniká trením (o čiapku, šál, kabát) v extrémne suchom prostredí. Je to jasný signál, že vašim vlasom chýba vlhkosť (vodivosť). Suchý vlas je izolant, preto sa nabíja.'
        },
        {
          type: 'paragraph',
          text: 'Rýchlou a účinnou pomocou je kvalitný <strong>vlasový olej alebo sérum</strong>. Noste malé cestovné balenie v kabelke. V krízovej situácii stačí jedna kvapka rozotretá v dlaniach a jemné uhladenie po dĺžkach vlasov. Olej nielenže okamžite zruší elektrický náboj, ale aj uhladí rozlietanú kutikulu a dodá lesk. Pre zimnú starostlivosť o vlasy je olej nenahraditeľný pomocník.'
        },
        {
          type: 'heading',
          text: '3. Termoochrana je v zime povinná'
        },
        {
          type: 'paragraph',
          text: 'V teplých mesiacoch si môžeme dovoliť luxus nechať vlasy uschnúť voľne na vzduchu (air-drying). V zime je sušenie fénom nutnosťou (viac o nebezpečenstve mokrých vlasov v bode 4). Častejšie fénovanie však znamená väčšiu tepelnú záťaž pre už aj tak namáhané vlasy.'
        },
        {
          type: 'paragraph',
          text: 'Preto nikdy, a to podčiarkujeme <u>nikdy</u>, nepoužívajte fén bez termoochranného spreja (heat protectant). Tento produkt vytvorí na vlase neviditeľný štít, ktorý rovnomerne rozloží teplo a zabráni "vyvareniu" vnútornej vlhkosti z vlasu. Je to malý krok pre vás, ale obrovský skok pre dlhodobé zdravie vašich vlasov.'
        },
        {
          type: 'heading',
          text: '4. Fatálna chyba: Mokré vlasy a mráz'
        },
        {
          type: 'paragraph',
          text: 'Toto je pravdepodobne najhorší prehrešok voči <strong>zimnej starostlivosti o vlasy</strong>, ktorého sa dopúšťame. Voda má, ako vieme z hodín fyziky, najväčší objem práve vtedy, keď zamrzne (anomália vody). Ak idete von s čo i len mierne vlhkými vlasmi, voda zachytená vo vnútri vlasového vlákna zamrzne, zväčší svoj objem a vlas zvnútra doslova roztrhne.'
        },
        {
          type: 'paragraph',
          text: 'Výsledkom nie je len hrozba prechladnutia, ale nenávratne poškodené, rozštiepené vlasy, ktorým pomôžu už len nožnice. Žiadny "zázračný produkt" nezlepí roztrhnuté vlákno. Vždy sa uistite, že sú vaše vlasy 100% suché, kým opustíte teplo domova.'
        },
        {
          type: 'heading',
          text: '5. Mýtvs vs. Fakty: Čiapka a vypadávanie vlasov'
        },
        {
          type: 'paragraph',
          text: 'Často počúvame mýtus: "Nenosím čiapku, lebo mi z nej padajú vlasy alebo sa mastia." Pravda je však inde. Čiapka mechanicky nespôsobuje vypadávanie vlasov (pokiaľ nie je extrémne tesná). Naopak, chlad sťahuje cievy v pokožke hlavy, čím sa obmedzuje prísun živín do vlasových cibuliek. Mráz vlasom škodí viac než čiapka.'
        },
        {
          type: 'paragraph',
          text: 'Aby ste predišli rýchlemu masteniu a "zľahnutému" účesu, investujte do čiapky, ktorá má vnútro podšité saténom alebo hodvábom. Tieto materiály sú hladké, nespôsobujú trenie a neabsorbujú prirodzené oleje z vlasov tak ako vlna či bavlna.'
        },
        {
          type: 'heading',
          text: '6. Výživa zvnútra: Čo jesť v zime?'
        },
        {
          type: 'paragraph',
          text: 'Krásne vlasy rastú zvnútra. V zime máme menej čerstvej zeleniny a ovocia, preto je nutné dopĺňať vitamíny. Zamerajte sa na:'
        },
        {
          type: 'list',
          items: [
            '<strong>Omega-3 mastné kyseliny:</strong> (ryby, orechy, ľanové semienka) pre hydratáciu pokožky.',
            '<strong>Vitamín D:</strong> V zime nám chýba slnko, a "Déčko" je kľúčové pre rast vlasových folikulov.',
            '<strong>Zinok a Biotín:</strong> Pre pevnosť nechtov a vlasov.'
          ]
        },
        {
          type: 'heading',
          text: '7. Hĺbková regenerácia a domáce zábaly'
        },
        {
          type: 'paragraph',
          text: 'Minimálne raz týždenne si vyhraďte čas na "hair spa". Naneste masku, zabaľte vlasy do kúpacej čiapky a následne do nahriateho uteráka. Teplo otvorí kutikulu a umožní výživným látkam preniknúť hlbšie do štruktúry vlasu.'
        },
        {
          type: 'heading-level-3',
          text: 'Domáci recept na SOS zimný zábal'
        },
        {
          type: 'paragraph',
          text: 'Nemáte po ruke profesionálnu masku? Skúste tento overený babský recept, ktorý naozaj funguje a dodá vlasom okamžitú vzpruhu.'
        },
        {
          type: 'heading-level-4',
          text: 'Ingrediencie:'
        },
        {
          type: 'list',
          items: [
            '2 lyžice extra panenského kokosového alebo olivového oleja (hĺbková hydratácia)',
            '1 lyžica medu (zadržiava vlhkosť - humektant)',
            'Pár kvapiek citróna (kyslé pH uzatvára kutikulu pre lesk)'
          ]
        },
        {
          type: 'paragraph',
          text: 'Všetko zmiešajte (ak je olej tuhý, mierne ho zahrejte). Naneste zmes na dĺžky a končeky (vyhnite sa pokožke hlavy, ak sa vám rýchlo mastí). Nechajte pôsobiť aspoň 30 minút, ideálne hodinu pod uterákom. Potom dôkladne dvakrát umyte šampónom a použite kondicionér. Po regenerácii si doprajte <a href="/blog/trendove-ucesy-2026" class="text-gold font-semibold hover:underline">nový trendový strih pre rok 2026</a>.'
        },
        {
          type: 'paragraph',
          text: 'Ak vaše vlasy po zime potrebujú aj zmenu farby, <a href="/blog/balayage-vs-ombre-rozdiel" class="text-gold font-semibold hover:underline">prečítajte si o rozdieloch medzi Balayage a Ombre</a> – obe techniky sú šetrné a dodajú vlasom rozmer.'
        },
        {
          type: 'tip-box',
          data: 'Nezabúdajte na pitný režim! V zime vplyvom chladu necítime smäd tak intenzívne ako v lete. Nedostatok vody v tele sa však okamžite prejaví na suchej pokožke a matných vlasoch. Pite aspoň 2 litre vody denne.'
        },
        {
          type: 'paragraph',
          text: 'Dáva vašim vlasom zima zabrať viac, než zvládnete doma? Cítite, že sú ako slama? <a href="https://services.bookio.com/papi-hair-design/widget?lang=sk" target="_blank" class="text-gold font-semibold hover:underline">Rezervujte si termín na profesionálnu kúru v PAPI HAIR DESIGN</a>. Naše hĺbkové regeneračné procedúry (Olaplex, Keratín) vrátia vašim vlasom život a silu za pár minút.'
        }
      ],
      imageUrl: "assets/images/blog/zimna-starostlivost.png",
      author: "Michaela Kováčová",
      authorRole: "Senior Stylist",
      date: "2026-01-02",
      readingTime: 8,
      tags: ["zimná starostlivosť o vlasy", "hydratácia vlasov", "poškodené vlasy", "tipy na vlasy", "vlasový olej"],
      faqs: [
        {
          question: "Prečo mi v zime elektrizujú vlasy?",
          answer: "Statická elektrina vzniká trením v suchom prostredí. Vlasom chýba vlhkosť, preto sa nabíjajú. Pomôže vlasový olej alebo sérum."
        },
        {
          question: "Môžem ísť v zime von s mokrými vlasmi?",
          answer: "Nikdy. Voda vo vlase zamrzne a roztrhne ho zvnútra, čo vedie k trvalému poškodeniu. Vždy vlasy úplne vysušte."
        },
        {
          question: "Spôsobuje nosenie čiapky vypadávanie vlasov?",
          answer: "Nie, je to mýtus. Čiapka chráni pred mrazom. Problémom môže byť materiál - zvoľte čiapku podšitú saténom, aby sa vlasy nelámali."
        }
      ]
    },
    {
      id: "3",
      slug: "balayage-vs-ombre-rozdiel",
      title: "Balayage vs Ombre: Definitívny sprievodca rozdielmi",
      subtitle: "Balayage vs Ombre – večná dilema klientiek. Zistite presný rozdiel medzi týmito technikami, ich výhody, ceny a ktorá sa hodí pre váš typ vlasov.",
      perex: "Plánujete zosvetlenie, no neviete si vybrať? Balayage vs Ombre je najčastejšia otázka v našom salóne. Kým jedna technika ponúka jemný 'sun-kissed' vzhľad, druhá sľubuje dramatický prechod. Spoznajte históriu, rozdiely a vyberte si to pravé pre vás.",
      content: [
        {
          type: 'paragraph',
          text: 'Keď príde reč na moderné farbenie vlasov, dva pojmy dominujú konverzáciám viac než čokoľvek iné: <strong>Balayage vs Ombre</strong>. Hoci sociálne siete ako Instagram, Pinterest a TikTok sú plné inšpirácií, pre bežného človeka je často takmer nemožné rozoznať, na čo sa vlastne pozerá. Je to Balayage? Je to Ombre? Alebo Sombre? Či len vyrastená farba?'
        },
        {
          type: 'paragraph',
          text: 'V <strong>PAPI HAIR DESIGN</strong> veríme, že informovaná klientka je spokojná klientka. Preto sme pre vás pripravili tohto ultimátneho, viac ako 800-slovného sprievodcu, ktorý raz a navždy vyjasní technické aj vizuálne rozdiely medzi týmito dvoma gigantmi hair stylingu. Správny výber totiž môže úplne zmeniť to, ako často budete musieť chodiť do salónu a koľko času strávite údržbou.'
        },
        {
          type: 'heading',
          text: '1. Čo je to Balayage? (Umenie prirodzenosti)'
        },
        {
          type: 'paragraph',
          text: 'Slovo <strong>Balayage</strong> (čítaj "balijáž") pochádza z francúzskeho slovesa "balayer", čo v preklade znamená zametať alebo maľovať. A presne o to ide. Pri riešení dilemy <strong>Balayage vs Ombre</strong> je kľúčové pochopiť, že Balayage je TECHNIKA nanášania farby, nie len výsledný vzhľad.'
        },
        {
          type: 'paragraph',
          text: 'Kaderník pri nej "maľuje" zosvetľovač na povrch vlasov voľnou rukou, zvyčajne bez použitia tradičných fólií (hoci moderné metódy ako Foilayage ich využívajú pre dosiahnutie vyššieho jasu). Predstavte si maliara s plátnom. Výsledkom je mäkký, mimoriadne prirodzený prechod bez ostrých línií.'
        },
        {
          type: 'heading-level-3',
          text: 'História Balayage'
        },
        {
          type: 'paragraph',
          text: 'Táto technika vznikla v Paríži v 70. rokoch, no skutočný boom zažila až v 90. rokoch v USA a celosvetovo explodovala okolo roku 2010 vďaka celebrítam ako Sarah Jessica Parker či Gisele Bündchen. Jej cieľom je imitovať to, čo robí slnko s detskými vlasmi v lete – vytiahne len niektoré pramene, najmä okolo tváre a na koncoch.'
        },
        {
          type: 'heading',
          text: '2. Čo je to Ombre? (Odvaha a kontrast)'
        },
        {
          type: 'paragraph',
          text: 'Na druhej strane ringu v súboji <strong>Balayage vs Ombre</strong> stojí Ombre. Toto slovo tiež pochádza z francúzštiny a znamená "tieň" alebo "odtieň". Na rozdiel od Balayage, Ombre je vizuálny ŠTÝL alebo VZHĽAD. Charakterizuje ho tmavý vrch (korienky) a výrazne svetlé konce.'
        },
        {
          type: 'paragraph',
          text: 'Prechod pri klasickom Ombre je zvyčajne oveľa viac horizontálny a viditeľnejší. Kým Balayage sa snaží o vertikálnosť a neviditeľné splynutie, Ombre sa nebojí priznať farbu. Je to ideálna voľba pre ženy, ktoré chcú, aby bola ich zmena viditeľná na prvý pohľad. Pôvodne to bol trend "vyrastených korienkov", ktorý sa premenil na módnu záležitosť.'
        },
        {
          type: 'paragraph',
          text: 'Existuje aj jemnejšia verzia zvaná <strong>Sombre</strong> (Soft Ombre), kde je kontrast medzi tmavým vrchom a svetlým spodkom menej dramatický a prechod je plynulejší.'
        },
        {
          type: 'heading',
          text: '3. Balayage vs Ombre: Hlavné technické rozdiely'
        },
        {
          type: 'paragraph',
          text: 'Stále váhate? Poďme si to rozobrať na drobné v priamom porovnaní:'
        },
        {
          type: 'list',
          items: [
            '<strong>Spôsob aplikácie:</strong> Balayage je vertikálne maľovanie jednotlivých prameňov pre 3D efekt. Ombre je horizontálne prechádzanie z tmy do svetla (tzv. color blocking).',
            '<strong>Odrasty (Údržba):</strong> Balayage je kráľovná nízkej údržby. Keďže svetlá farba nezačína priamo pri hlave a je nepravidelná, odrasty nie sú vidieť. Návšteva salónu stačí raz za 4-6 mesiacov. Ombre vydrží tiež dlho, ale posuv línie prechodu nadol môže časom vyzerať len ako zanedbané odrastené vlasy, ak nie je urobený správne.',
            '<strong>Dĺžka vlasov:</strong> Balayage sa dá robiť aj na veľmi krátke vlasy (pixie, mikádo), kde pridáva textúru. Ombre vyžaduje istú dĺžku (aspoň po plecia/lopatky), aby mal farebný prechod priestor vyniknúť.'
          ]
        },
        {
          type: 'heading',
          text: '4. Ktorá technika je pre vás tá pravá?'
        },
        {
          type: 'paragraph',
          text: 'Pri rozhodovaní <strong>Balayage vs Ombre</strong> zvážte svoj životný štýl, rozpočet a typ vlasov. Položte si otázku: Ste typ, ktorý chce chodiť ku kaderníkovi každých 6 týždňov, alebo chcete mať pokoj pol roka?'
        },
        {
          type: 'paragraph',
          text: '<strong>Vyberte si Balayage, ak:</strong> Chcete prirodzenosť, máte radi svoje prirodzené vlasy a chcete ich len "rozbiť" svetlom, neznášate viditeľné odrasty a hľadáte niečo, čo opticky zväčší objem vlasov.<br><br><strong>Vyberte si Ombre, ak:</strong> Máte radi výrazný a odvážny štýl, chcete si ponechať svoju prirodzenú farbu pri tvári (nemusíte riešiť obočie), ale chcete blond konce, a máte dostatočne dlhé vlasy na to, aby efekt vynikol.'
        },
        {
          type: 'heading-level-3',
          text: 'Starostlivosť po odfarbovaní'
        },
        {
          type: 'paragraph',
          text: 'Nech už vo vašom prípade vyhrá Balayage alebo Ombre, musíte si uvedomiť jednu vec: obidve techniky takmer vždy zahŕňajú odfarbovanie (bielenie) vlasov. Odfarbením sa z vlasu odstraňuje pigment, čo ho môže oslabiť a vysušiť. Vlasy budú "smädné". Bez správnej domácej starostlivosti bude aj tá najkrajšia salónna farba po mesiaci vyzerať ako suchá slama.'
        },
        {
          type: 'heading-level-4',
          text: 'Čomu sa vyhnúť po farbení?'
        },
        {
          type: 'list',
          items: [
            '<strong>Umývaniu vlasov prvých 48 hodín:</strong> Nechajte pigment a kutikulu ustáliť sa po chemickom procese.',
            '<strong>Horúcej vode:</strong> Vymýva "Toner" (Gloss) a otvára vlas, čím spôsobuje krepovatenie. Umývajte vlažnou vodou.',
            '<strong>Sulfátovým šampónom:</strong> Sú príliš agresívne a rýchlo vymývajú drahú farbu. Investujte do šampónov pre farbené vlasy.'
          ]
        },
        {
          type: 'tip-box',
          data: 'Náš tip: Pri Balayage aj Ombre odporúčame chodiť medzi veľkými farbeniami aspoň na službu "Glossing" (tónovanie). Oživí to farbu, zneutralizuje žlté tóny, dodá oslnivý lesk a nestojí to toľko času ani peňazí ako plné farbenie.'
        },
        {
          type: 'paragraph',
          text: 'Dúfame, že sme vám dilemu <strong>Balayage vs Ombre</strong> pomohli definitívne vyriešiť. Nezabudnite, že zosvetlené vlasy vyžadujú špeciálnu starostlivosť – <a href="/blog/starostlivost-o-vlasy-v-zime" class="text-gold font-semibold hover:underline">prečítajte si našich 7 tipov na zimnú starostlivosť o vlasy</a>. Ak si stále nie ste istá, ktorá technika sa hodí k vašej pleti a typu tváre, v PAPI HAIR DESIGN sme tu pre vás. <a href="/kontakt" class="text-gold font-semibold hover:underline">Objednajte sa na bezplatnú konzultáciu</a> a my posúdime kvalitu vašich vlasov a navrhneme riešenie na mieru.'
        }
      ],
      imageUrl: "assets/images/blog/balayage-vs-ombre.png",
      author: "Róbert Papcun",
      authorRole: "Expert Colorist",
      date: "2025-12-28",
      readingTime: 8,
      tags: ["balayage vs ombre", "zosvetľovanie vlasov", "kaderníctvo košice", "rozdiel balayage ombre", "sombre", "melír"],
      faqs: [
        {
          question: "Aký je hlavný rozdiel medzi Balayage a Ombre?",
          answer: "Balayage je technika 'maľovania' vertikálnych prameňov pre prirodzený efekt. Ombre je štýl s horizontálnym prechodom z tmavej do svetlej farby."
        },
        {
          question: "Ktorá technika je náročnejšia na údržbu?",
          answer: "Ombre vyžaduje častejšiu údržbu, keďže línia odrastu sa posúva. Balayage má 'neviditeľné' odrasty a stačí ju obnoviť raz za 4-6 mesiacov."
        },
        {
          question: "Je balayage vhodná aj pre krátke vlasy?",
          answer: "Áno, Balayage vyzerá skvele aj na krátkych strihoch ako Bob alebo Pixie, kde dodáva textúru a hĺbku."
        }
      ]
    }
  ];
  private readonly CACHE_EXPIRY = 3600000; // 1 hodina v ms

  private setCache<T>(key: string, data: T): void {
    const item: CacheItem<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(item));
  }

  private getCache<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item: CacheItem<T> = JSON.parse(itemStr);
    if (this.isExpired(item.timestamp)) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_EXPIRY;
  }

  /** Vráti všetky príspevky (zoradené podľa dátumu zostupne) */
  getAllPosts(): BlogPost[] {
    const cached = this.getCache<BlogPost[]>('blog_posts');
    if (cached) return cached;

    const posts = [...this.posts].sort((a, b) => (a.date < b.date ? 1 : -1));
    this.setCache('blog_posts', posts);
    return posts;
  }

  /** Nájde príspevok podľa slug */
  getPostBySlug(slug: string): BlogPost | undefined {
    const cached = this.getCache<BlogPost>(`blog_post_${slug}`);
    if (cached) return cached;

    const post = this.posts.find((p) => p.slug === slug);
    if (post) this.setCache(`blog_post_${slug}`, post);
    return post;
  }

  /** Vráti nasledujúci príspevok */
  getNextPost(slug: string): BlogPost | undefined {
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.slug === slug);
    if (index === -1 || index === 0) return undefined;
    return posts[index - 1];
  }

  /** Vráti predchádzajúci príspevok */
  getPrevPost(slug: string): BlogPost | undefined {
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.slug === slug);
    if (index === -1 || index === posts.length - 1) return undefined;
    return posts[index + 1];
  }

  /** Vypočíta čas čítania na základe počtu slov (200 slov/minútu) */
  calculateReadingTime(content: string | ContentBlock[]): number {
    let textContent = '';

    if (typeof content === 'string') {
      textContent = content.replace(/<[^>]*>/g, "");
    } else {
      // Ak je to ContentBlock[], spojíme texty z blokov
      textContent = content
        .map(block => block.text || block.data || '')
        .join(' ');
    }

    const wordCount = textContent
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return Math.ceil(wordCount / 200);
  }

  /** Nájde súvisiace príspevky na základe spoločných tagov */
  getRelatedPosts(slug: string, limit = 3): BlogPost[] {
    const currentPost = this.getPostBySlug(slug);
    if (!currentPost) return [];

    return this.posts
      .filter((p) => p.slug !== slug)
      .map((p) => ({
        post: p,
        commonTagsCount: p.tags.filter((tag) => currentPost.tags.includes(tag))
          .length,
      }))
      .filter((item) => item.commonTagsCount > 0)
      .sort((a, b) => b.commonTagsCount - a.commonTagsCount)
      .slice(0, limit)
      .map((item) => item.post);
  }

  /** Načíta komentáre pre konkrétny príspevok (Mock) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getComments(_postSlug: string): Observable<Comment[]> {
    return from(Promise.resolve([])); // Return empty list for now
  }

  /** Pridá nový komentár (Mock) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addComment(_comment: Omit<Comment, 'id'>): Observable<string> {
    return from(Promise.resolve('mock-id'));
  }

  /** Vymaže komentár podľa ID (Mock) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteComment(_commentId: string): Observable<void> {
    return from(Promise.resolve());
  }

  /** Vymaže celú cache */
  clearCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('blog_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  /** Vymaže cache pre konkrétny príspevok */
  invalidatePost(slug: string): void {
    localStorage.removeItem(`blog_post_${slug}`);
  }

  /** Vymaže cache pre všetky príspevky */
  invalidateAllPosts(): void {
    localStorage.removeItem('blog_posts');
  }
}
