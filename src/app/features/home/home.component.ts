import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";
import { SeoService } from "../../core/services/seo.service";
import { ServiceCardsComponent } from "../../shared/components/service-cards/service-cards.component";
import { SALON_CONTACT } from "../../core/config/salon-contact";

interface Feature {
  icon: "globe" | "sparkles" | "leaf" | "flask" | "bolt" | "bag";
  title: string;
  text: string;
}

interface Faq {
  question: string;
  answer: string[];
  list?: string[];
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet, ServiceCardsComponent],
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly contact = SALON_CONTACT;

  /** Krátke dôveryhodné fakty pod hero – skenovateľné namiesto vety s bodkami. */
  readonly highlights = [
    { value: "15+", label: "rokov praxe" },
    { value: "GOLD", label: "ambasádor Haircare" },
    { value: "24/7", label: "online rezervácie" },
  ] as const;

  readonly credentials = [
    "Účastník zahraničných školení a kongresov",
    "Finalista a víťaz domácich i zahraničných súťaží",
    "Vlasové šou, módne prehliadky a kampane",
    "Školiteľ dámskych a pánskych strihov",
  ] as const;

  readonly goldFeatures: Feature[] = [
    { icon: "globe", title: "Medzinárodná kvalita", text: "Škandinávska precíznosť a svetové štandardy." },
    { icon: "sparkles", title: "Prémiové produkty", text: "Exkluzívna starostlivosť pre vaše vlasy." },
    { icon: "leaf", title: "Udržateľnosť", text: "Zložky výlučne z obnoviteľných zdrojov." },
  ];

  readonly productCategories: Feature[] = [
    { icon: "flask", title: "Šampóny", text: "Pre všetky typy vlasov." },
    { icon: "bolt", title: "Kondicionéry", text: "Hĺbková výživa a lesk." },
    { icon: "bag", title: "Styling", text: "Pre dokonalý účes každý deň." },
  ];

  readonly faqs: Faq[] = [
    {
      question: "Čo je PAPI HAIR DESIGN v Košiciach?",
      answer: [
        "PAPI HAIR DESIGN je moderné kaderníctvo v Košiciach, kde sa stretáva precízne remeslo s kreatívnym dizajnom. Zakladateľ Róbert Papcun pracuje s vlasmi od roku 2009 a používa výhradne prémiové produkty Gold Haircare.",
      ],
    },
    {
      question: "Aké služby ponúkate?",
      answer: [
        "Dámske a pánske strihy (barber), farbenie vrátane balayage a ombré, spoločenské a svadobné účesy, keratínové kúry, regeneráciu poškodených vlasov a profesionálne produkty na domácu starostlivosť.",
      ],
    },
    {
      question: "Ako si objednám termín?",
      answer: [
        "Online cez rezervačný systém Bookio (24/7), telefonicky alebo osobne v salóne.",
        "Pri farbení, balayage a pri prvej návšteve u Róberta Papcuna je potrebná krátka konzultácia vopred – stačí zavolať.",
      ],
    },
    {
      question: "Aké sú otváracie hodiny?",
      answer: ["Pre večerné termíny alebo víkendové svadobné účesy nás kontaktujte vopred."],
      list: ["Pondelok – Piatok: 8:00 – 17:00", "Sobota: podľa objednávok", "Nedeľa: zatvorené"],
    },
    {
      question: "Koľko stojí strih?",
      answer: [
        "Detský pánsky strih od 15 €, pánsky strih od 19 €, dámsky strih od 30 €. Farbenie od 70 €, balayage od 150 €. Konečná cena závisí od dĺžky vlasov a spotreby materiálu – upresníme ju pri konzultácii.",
      ],
    },
    {
      question: "Robíte farbenie a balayage?",
      answer: [
        "Áno, špecializujeme sa na balayage, ombré, AirTouch a melír s farbami Gold Haircare. Každé farbenie začína diagnostikou vlasov a individuálnym poradenstvom.",
      ],
    },
    {
      question: "Pomôžete s poškodenými vlasmi?",
      answer: [
        "Áno. Ponúkame keratínové, proteínové a hydratačné kúry a poradíme s domácou starostlivosťou pre vlasy poškodené farbením, slnkom či tepelným stylingom.",
      ],
    },
  ];

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        "Kaderníctvo PAPI HAIR DESIGN v Košiciach – dámske strihy, farbenie a balayage, barber a regenerácia vlasov s produktmi Gold Haircare. Rezervácie online 24/7.",
    });
  }
}
