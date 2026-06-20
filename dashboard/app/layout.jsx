import "./globals.css";

export const metadata = {
  title: "Bus fare policies analysis | PolicyEngine",
  description:
    "Interactive dashboard costing a £1 bus fare cap and free bus travel for under-25s in the UK, using PolicyEngine UK microsimulation on the Enhanced FRS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
