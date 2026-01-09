import { Link } from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";

export function AuthFooter() {
  return (
    <div style={{ textAlign: "center" }}>
      {Capacitor.getPlatform() === "ios" ? null : (
        <Link
          href="https://apps.apple.com/us/app/jpc-finance/id6499078837"
          style={{ color: "white" }}
        >
          Download the app for iOS devices
        </Link>
      )}
    </div>
  );
}
