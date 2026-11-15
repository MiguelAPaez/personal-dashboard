"use client";

import { useEffect, useReducer, useRef } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import { youtubeId, type Demo } from "@/content/schema";
import { demoRegistry } from "@/demos/registry";
import { demoReducer, EMBED_TIMEOUT_MS, initialDemoState } from "./demo-state";
import styles from "./DemoFrame.module.css";

type Props = { demo: Demo; title: string };

const SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";

export function DemoFrame({ demo, title }: Props) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => dispatch({ type: "timeout" }), EMBED_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // The "Try it live" button unmounts on tap, so hand focus to the demo area instead of losing it.
  useEffect(() => {
    if (startedRef.current && state !== "idle") {
      startedRef.current = false;
      viewportRef.current?.focus();
    }
  }, [state]);

  const openUrl = demo.type === "embed" || demo.type === "youtube" ? demo.url : undefined;
  const address =
    demo.type === "embed"
      ? new URL(demo.url).host
      : demo.type === "video" || demo.type === "youtube"
        ? "video walkthrough"
        : "live demo";

  function start() {
    startedRef.current = true;
    dispatch({ type: "start" });
    if (demo.type === "component") dispatch({ type: "loaded" });
  }

  let body: React.ReactNode;
  if (demo.type === "video") {
    body = <video className={styles.media} src={demo.src} poster={demo.poster} controls playsInline preload="none" aria-label={title} />;
  } else if (demo.type === "youtube") {
    // youtube-nocookie avoids tracking cookies until the visitor presses play.
    // YouTube rejects embeds sent without a referrer, so keep strict-origin-when-cross-origin.
    body = (
      <iframe
        className={styles.media}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId(demo.url)}`}
        title={demo.title ?? title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  } else if (state === "idle") {
    body = (
      <div className={styles.idle}>
        {demo.poster && <Image className={styles.poster} src={demo.poster} alt="" fill sizes="(min-width: 64rem) 72rem, 100vw" />}
        <button type="button" className="btn btn--primary" onClick={start}>Try it live</button>
      </div>
    );
  } else if (state === "failed") {
    body = (
      <div className={styles.idle} role="alert">
        <p className={styles.message}>This demo can&apos;t be shown here.</p>
        {openUrl && <a className="btn btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab</a>}
      </div>
    );
  } else if (demo.type === "embed") {
    body = (
      <>
        <iframe className={styles.media} src={demo.url} title={demo.title ?? title} sandbox={SANDBOX} loading="lazy" onLoad={() => dispatch({ type: "loaded" })} />
        {state === "loading" && <p className={styles.loading} role="status">Loading demo…</p>}
      </>
    );
  } else {
    const Component = (demoRegistry as Partial<Record<string, ComponentType>>)[demo.id];
    body = Component ? <Component /> : <p className={styles.message}>This demo is not available right now.</p>;
  }

  return (
    <figure className={styles.frame}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots} />
        <span className={styles.address}>{address}</span>
      </div>
      <div ref={viewportRef} tabIndex={-1} role="group" aria-label={title} className={styles.viewport}>{body}</div>
      {openUrl && (
        <figcaption className={styles.caption}>
          {/* Browsers do not report a blocked frame, so this stays visible in every state. */}
          {demo.type === "youtube" ? (
            <a href={openUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
          ) : (
            <>Not loading? <a href={openUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a></>
          )}
        </figcaption>
      )}
    </figure>
  );
}
