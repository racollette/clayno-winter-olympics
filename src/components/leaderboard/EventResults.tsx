import {
  type Result,
  type Event,
  type Dino,
  type User,
  type Discord,
  type Twitter,
  type Telegram,
  type Wallet,
} from "@prisma/client";
import Image from "next/image";
import { shortAccount, truncateAccount } from "~/utils/addresses";
import { extractProfileFromUser } from "~/utils/wallet";
import { handleUserPFPDoesNotExist } from "~/utils/images";

type EventResultsProps = {
  event: Event & {
    results: (Result & {
      dino: Dino | null;
      user: User & {
        discord: Discord | null;
        twitter: Twitter | null;
        telegram: Telegram | null;
        wallets: Wallet[];
      };
    })[];
  };
  name?: boolean;
  reverse?: boolean;
  dino?: boolean;
};

export const EventResults = ({
  event,
  name = false,
  reverse = false,
  dino = true,
}: EventResultsProps) => {
  const results = reverse ? event.results.slice().reverse() : event.results;

  return (
    <div className="flex flex-col items-center justify-center gap-4 overflow-x-scroll rounded-lg bg-blue-950 p-3 font-clayno text-xs md:overflow-auto md:p-6 md:text-sm">
      {name && <div className="text-xl font-extrabold">{event.name}</div>}
      <table className="table-auto border-separate border-spacing-1 md:border-spacing-2">
        <thead>
          <tr>
            <th className="items-center justify-center px-2 py-1 text-right md:px-4 md:py-2"></th>
            <th className="px-2 py-1 text-left md:px-4 md:py-2">Player</th>
            {dino && (
              <th className="px-2 py-1 text-left md:px-4 md:py-2">Clayno</th>
            )}
            <th className="whitespace-nowrap px-2 py-1 text-left md:px-4 md:py-2">
              {event.scoringType}
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, idx) => {
            const { username, userPFP, userHandle } = extractProfileFromUser(
              result.user
            );
            return (
              <tr key={result.id} className="align-middle">
                <td className="pl-2 md:pl-4">
                  <div className="text-right">{idx + 1}</div>
                </td>
                <td className="px-2 md:px-4">
                  <div className="flex items-center gap-2 ">
                    <div className="relative h-6 w-6 md:h-10 md:w-10">
                      <Image
                        src={
                          userPFP ??
                          `https://ui-avatars.com/api/?name=${result.user.defaultAddress}&background=random`
                        }
                        alt={username as string}
                        fill
                        className="rounded-full"
                        onError={handleUserPFPDoesNotExist}
                      />
                    </div>
                    <div className="max-w-[75px] overflow-clip md:max-w-sm">
                      {userHandle
                        ? userHandle
                        : truncateAccount(result.user.defaultAddress)}
                    </div>
                  </div>
                </td>
                {dino && (
                  <td className="px-2 md:px-4">
                    <div className="relative flex h-10 w-10 items-center gap-2 md:h-14 md:w-14">
                      <Image
                        src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${result?.dino?.gif}`}
                        alt={result?.dino?.name as string}
                        fill
                        className="rounded-xl"
                      />
                      {/* <div className="max-w-xs">
                                      {result?.dino?.name.split(" ")[1]}
                                    </div> */}
                    </div>
                  </td>
                )}

                <td className="px-2 md:px-4">
                  <div className="max-w-xs">{result.score.toFixed(2)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
