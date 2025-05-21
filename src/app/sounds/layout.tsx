import { Main } from "~/components/main";

export default function SoundPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Main>{children}</Main>;
}
