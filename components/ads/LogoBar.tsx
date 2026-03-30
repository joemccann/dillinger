"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    _bsa?: {
      init: (
        type: string,
        zoneKey: string,
        placement: string,
        options: Record<string, string>
      ) => void;
    };
  }
}

const AD_ZONE_KEY = "CWBDC2QM";
const AD_PLACEMENT = "placement:dillingerio-logobar";
const AD_TEMPLATE = `
<a href="##statlink##" class="native-flex">
    <div class="native-sponsor">Ad</div>
    <div class="native-img" style="background-color: ##backgroundColor##"><img src="##logo##"></div>
    <div class="native-desc"><strong>##company##</strong> — ##description##</div>
</a>
`;

function initAd() {
  if (window._bsa) {
    window._bsa.init("custom", AD_ZONE_KEY, AD_PLACEMENT, {
      target: "#logobar",
      template: AD_TEMPLATE,
    });
  }
}

export function LogoBar() {
  useEffect(() => {
    initAd();
  }, []);

  return (
    <>
      <Script
        src="//m.servedby-buysellads.com/monetization.js"
        strategy="lazyOnload"
        onLoad={initAd}
      />
      <div id="logobar" />
    </>
  );
}
