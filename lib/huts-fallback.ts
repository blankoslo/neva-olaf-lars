/**
 * Static snapshot of well-known Norwegian DNT huts.
 * Used as fallback when the ut.no API is unavailable.
 * Data may be outdated — coordinates and bed counts are approximate.
 */

export type HutSnapshot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  beds: number | null;
  serviceLevel: string | null;
  dnt: boolean;
  url: string;
};

export const FALLBACK_HUTS: HutSnapshot[] = [
  { id: "f-1", name: "Finse 1222", lat: 60.5966, lon: 7.5069, beds: 120, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10071" },
  { id: "f-2", name: "Rondvassbu", lat: 62.0028, lon: 9.8432, beds: 100, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10041" },
  { id: "f-3", name: "Gjendebu", lat: 61.4833, lon: 8.6042, beds: 86, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10061" },
  { id: "f-4", name: "Memurubu", lat: 61.5167, lon: 8.8333, beds: 100, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10062" },
  { id: "f-5", name: "Gjendesheim", lat: 61.5000, lon: 8.8667, beds: 110, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10063" },
  { id: "f-6", name: "Glitterheim", lat: 61.7167, lon: 8.4833, beds: 62, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10064" },
  { id: "f-7", name: "Leirvassbu", lat: 61.5167, lon: 8.6167, beds: 95, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10065" },
  { id: "f-8", name: "Spiterstulen", lat: 61.6333, lon: 8.3833, beds: 80, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10066" },
  { id: "f-9", name: "Fondsbu", lat: 61.5667, lon: 8.4167, beds: 50, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10067" },
  { id: "f-10", name: "Eidsbugarden", lat: 61.4333, lon: 8.5333, beds: 66, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10068" },
  { id: "f-11", name: "Bessheim", lat: 61.6167, lon: 8.6667, beds: 55, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10069" },
  { id: "f-12", name: "Torfinnsbu", lat: 61.4500, lon: 8.5500, beds: 40, serviceLevel: "Selvbetjent", dnt: true, url: "https://ut.no/hytte/10070" },
  { id: "f-13", name: "Stavali", lat: 60.1667, lon: 7.6667, beds: 32, serviceLevel: "Selvbetjent", dnt: true, url: "https://ut.no/hytte/10072" },
  { id: "f-14", name: "Sprongdalsbu", lat: 61.8333, lon: 8.5000, beds: 18, serviceLevel: "Selvbetjent", dnt: true, url: "https://ut.no/hytte/10073" },
  { id: "f-15", name: "Trollsteinhytta", lat: 61.9167, lon: 9.5833, beds: 15, serviceLevel: "Selvbetjent", dnt: true, url: "https://ut.no/hytte/10074" },
  { id: "f-16", name: "Grotli fjellstue", lat: 61.9167, lon: 7.8500, beds: 60, serviceLevel: "Betjent", dnt: false, url: "https://ut.no/hytte/10075" },
  { id: "f-17", name: "Turtagrø", lat: 61.5500, lon: 7.7500, beds: 80, serviceLevel: "Betjent", dnt: false, url: "https://ut.no/hytte/10076" },
  { id: "f-18", name: "Juvasshytta", lat: 61.6750, lon: 8.3667, beds: 30, serviceLevel: "Betjent", dnt: false, url: "https://ut.no/hytte/10077" },
  { id: "f-19", name: "Reinheim", lat: 62.1167, lon: 9.7167, beds: 20, serviceLevel: "Selvbetjent", dnt: true, url: "https://ut.no/hytte/10078" },
  { id: "f-20", name: "Bjørnhollia", lat: 61.9833, lon: 9.7000, beds: 28, serviceLevel: "Betjent", dnt: true, url: "https://ut.no/hytte/10079" },
];
