import Link from "next/link";
import Image from "next/image";

/* Archive — missing page */
export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-envelope">
        <Image
          src="/images/envelope-404.png"
          alt="An envelope with a letter tucked inside"
          width={681}
          height={615}
          sizes="(max-width: 720px) 90vw, 640px"
          priority
        />
        <div className="not-found-copy">
          <h1 id="not-found-title" className="not-found-title">
            LOST TO THE ARCHIVES
          </h1>
          <p className="not-found-subtext">This page has wandered off the map.</p>
        </div>
      </div>
      <Link className="cr-cta not-found-link" href="/">
        Return home ✦
      </Link>
    </main>
  );
}
