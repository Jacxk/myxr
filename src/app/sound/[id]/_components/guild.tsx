import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function Guild({
  name,
  image,
}: Readonly<{ name: string; image?: string | null }>) {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <Avatar>
        <AvatarImage
          className="w-8 rounded-full"
          src={image + "?size=32"}
          alt={name}
          useNextImage
        />
        <AvatarFallback className="flex items-center justify-center text-xs">
          {name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </div>
  );
}
