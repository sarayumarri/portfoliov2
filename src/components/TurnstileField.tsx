"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef } from "react";

// test key that always passes on localhost
const TEST_SITE_KEY = "1x00000000000000000000AA";

type Props = { onToken: (token: string) => void };

const TurnstileField = forwardRef<TurnstileInstance, Props>(function TurnstileField({ onToken }, ref) {
  return (
    <div className="turnstile-wrap">
      <Turnstile
        ref={ref}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY}
        options={{ theme: "dark", size: "flexible", appearance: "interaction-only" }}
        onSuccess={onToken}
        onExpire={() => onToken("")}
        onError={() => onToken("")}
      />
    </div>
  );
});

export default TurnstileField;
