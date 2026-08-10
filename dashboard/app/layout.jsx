import PolicyEngineFooter from "../src/components/PolicyEngineFooter";
import PolicyEngineHeader from "../src/components/PolicyEngineHeader";

import "./globals.css";

export const metadata = {
  title: "£2 bus fare cap analysis | PolicyEngine",
  description:
    "Source-backed analysis of the announced £2 bus fare cap for participating services in England outside London in 2027.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PolicyEngineHeader />
        {children}
        <PolicyEngineFooter />
      </body>
    </html>
  );
}
