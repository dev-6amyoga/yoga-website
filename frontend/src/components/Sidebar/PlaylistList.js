import { Divider, Spacer } from "@geist-ui/core";
import { Box, Button, Typography, alpha } from "@mui/material";
import { useState } from "react";
import PlaylistItem from "./PlaylistItem";

export default function PlaylistList({
  name,
  desc,
  playlists,
  handleAddToQueue,
  showDetails,
  show,
  query,
}) {
  const [showIndex, setShowIndex] = useState(5);

  const handleShowMore = () => {
    setShowIndex(() => Math.min(showIndex + 5, 4 * playlists.length));
  };

  const handleShowLess = () => {
    setShowIndex(() => Math.max(showIndex - 5, 5));
  };

  const searchFilter = (p) => {
    if (query === undefined || query === null || !query) {
      return true;
    }

    if (query === "") {
      return true;
    }

    const name = p?.playlist_name ?? p?.schedule_name;

    return name ? name.toLowerCase().includes(query) : false;
  };

  //   return (
  //     <>
  //       {show ? (
  //         <>
  //           <Spacer h={2}></Spacer>
  //           {/* <div className="flex flex-col md:flex-row justify-between items-start w-full"> */}
  //           <Box
  //             sx={(theme) => ({
  //               mt: { xs: 8, sm: 2 },
  //               alignSelf: "center",
  //               //   height: { xs: 200, sm: 200 },
  //               width: "100%",
  //               backgroundSize: "cover",
  //               borderRadius: "10px",
  //               outline: "1px solid",
  //               outlineColor: alpha("#BFCCD9", 0.5),
  //               boxShadow: `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`,
  //               py: 2,
  //             })}
  //           >
  //             <div className="flex flex-col">
  //               <Typography variant="h6" component="h5">
  //                 {name}
  //               </Typography>
  //               <Typography variant="h6" component="h5">
  //                 {desc}
  //               </Typography>
  //             </div>
  //             {/* </div> */}

  //             <>
  //               {playlists && playlists.length > 0 ? (
  //                 <>
  //                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-4">
  //                     {playlists
  //                       ?.slice(0, showIndex)
  //                       .filter(searchFilter)
  //                       .map((playlist, idx) => (
  //                         <PlaylistItem
  //                           key={
  //                             (playlist?.playlist_name ??
  //                               playlist?.schedule_name) + idx
  //                           }
  //                           add={() => handleAddToQueue(playlist)}
  //                           deets={() => showDetails(playlist)}
  //                           playlist={playlist}
  //                           isFuture={false}
  //                         />
  //                       ))}
  //                   </div>
  //                   <div className="flex gap-2 py-4">
  //                     <Button onClick={handleShowMore} size="small">
  //                       Show More
  //                     </Button>
  //                     <Button onClick={handleShowLess} size="small">
  //                       Show Less
  //                     </Button>
  //                   </div>
  //                 </>
  //               ) : (
  //                 <p></p>
  //               )}
  //             </>
  //             <Spacer h={2}></Spacer>
  //           </Box>
  //         </>
  //       ) : (
  //         <></>
  //       )}
  //     </>
  //   );

  return (
    <>
      {show ? (
        <>
          <Spacer h={2}></Spacer>
          <div className="flex flex-col md:flex-row justify-between items-start w-full">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="pb-4 text-sm">{desc}</p>
            </div>
          </div>

          <>
            {playlists && playlists.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-4">
                  {playlists
                    ?.slice(0, showIndex)
                    .filter(searchFilter)
                    .map((playlist, idx) => (
                      <PlaylistItem
                        key={
                          (playlist?.playlist_name ?? playlist?.schedule_name) +
                          idx
                        }
                        add={() => handleAddToQueue(playlist)}
                        deets={() => showDetails(playlist)}
                        playlist={playlist}
                        isFuture={false}
                      />
                    ))}
                </div>
                <div className="flex gap-2 py-4">
                  <Button onClick={handleShowMore} size="small">
                    Show More
                  </Button>
                  <Button onClick={handleShowLess} size="small">
                    Show Less
                  </Button>
                </div>
              </>
            ) : (
              <p></p>
            )}
          </>
          <Spacer h={3}></Spacer>
          <Divider type="dark" />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
