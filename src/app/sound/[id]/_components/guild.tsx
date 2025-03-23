import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function Guild({
  name,
  image,
}: Readonly<{ name: string; image: string }>) {
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <Avatar>
        <AvatarImage
          className="w-8 rounded-full"
          src={image + "?size=32"}
          alt={name}
        />
        <AvatarFallback delayMs={500}>
          {name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </div>
  );
}
