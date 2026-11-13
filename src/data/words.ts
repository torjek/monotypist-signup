// The words of the speed test: the 200 most used words of each language.
//
// Source and licence: taken from FrequencyWords by Hermit Dave
// (https://github.com/hermitdave/FrequencyWords, the 2018 lists counted on OpenSubtitles), whose
// content is licensed CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). These three
// lists are an adaptation and carry the same licence: the top of each list, without the halves of
// contractions ("don", "t"), interjections, single letters that are not words, and words that do
// not belong on a shop's page. The speed test credits the source on its page.
//
// To change a list, edit the words between the backticks; any spacing works.
import type { Lang } from './keyboard';

const lists: Record<Lang, string> = {
  us: `
    you i the to a it and that of is in what we me this he for my on have
    your do was no not be are know can with but all so just there here they like get she
    go if right out about up at him now one come well her how will got want think as see
    did good who why from let his yes when going time an back look us would them where were take
    then had or been our tell really man some say could by need something has too more way down make
    very never only people over because little please love should mean said sorry give off am thank any two even
    much doing sure thing these help first into anything still find life nothing sir day work their again maybe must
    before other wait stop call after talk away than thought home night put great those last better everything told new
    things always keep long years leave does money around name place ever feel guys father guy made old which big
    lot done hello nice believe girl someone fine thanks wanted kind coming house every through being course stay left dad
  `,
  da: `
    jeg det er du ikke at i en og har vi til på hvad med så for mig der han
    dig de den kan af var vil her et skal men ved om nu ja som hun nej min noget
    ham være bare din hvor må hvis os kom ud dem godt fra have ville se gør hvorfor alle lige
    op hende sig hvordan tror tak gøre kunne lad kommer havde eller meget nok få da ingen man gå går
    hvem bliver efter sagde tilbage når alt måske også jo mit ind vores hej mere hans skulle blev nogen lidt
    aldrig får siger selv far over to kun sådan ser dit jer igen mor sammen tager mand hele deres dag
    tage mine sige gjorde fordi end undskyld før været komme hold væk dette blive år ned helt fik tid denne
    god gang laver nogle sted mange folk dine tale mener tag ting siden finde altid brug stadig hjem virkelig fint
    anden lille kender andre elsker liv intet tog ret gerne uden vent hendes vel lide hjælpe set mod troede tre
    vide gik klar bedre vej gjort sidste sker samme vidste sin forstår arbejde hør første giv penge hjælp andet hen
  `,
  hu: `
    a nem az hogy és egy van ez is de meg csak ha mi én azt volt igen vagy kell
    el itt már még ne te ki mit ezt vagyok most jó tudom úgy miért akkor mint ő jól lesz
    nagyon nincs mert minden sem amit olyan rendben így be volna nekem le fel tudod ott lehet valami majd mindig
    talán maga köszönöm semmi hát aki amikor hol neki szóval neked ami kis tényleg hiszem elég valamit fog lenne igaz
    rá vele milyen ilyen ide biztos uram őket vissza nagy tudja ma egész sajnálom nos mikor vagyunk gyerünk vannak azért
    ember történt persze túl sok mondta két értem gyere szia valaki ahogy aztán pedig kicsit engem ezért velem arra voltam
    mondtam ugye mindent őt kellett új más semmit benne se nézd akarsz szerintem miatt kérem jobb veled akarok akarom erre
    több kérlek baj mindenki legyen kéne soha menj nap akar magát együtt rám senki szép át első mintha pár rossz
    este ezek minket után emberek téged róla szerint várj hogyan újra sosem láttam tudok tudtam ön kellene dolog akartam hittem
    mondja egyszer annyira igazán oda mondd amíg másik apa egyik lenni tessék megyek gondoltam tűnik lett néhány magam inkább érted
  `,
};

export const words = Object.fromEntries(
  Object.entries(lists).map(([lang, text]) => [lang, text.trim().split(/\s+/)]),
) as Record<Lang, string[]>;

export const wordsCredit = {
  name: 'FrequencyWords by Hermit Dave',
  href: 'https://github.com/hermitdave/FrequencyWords',
  licence: 'CC BY-SA 4.0',
  licenceHref: 'https://creativecommons.org/licenses/by-sa/4.0/',
};
