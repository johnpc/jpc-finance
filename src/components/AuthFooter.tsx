import { Link } from "@aws-amplify/ui-react";
import { APP_STORE_URL } from "../lib/constants";

export function AuthFooter() {
  return (
    <div style={{ textAlign: "center" }}>
      <Link href={APP_STORE_URL} style={{ color: "white" }}>
        Download the app for iOS devices
      </Link>
    </div>
  );
}
