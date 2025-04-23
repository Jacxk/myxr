"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export function FollowButton() {
  const [following, setFollowing] = useState(false);

  const onFollowButtonClick = () => {
    setFollowing((following) => !following);
  };

  return (
    <Button
      variant={following ? "default" : "outline"}
      className="flex w-32 rounded-full"
      onClick={onFollowButtonClick}
    >
      <Heart fill={following ? "black" : undefined} />
      {following ? "Following" : "Follow"}
    </Button>
  );
}
