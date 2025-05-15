import { Main } from "~/components/main";

export default function UserPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Main>{children}</Main>;
}
