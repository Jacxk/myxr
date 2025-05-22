import { api } from "~/trpc/server";
import { Filter, FilterItem } from "../../components/ui/filter-button-group";
import { AllSoundsClient } from "./_components/all-sounds-client";

export default async function SoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter: string }>;
}) {
  const { filter } = await searchParams;

  let defaultValue = filter;
  if (!filter) defaultValue = "new";

  const firstPage = await api.sound.getAllSounds({
    cursor: null,
    filter: defaultValue,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Explore Sounds</h1>
      <Filter
        className="flex-1 justify-end"
        defaultValue={defaultValue}
        filterOnUrl
      >
        <FilterItem value="new">New</FilterItem>
        <FilterItem value="trending">Trending</FilterItem>
        <FilterItem value="most-used">Most Used</FilterItem>
        <FilterItem value="most-liked">Most Liked</FilterItem>
      </Filter>
      <AllSoundsClient initialData={firstPage} />
    </div>
  );
}
