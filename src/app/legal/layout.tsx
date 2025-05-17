import { Main } from "~/components/main";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Main>{children}</Main>;
}
