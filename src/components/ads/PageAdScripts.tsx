import Script from "next/script";

export default function PageAdScripts() {
  return (
    <>
      <Script
        src="https://cmp.gatekeeperconsent.com/min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
      <Script
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
      <Script src="//www.ezojs.com/ezoic/sa.min.js" strategy="beforeInteractive" async />
      <Script id="ezstandalone-init" strategy="beforeInteractive">
        {`window.ezstandalone = window.ezstandalone || {};
ezstandalone.cmd = ezstandalone.cmd || [];`}
      </Script>
      <Script src="//ezoicanalytics.com/analytics.js" strategy="beforeInteractive" />
    </>
  );
}
